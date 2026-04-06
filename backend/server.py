from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging early so logger is available everywhere
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

BTC_ADDRESSES = [
    "bc1qwfjd8edk2dq57d69gp9z2cgx8lwvpk7y30h9c3",
    "bc1q8ygup9nluhka53ze4m2rn7pka02qftrlv7fktu",
    "bc1qmmhhsarn0zr9jf0g756l4j0a2tqn2l44xqmmjr",
    "bc1q5gslkglhld4mayp0fkg99te3jqmxq5r2kwe7ez",
    "bc1qr8qrrv339wvl0l9pfxmu6j0zrczxpgkez2al75",
]

# Models
class ApplicationCreate(BaseModel):
    brand_name: str
    brand_email: str
    brand_address: str
    brand_website: Optional[str] = ""
    brand_category: str
    year_founded: str
    contact_person: str
    contact_phone: str
    brand_description: str
    country: str

class ApplicationResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    brand_name: str
    brand_email: str
    brand_address: str
    brand_website: str
    brand_category: str
    year_founded: str
    contact_person: str
    contact_phone: str
    brand_description: str
    country: str
    btc_address: str
    payment_status: str
    created_at: str

class PaymentStatusResponse(BaseModel):
    status: str
    btc_address: str
    total_received: int
    tx_count: int
    confirmations: int
    required_amount_btc: float
    message: str


@api_router.get("/")
async def root():
    return {"message": "Met Gala Brand Scout API"}


@api_router.post("/applications", response_model=ApplicationResponse)
async def create_application(data: ApplicationCreate):
    # Smart BTC address rotation: pick the least-used address among pending apps
    pipeline = [
        {"$match": {"payment_status": "pending"}},
        {"$group": {"_id": "$btc_address", "count": {"$sum": 1}}},
    ]
    usage_counts = {addr: 0 for addr in BTC_ADDRESSES}
    async for doc in db.applications.aggregate(pipeline):
        if doc["_id"] in usage_counts:
            usage_counts[doc["_id"]] = doc["count"]

    min_count = min(usage_counts.values())
    least_used = [addr for addr, cnt in usage_counts.items() if cnt == min_count]
    btc_address = random.choice(least_used)

    app_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    doc = {
        "id": app_id,
        **data.model_dump(),
        "btc_address": btc_address,
        "payment_status": "pending",
        "created_at": now,
    }

    await db.applications.insert_one(doc)
    doc.pop("_id", None)
    return ApplicationResponse(**doc)


@api_router.get("/applications/{app_id}", response_model=ApplicationResponse)
async def get_application(app_id: str):
    doc = await db.applications.find_one({"id": app_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Application not found")
    return ApplicationResponse(**doc)


@api_router.get("/applications/{app_id}/payment-status", response_model=PaymentStatusResponse)
async def check_payment_status(app_id: str):
    doc = await db.applications.find_one({"id": app_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Application not found")

    btc_address = doc["btc_address"]
    total_received = 0
    tx_count = 0
    confirmations = 0
    status = "waiting"
    message = "Waiting for payment..."

    try:
        async with httpx.AsyncClient(timeout=10.0) as http_client:
            resp = await http_client.get(f"https://blockstream.info/api/address/{btc_address}")
            if resp.status_code == 200:
                addr_data = resp.json()
                chain_stats = addr_data.get("chain_stats", {})
                mempool_stats = addr_data.get("mempool_stats", {})

                funded_chain = chain_stats.get("funded_txo_sum", 0)
                funded_mempool = mempool_stats.get("funded_txo_sum", 0)
                total_received = funded_chain + funded_mempool
                tx_count = chain_stats.get("funded_txo_count", 0) + mempool_stats.get("funded_txo_count", 0)

                if funded_mempool > 0 and funded_chain == 0:
                    status = "detected"
                    message = "Transaction detected in mempool. Awaiting confirmation..."
                    confirmations = 0
                elif funded_chain > 0:
                    status = "confirmed"
                    message = "Payment confirmed on the blockchain."
                    confirmations = 6

                    if doc["payment_status"] != "confirmed":
                        await db.applications.update_one(
                            {"id": app_id},
                            {"$set": {"payment_status": "confirmed"}}
                        )
                else:
                    status = "waiting"
                    message = "Monitoring blockchain for incoming transactions..."
    except Exception as e:
        logger.error(f"Blockchain API error: {e}")
        status = "waiting"
        message = "Monitoring blockchain for incoming transactions..."

    return PaymentStatusResponse(
        status=status,
        btc_address=btc_address,
        total_received=total_received,
        tx_count=tx_count,
        confirmations=confirmations,
        required_amount_btc=0.15,
        message=message,
    )


@api_router.post("/applications/{app_id}/cancel")
async def cancel_application(app_id: str):
    doc = await db.applications.find_one({"id": app_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Application not found")
    if doc["payment_status"] == "confirmed":
        raise HTTPException(status_code=400, detail="Cannot cancel a confirmed application")
    await db.applications.update_one(
        {"id": app_id},
        {"$set": {"payment_status": "expired"}}
    )
    return {"status": "cancelled", "message": "Application expired due to payment timeout."}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
