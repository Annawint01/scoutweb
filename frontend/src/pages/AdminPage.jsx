import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const LOG_KEY       = "gk_access_log";
const ADMIN_PASSWORD = "Lunallister1$"; // ← change this to your own password

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleString("en-US", {
      timeZone: "America/New_York",
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    }) + " EST";
  } catch { return iso; }
};

const BADGE = {
  success: { label: "SUCCESS",  bg: "rgba(76,175,80,0.1)",  border: "rgba(76,175,80,0.35)",  text: "rgba(76,175,80,0.9)"  },
  failed:  { label: "FAILED",   bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.3)", text: "rgba(245,158,11,0.85)" },
  blocked: { label: "BLOCKED",  bg: "rgba(139,26,26,0.1)",  border: "rgba(139,26,26,0.35)", text: "rgba(220,60,60,0.9)"   },
};

export default function AdminPage() {
  const navigate = useNavigate();
  const [authed,    setAuthed]    = useState(false);
  const [password,  setPassword]  = useState("");
  const [pwError,   setPwError]   = useState(false);
  const [log,       setLog]       = useState([]);
  const [filter,    setFilter]    = useState("all");
  const [copied,    setCopied]    = useState(null);

  useEffect(() => {
    if (authed) {
      const raw = JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
      setLog([...raw].reverse()); // newest first
    }
  }, [authed]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
      setPassword("");
    }
  };

  const clearLog = () => {
    if (window.confirm("Clear all access logs? This cannot be undone.")) {
      localStorage.removeItem(LOG_KEY);
      setLog([]);
    }
  };

  const copyIP = (ip) => {
    navigator.clipboard.writeText(ip).catch(() => {});
    setCopied(ip);
    setTimeout(() => setCopied(null), 1500);
  };

  const exportCSV = () => {
    const rows = [
      ["Type", "Brand / Attempted", "IP Address", "Timestamp", "User Agent"],
      ...log.map(e => [e.type, e.brand || e.attempted || "", e.ip, formatDate(e.timestamp), e.ua || ""])
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "gatekeeper_log.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = filter === "all" ? log : log.filter(e => e.type === filter);
  const counts   = { success: log.filter(e=>e.type==="success").length, failed: log.filter(e=>e.type==="failed").length, blocked: log.filter(e=>e.type==="blocked").length };

  // ── Password gate ────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Montserrat', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400&family=Montserrat:wght@300;400;500&family=JetBrains+Mono:wght@300;400&display=swap');`}</style>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          style={{ width: "100%", maxWidth: 400, padding: "0 2rem" }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.55rem", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(197,160,89,0.5)", textAlign: "center", marginBottom: "2rem" }}>
            Met Council · Admin Access
          </p>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <input
              type="password"
              placeholder="Enter access code"
              value={password}
              onChange={e => { setPassword(e.target.value); setPwError(false); }}
              autoFocus
              style={{ background: "transparent", border: "none", borderBottom: `1px solid ${pwError ? "rgba(139,26,26,0.8)" : "rgba(197,160,89,0.3)"}`, outline: "none", padding: "0.75rem 0", color: "#F5F5F0", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9rem", letterSpacing: "0.1em", textAlign: "center", caretColor: "#C5A059", transition: "border-color 0.3s" }}
            />
            {pwError && (
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.72rem", color: "rgba(139,26,26,0.85)", textAlign: "center", letterSpacing: "0.1em" }}>
                Invalid access code.
              </p>
            )}
            <button type="submit"
              style={{ background: "rgba(197,160,89,0.9)", border: "none", padding: "0.85rem", color: "#050505", fontSize: "0.55rem", letterSpacing: "0.25em", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", fontWeight: 600, cursor: "pointer" }}>
              Authenticate
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#F5F5F0", fontFamily: "'Montserrat', sans-serif", padding: "3rem 2rem" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400&family=Montserrat:wght@300;400;500&family=JetBrains+Mono:wght@300;400&display=swap');`}</style>

      {/* Header */}
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <p style={{ fontSize: "0.5rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(197,160,89,0.5)", marginBottom: "0.4rem" }}>
              Met Council · Internal
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 300, color: "#F5F5F0", letterSpacing: "-0.02em" }}>
              Gatekeeper <span style={{ color: "#C5A059", fontStyle: "italic" }}>Access Log</span>
            </h1>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={exportCSV}
              style={{ background: "transparent", border: "1px solid rgba(197,160,89,0.3)", padding: "0.6rem 1.2rem", color: "rgba(197,160,89,0.8)", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", cursor: "pointer" }}>
              Export CSV
            </button>
            <button onClick={clearLog}
              style={{ background: "transparent", border: "1px solid rgba(139,26,26,0.4)", padding: "0.6rem 1.2rem", color: "rgba(220,60,60,0.7)", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", cursor: "pointer" }}>
              Clear Log
            </button>
            <button onClick={() => navigate("/home")}
              style={{ background: "transparent", border: "1px solid rgba(197,160,89,0.2)", padding: "0.6rem 1.2rem", color: "rgba(161,161,161,0.5)", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", cursor: "pointer" }}>
              ← Back
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: "rgba(42,42,42,1)", marginBottom: "2.5rem" }}>
          {[
            { label: "Successful Logins", count: counts.success, color: "rgba(76,175,80,0.9)"  },
            { label: "Failed Attempts",   count: counts.failed,  color: "rgba(245,158,11,0.85)" },
            { label: "Blocked",           count: counts.blocked, color: "rgba(220,60,60,0.9)"   },
          ].map(s => (
            <div key={s.label} style={{ background: "#0F0F0F", padding: "1.5rem 2rem" }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.5rem", fontWeight: 300, color: s.color, marginBottom: "0.3rem" }}>{s.count}</p>
              <p style={{ fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(161,161,161,0.5)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(42,42,42,1)", marginBottom: "1.5rem" }}>
          {["all","success","failed","blocked"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ background: "transparent", border: "none", borderBottom: `1px solid ${filter===f ? "#C5A059" : "transparent"}`, padding: "0.75rem 1.5rem", color: filter===f ? "#C5A059" : "rgba(161,161,161,0.4)", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", cursor: "pointer", marginBottom: "-1px", transition: "color 0.3s, border-color 0.3s" }}>
              {f === "all" ? `All (${log.length})` : f === "success" ? `Verified (${counts.success})` : f === "failed" ? `Failed (${counts.failed})` : `Blocked (${counts.blocked})`}
            </button>
          ))}
        </div>

        {/* Log table */}
        {filtered.length === 0 ? (
          <div style={{ padding: "4rem", textAlign: "center", border: "1px solid rgba(42,42,42,1)" }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: "rgba(161,161,161,0.3)", fontStyle: "italic" }}>No entries to display.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "rgba(42,42,42,1)" }}>
            {filtered.map((entry, i) => {
              const badge = BADGE[entry.type] || BADGE.failed;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.03 }}
                  style={{ background: "#0F0F0F", padding: "1.2rem 1.5rem", display: "grid", gridTemplateColumns: "90px 1fr 1fr 1fr", gap: "1rem", alignItems: "center" }}>

                  {/* Badge */}
                  <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0.25rem 0.6rem", background: badge.bg, border: `1px solid ${badge.border}` }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.48rem", letterSpacing: "0.15em", color: badge.text }}>{badge.label}</span>
                  </div>

                  {/* Brand / attempted */}
                  <div>
                    <p style={{ fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(161,161,161,0.4)", marginBottom: "0.2rem" }}>
                      {entry.type === "success" ? "Brand" : "Attempted"}
                    </p>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: entry.type === "success" ? "#C5A059" : "#F5F5F0" }}>
                      {entry.brand || entry.attempted || "—"}
                    </p>
                  </div>

                  {/* IP */}
                  <div>
                    <p style={{ fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(161,161,161,0.4)", marginBottom: "0.2rem" }}>IP Address</p>
                    <button onClick={() => copyIP(entry.ip)}
                      style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: copied === entry.ip ? "rgba(76,175,80,0.9)" : "rgba(197,160,89,0.7)", letterSpacing: "0.05em" }}>
                      {copied === entry.ip ? "Copied!" : entry.ip}
                    </button>
                  </div>

                  {/* Timestamp */}
                  <div>
                    <p style={{ fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(161,161,161,0.4)", marginBottom: "0.2rem" }}>Timestamp</p>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: "rgba(161,161,161,0.6)", letterSpacing: "0.04em" }}>{formatDate(entry.timestamp)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <p style={{ marginTop: "2rem", fontSize: "0.48rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(161,161,161,0.2)", textAlign: "center" }}>
          Logs stored locally · Rendered for Met Council Internal Use Only · MetBrandScout.co
        </p>
      </div>
    </div>
  );
}