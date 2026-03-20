import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Copy, Check, Radio, Shield, Clock, ArrowRight, Loader2 } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_MAP = {
  waiting: { label: "Awaiting Payment", color: "var(--gold)", icon: Clock },
  detected: { label: "Transaction Detected", color: "#F59E0B", icon: Radio },
  confirmed: { label: "Payment Confirmed", color: "var(--success)", icon: Check },
};

const LogEntry = ({ time, message, type }) => (
  <div className="flex items-start gap-3 font-mono text-xs">
    <span className="text-[var(--text-secondary)] shrink-0">[{time}]</span>
    <span
      className={
        type === "success"
          ? "text-[var(--success)]"
          : type === "warning"
          ? "text-[#F59E0B]"
          : "text-[var(--text-secondary)]"
      }
    >
      {message}
    </span>
  </div>
);

export default function PaymentPage() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("waiting");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const pollingRef = useRef(null);

  const addLog = useCallback((message, type = "info") => {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour12: false });
    setLogs((prev) => [...prev.slice(-19), { time, message, type }]);
  }, []);

  // Fetch application details
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

  // Poll payment status
  useEffect(() => {
    if (!application || paymentStatus === "confirmed") return;

    const checkPayment = async () => {
      try {
        const resp = await axios.get(`${API}/applications/${appId}/payment-status`);
        const data = resp.data;

        if (data.status === "detected" && paymentStatus !== "detected") {
          setPaymentStatus("detected");
          addLog("TRANSACTION DETECTED in mempool!", "warning");
          addLog(`TX amount: ${data.total_received} satoshis`, "warning");
          addLog("Waiting for blockchain confirmation...", "info");
        } else if (data.status === "confirmed") {
          setPaymentStatus("confirmed");
          addLog("PAYMENT CONFIRMED on blockchain.", "success");
          addLog(`Confirmations: ${data.confirmations}/6`, "success");
          addLog("Redirecting to confirmation...", "success");
          clearInterval(pollingRef.current);
          setTimeout(() => navigate(`/confirmation/${appId}`), 3000);
        } else {
          addLog(`Scanning blockchain... No transactions found yet.`, "info");
        }
      } catch (err) {
        addLog("Network check failed. Retrying...", "warning");
      }
    };

    checkPayment();
    pollingRef.current = setInterval(checkPayment, 15000);
    return () => clearInterval(pollingRef.current);
  }, [application, appId, paymentStatus, navigate, addLog]);

  const copyAddress = async () => {
    if (!application) return;
    try {
      await navigator.clipboard.writeText(application.btc_address);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = application.btc_address;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    addLog("BTC address copied to clipboard.", "info");
    setTimeout(() => setCopied(false), 2000);
  };

  const statusInfo = STATUS_MAP[paymentStatus];

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

  return (
    <div data-testid="payment-page" className="min-h-screen bg-[var(--bg-primary)]">
      <Header />

      <div className="pt-32 pb-24 md:pb-32">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-12"
          >
            <p className="text-[var(--gold)] text-xs tracking-[0.3em] uppercase font-body mb-4">
              Step 2 of 2 &middot; Registration Fee
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light text-[var(--text-primary)] leading-tight">
              Secure Your <span className="italic text-[var(--gold)]">Place</span>
            </h1>
          </motion.div>

          {/* Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Invoice Details */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <div className="border border-[var(--border-dark)] bg-[var(--bg-surface)] p-8 md:p-10 mb-8">
                <h3 className="font-heading text-2xl text-[var(--text-primary)] mb-6">
                  Application Summary
                </h3>
                <div className="space-y-4">
                  {[
                    ["Brand Name", application.brand_name],
                    ["Category", application.brand_category],
                    ["Contact", application.contact_person],
                    ["Email", application.brand_email],
                    ["Country", application.country],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-[var(--border-dark)]">
                      <span className="text-[var(--text-secondary)] text-xs tracking-[0.1em] uppercase font-body">{label}</span>
                      <span className="text-[var(--text-primary)] text-sm font-body">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-[var(--gold)]/20">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--gold)] text-xs tracking-[0.2em] uppercase font-body font-medium">
                      Registration Fee
                    </span>
                    <span className="text-[var(--text-primary)] text-2xl font-heading">
                      $10,000
                    </span>
                  </div>
                  <p className="text-[var(--text-secondary)] text-xs font-body mt-2">
                    Payable in Bitcoin (BTC) equivalent
                  </p>
                </div>
              </div>

              {/* Security Note */}
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

            {/* Right: Payment Terminal */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <div className="border border-[var(--border-dark)] bg-[#0A0A0A]">
                {/* Terminal Header */}
                <div className="px-6 py-4 border-b border-[var(--border-dark)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      data-testid="btc-payment-status"
                      className="w-2 h-2 rounded-full animate-pulse-gold"
                      style={{ backgroundColor: statusInfo.color }}
                    />
                    <span className="text-xs font-mono" style={{ color: statusInfo.color }}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <span className="text-[var(--text-secondary)] text-xs font-mono">
                    BLOCKCHAIN MONITOR
                  </span>
                </div>

                {/* BTC Address Display */}
                <div className="p-6 border-b border-[var(--border-dark)]">
                  <p className="text-[var(--text-secondary)] text-xs font-mono mb-3 tracking-wide">
                    SEND BITCOIN TO:
                  </p>
                  <div className="flex items-center gap-3 bg-[var(--bg-primary)] border border-[var(--border-dark)] p-4">
                    <code
                      data-testid="btc-address"
                      className="text-[var(--gold)] text-xs sm:text-sm font-mono flex-1 break-all select-all"
                    >
                      {application.btc_address}
                    </code>
                    <button
                      data-testid="copy-btc-address"
                      onClick={copyAddress}
                      className="shrink-0 p-2 border border-[var(--border-dark)] hover:border-[var(--gold)] transition-colors duration-300"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-[var(--success)]" />
                      ) : (
                        <Copy className="w-4 h-4 text-[var(--text-secondary)]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Live Activity Log */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Radio className="w-3 h-3 text-[var(--gold)]" strokeWidth={2} />
                    <span className="text-[var(--text-secondary)] text-xs font-mono tracking-wide">
                      LIVE ACTIVITY
                    </span>
                  </div>
                  <div
                    data-testid="activity-log"
                    className="bg-[var(--bg-primary)] border border-[var(--border-dark)] p-4 h-[260px] overflow-y-auto space-y-2"
                  >
                    {logs.map((log, i) => (
                      <LogEntry key={i} {...log} />
                    ))}
                    <div className="flex items-center gap-1 font-mono text-xs text-[var(--text-secondary)]">
                      <span className="terminal-cursor text-[var(--gold)]">_</span>
                    </div>
                  </div>
                </div>

                {/* Status Bar */}
                {paymentStatus === "confirmed" && (
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

              {/* Payment Instructions */}
              <div className="mt-8 space-y-4">
                <p className="text-[var(--text-secondary)] text-xs font-body leading-relaxed">
                  <strong className="text-[var(--text-primary)]">Instructions:</strong> Send the
                  equivalent of $10,000 USD in Bitcoin to the address shown above. The
                  transaction will be detected automatically. Please allow up to 30 minutes
                  for full blockchain confirmation.
                </p>
                <p className="text-[var(--text-secondary)] text-xs font-body leading-relaxed">
                  <strong className="text-[var(--text-primary)]">Important:</strong> Ensure you
                  send the exact amount from a single transaction. Multiple partial payments
                  may cause delays. For support, email{" "}
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
