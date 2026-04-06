import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Copy, Check, Radio, Shield, Clock, ArrowRight, Loader2, Home, AlertTriangle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TIMER_DURATION = 25 * 60;

// STRICT status map — only these exact string values are valid
const VALID_STATUSES = ["waiting", "detected", "confirmed"];

const STATUS_MAP = {
  waiting:   { label: "Awaiting Payment",       color: "var(--gold)",    icon: Clock  },
  detected:  { label: "Transaction Detected",    color: "#F59E0B",        icon: Radio  },
  confirmed: { label: "Payment Confirmed",       color: "var(--success)", icon: Check  },
};

const LogEntry = ({ time, message, type }) => (
  <div className="flex items-start gap-3 font-mono text-xs">
    <span className="text-[var(--text-secondary)] shrink-0">[{time}]</span>
    <span className={
      type === "success" ? "text-[var(--success)]" :
      type === "warning" ? "text-[#F59E0B]" :
      "text-[var(--text-secondary)]"
    }>
      {message}
    </span>
  </div>
);

export default function PaymentPage() {
  const { appId } = useParams();
  const navigate = useNavigate();

  const [application, setApplication]   = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("waiting");
  const [copied, setCopied]             = useState(false);
  const [loading, setLoading]           = useState(true);
  const [logs, setLogs]                 = useState([]);
  const [timeLeft, setTimeLeft]         = useState(TIMER_DURATION);
  const [expired, setExpired]           = useState(false);
  const [confirmedVerified, setConfirmedVerified] = useState(false); // NEW: must be true before redirect

  const pollingRef  = useRef(null);
  const timerRef    = useRef(null);
  const expiredRef  = useRef(false); // ref so polling closure sees latest value

  const addLog = useCallback((message, type = "info") => {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour12: false });
    setLogs((prev) => [...prev.slice(-19), { time, message, type }]);
  }, []);

  const stopAll = useCallback(() => {
    clearInterval(timerRef.current);
    clearInterval(pollingRef.current);
  }, []);

  // ── Countdown timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (expired || paymentStatus === "confirmed") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          clearInterval(pollingRef.current);
          expiredRef.current = true;
          setExpired(true);
          axios.post(`${API}/applications/${appId}/cancel`).catch(() => {});
          addLog("SESSION EXPIRED: Payment window closed.", "warning");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [appId, expired, paymentStatus, addLog]);

  // ── Fetch application ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchApp = async () => {
      try {
        const resp = await axios.get(`${API}/applications/${appId}`);
        setApplication(resp.data);
        addLog("Application loaded. Assigned BTC address retrieved.", "info");
        addLog("Initiating blockchain monitoring...", "info");
      } catch (err) {
        console.error("Failed to load application:", err);
        addLog("ERROR: Failed to load application data.", "warning");
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [appId, addLog]);

  // ── Payment polling ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!application || paymentStatus === "confirmed") return;

    const checkPayment = async () => {
      // Hard guard: never process if session expired
      if (expiredRef.current) {
        clearInterval(pollingRef.current);
        return;
      }

      try {
        const resp = await axios.get(`${API}/applications/${appId}/payment-status`);
        const data = resp.data;

        // ── STRICT VALIDATION ──────────────────────────────────────────────
        // Reject any response that doesn't have a valid, explicit status string
        const rawStatus = data?.status;

        if (!rawStatus || !VALID_STATUSES.includes(rawStatus)) {
          // Unknown or missing status — log it but DO NOT advance state
          addLog(`Scanning blockchain... No transactions found yet.`, "info");
          return;
        }

        // ── "detected" ─────────────────────────────────────────────────────
        if (rawStatus === "detected" && paymentStatus !== "detected") {
          // Must also have a real tx amount to be trusted
          const amount = data.total_received;
          if (!amount || Number(amount) <= 0) {
            addLog(`Signal received but amount unverified. Continuing to monitor...`, "warning");
            return;
          }
          setPaymentStatus("detected");
          addLog("TRANSACTION DETECTED in mempool!", "warning");
          addLog(`TX amount: ${amount} satoshis`, "warning");
          addLog("Waiting for blockchain confirmation...", "info");
          return;
        }

        // ── "confirmed" ────────────────────────────────────────────────────
        if (rawStatus === "confirmed") {
          // Must have confirmations >= 1 and a real tx hash to be trusted
          const confirmations = Number(data.confirmations);
          const txHash = data.tx_hash || data.txid || data.transaction_id;

          if (!confirmations || confirmations < 1) {
            addLog(`Confirmation signal received but 0 confirmations. Still waiting...`, "warning");
            return;
          }

          if (!txHash) {
            addLog(`Confirmation signal received but no TX hash. Verifying integrity...`, "warning");
            return;
          }

          // All checks passed — this is a real confirmed payment
          stopAll();
          setPaymentStatus("confirmed");
          setConfirmedVerified(true); // unlock the redirect button
          addLog("PAYMENT CONFIRMED on blockchain.", "success");
          addLog(`Confirmations: ${confirmations}`, "success");
          addLog(`TX Hash: ${String(txHash).slice(0, 16)}...`, "success");
          addLog("Redirecting to confirmation...", "success");
          setTimeout(() => navigate(`/confirmation/${appId}`), 3000);
          return;
        }

        // status === "waiting" — keep polling silently
        addLog(`Scanning blockchain... No transactions found yet.`, "info");

      } catch (err) {
        // Network error — log but do NOT advance status
        addLog("Network check failed. Retrying...", "warning");
      }
    };

    checkPayment();
    pollingRef.current = setInterval(checkPayment, 15000);
    return () => clearInterval(pollingRef.current);
  }, [application, appId, paymentStatus, navigate, addLog, stopAll]);

  const copyAddress = async () => {
    if (!application) return;
    try {
      await navigator.clipboard.writeText(application.btc_address);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = application.btc_address;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    addLog("BTC address copied to clipboard.", "info");
    setTimeout(() => setCopied(false), 2000);
  };

  const statusInfo = STATUS_MAP[paymentStatus] || STATUS_MAP.waiting;

  const formatTimer = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--gold)] animate-spin" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <p className="text-[var(--error)] font-body">Application not found.</p>
      </div>
    );
  }

  // ── Expired ──────────────────────────────────────────────────────────────
  if (expired) {
    return (
      <div data-testid="payment-expired" className="min-h-screen bg-[var(--bg-primary)]">
        <Header />
        <div className="pt-32 pb-24 min-h-screen flex items-center">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full">
            <div className="max-w-2xl mx-auto text-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="w-20 h-20 border-2 border-[var(--error)] mx-auto mb-10 flex items-center justify-center"
              >
                <AlertTriangle className="w-10 h-10 text-[var(--error)]" strokeWidth={1.5} />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}>
                <p className="text-[var(--error)] text-xs tracking-[0.3em] uppercase font-body mb-6">Session Expired</p>
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light text-[var(--text-primary)] leading-tight mb-6">
                  Payment Window <span className="italic text-[var(--error)]">Closed</span>
                </h1>
                <p className="text-[var(--text-secondary)] text-base md:text-lg font-body leading-relaxed max-w-lg mx-auto mb-8">
                  The 25-minute payment window has expired without a confirmed transaction.
                  Your application session has been cancelled for security purposes.
                  Please return to the homepage and submit a new application to try again.
                </p>
                <div className="border border-[var(--border-dark)] bg-[var(--bg-surface)] p-6 mb-10 max-w-md mx-auto">
                  <p className="text-[var(--text-secondary)] text-xs font-body leading-relaxed">
                    If you believe this is an error or have already sent a payment, please contact our support team immediately at{" "}
                    <a href="mailto:support@metbrandscout.co" className="text-[var(--gold)] hover:text-[var(--gold-hover)] transition-colors duration-300">
                      support@metbrandscout.co
                    </a>
                  </p>
                </div>
                <button
                  data-testid="expired-home-button"
                  onClick={() => navigate("/home")}
                  className="group inline-flex items-center gap-3 px-10 py-5 bg-[var(--gold)] text-[var(--bg-primary)] text-xs tracking-[0.2em] uppercase font-body font-semibold hover:bg-[var(--gold-hover)] transition-colors duration-500"
                >
                  <Home className="w-4 h-4" />
                  Return to Homepage
                </button>
              </motion.div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Main payment UI ──────────────────────────────────────────────────────
  return (
    <div data-testid="payment-page" className="min-h-screen bg-[var(--bg-primary)]">
      <Header />
      <div className="pt-32 pb-24 md:pb-32">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="mb-12">
            <p className="text-[var(--gold)] text-xs tracking-[0.3em] uppercase font-body mb-4">
              Step 2 of 2 &middot; Registration Fee
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light text-[var(--text-primary)] leading-tight">
              Secure Your <span className="italic text-[var(--gold)]">Place</span>
            </h1>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* ── Left: Invoice ── */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.2 }}>
              <div className="border border-[var(--border-dark)] bg-[var(--bg-surface)] p-8 md:p-10 mb-8">
                <h3 className="font-heading text-2xl text-[var(--text-primary)] mb-6">Application Summary</h3>
                <div className="space-y-4">
                  {[
                    ["Brand Name",  application.brand_name],
                    ["Category",    application.brand_category],
                    ["Contact",     application.contact_person],
                    ["Email",       application.brand_email],
                    ["Country",     application.country],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-[var(--border-dark)]">
                      <span className="text-[var(--text-secondary)] text-xs tracking-[0.1em] uppercase font-body">{label}</span>
                      <span className="text-[var(--text-primary)] text-sm font-body">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-[var(--gold)]/20">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--gold)] text-xs tracking-[0.2em] uppercase font-body font-medium">Registration Fee</span>
                    <span className="text-[var(--text-primary)] text-2xl font-heading">$10,000</span>
                  </div>
                  <p className="text-[var(--text-secondary)] text-xs font-body mt-2">Payable in Bitcoin (BTC) equivalent</p>
                </div>
              </div>

              <div className="border border-[var(--border-dark)] bg-[var(--bg-surface)] p-6 flex items-start gap-4">
                <Shield className="w-5 h-5 text-[var(--gold)] shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <h4 className="text-[var(--text-primary)] text-sm font-body font-medium mb-1">Secure Transaction</h4>
                  <p className="text-[var(--text-secondary)] text-xs font-body leading-relaxed">
                    All payments are monitored in real-time via the Bitcoin blockchain.
                    Your transaction will be verified automatically upon confirmation.
                    For assistance, contact support@metbrandscout.co
                  </p>
                </div>
              </div>
            </motion.div>

            {/* ── Right: Terminal ── */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.3 }}>
              <div className="border border-[var(--border-dark)] bg-[#0A0A0A]">

                {/* Terminal header */}
                <div className="px-6 py-4 border-b border-[var(--border-dark)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      data-testid="btc-payment-status"
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: statusInfo.color }}
                    />
                    <span className="text-xs font-mono" style={{ color: statusInfo.color }}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <span className="text-[var(--text-secondary)] text-xs font-mono">BLOCKCHAIN MONITOR</span>
                </div>

                {/* Countdown */}
                <div className="px-6 py-3 border-b border-[var(--border-dark)] bg-[var(--bg-primary)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[var(--text-secondary)]" strokeWidth={1.5} />
                      <span className="text-[var(--text-secondary)] text-[10px] font-mono tracking-wider">SESSION EXPIRES IN</span>
                    </div>
                    <span
                      data-testid="payment-countdown"
                      className="text-lg font-mono font-medium tracking-wider"
                      style={{ color: timeLeft <= 300 ? "var(--error)" : timeLeft <= 600 ? "#F59E0B" : "var(--gold)" }}
                    >
                      {formatTimer(timeLeft)}
                    </span>
                  </div>
                  <div className="mt-2 h-[2px] bg-[var(--border-dark)] overflow-hidden">
                    <div
                      className="h-full transition-all duration-1000 ease-linear"
                      style={{
                        width: `${(timeLeft / TIMER_DURATION) * 100}%`,
                        backgroundColor: timeLeft <= 300 ? "var(--error)" : timeLeft <= 600 ? "#F59E0B" : "var(--gold)",
                      }}
                    />
                  </div>
                </div>

                {/* BTC address + QR */}
                <div className="p-6 border-b border-[var(--border-dark)]">
                  <p className="text-[var(--text-secondary)] text-xs font-mono mb-4 tracking-wide">SEND BITCOIN TO:</p>
                  <div data-testid="btc-qr-code" className="flex justify-center mb-5">
                    <div className="p-4 bg-white rounded-sm relative">
                      <QRCodeSVG
                        value={`bitcoin:${application.btc_address}?amount=0.15`}
                        size={180}
                        bgColor="#FFFFFF"
                        fgColor="#050505"
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                  </div>
                  <p className="text-[var(--text-secondary)] text-[10px] font-mono text-center mb-4 tracking-wider">SCAN QR CODE WITH YOUR WALLET</p>
                  <div className="flex items-center gap-3 bg-[var(--bg-primary)] border border-[var(--border-dark)] p-4">
                    <code data-testid="btc-address" className="text-[var(--gold)] text-xs sm:text-sm font-mono flex-1 break-all select-all">
                      {application.btc_address}
                    </code>
                    <button
                      data-testid="copy-btc-address"
                      onClick={copyAddress}
                      className="shrink-0 p-2 border border-[var(--border-dark)] hover:border-[var(--gold)] transition-colors duration-300"
                    >
                      {copied
                        ? <Check className="w-4 h-4 text-[var(--success)]" />
                        : <Copy className="w-4 h-4 text-[var(--text-secondary)]" />}
                    </button>
                  </div>
                </div>

                {/* Activity log */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Radio className="w-3 h-3 text-[var(--gold)]" strokeWidth={2} />
                    <span className="text-[var(--text-secondary)] text-xs font-mono tracking-wide">LIVE ACTIVITY</span>
                  </div>
                  <div
                    data-testid="activity-log"
                    className="bg-[var(--bg-primary)] border border-[var(--border-dark)] p-4 h-[260px] overflow-y-auto space-y-2"
                  >
                    {logs.map((log, i) => <LogEntry key={i} {...log} />)}
                    <div className="flex items-center gap-1 font-mono text-xs text-[var(--text-secondary)]">
                      <span className="text-[var(--gold)]">_</span>
                    </div>
                  </div>
                </div>

                {/* Confirmed CTA — only shows when confirmedVerified is true */}
                {confirmedVerified && (
                  <div className="px-6 pb-6">
                    <button
                      data-testid="proceed-confirmation"
                      onClick={() => navigate(`/confirmation/${appId}`)}
                      className="group w-full flex items-center justify-center gap-3 px-8 py-4 bg-[var(--success)] text-white text-xs tracking-[0.2em] uppercase font-body font-semibold hover:bg-[var(--success)]/90 transition-colors duration-300"
                    >
                      Proceed to Confirmation
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="mt-8 space-y-4">
                <p className="text-[var(--text-secondary)] text-xs font-body leading-relaxed">
                  <strong className="text-[var(--text-primary)]">Instructions:</strong> Send the equivalent of $10,000 USD in Bitcoin to the address shown above. The transaction will be detected automatically. Please allow up to 30 minutes for full blockchain confirmation.
                </p>
                <p className="text-[var(--text-secondary)] text-xs font-body leading-relaxed">
                  <strong className="text-[var(--text-primary)]">Important:</strong> Ensure you send the exact amount from a single transaction. Multiple partial payments may cause delays. For support, email{" "}
                  <a href="mailto:support@metbrandscout.co" className="text-[var(--gold)] hover:text-[var(--gold-hover)] transition-colors duration-300">
                    support@metbrandscout.co
                  </a>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}