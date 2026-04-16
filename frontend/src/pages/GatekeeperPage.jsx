import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ─── EmailJS config ────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY  = "YOUR_PUBLIC_KEY";
const NOTIFY_EMAIL        = "support@metbrandscout.co";

const LOG_KEY = "gk_access_log";

const ACCEPTED_BRANDS = [
  // Original 20
  "Nili Lotan", "Ulla Johnson", "Réalisation Par",
  "Cult Gaia", "Alexis", "L'Agence", "Avec Les Filles",
  "Cinq à Sept", "Vince", "Joie", "Equipment", "Rails",
  "Velvet by Graham & Spencer", "Elan", "Apiece Apart",
  "Rachel Comey", "Sea New York", "Mara Hoffman", "Veronica Beard",
  // Italian houses
  "Forte Forte", "Momoni", "Aspesi", "Peserico",
  "Antonelli Firenze", "Cruciani", "0039 Italy", "Luisa Cerano",
  "Seventy Milano", "Anna Molinari",
  // Australian houses
  "Camilla and Marc", "Zimmermann", "Hansen & Gretel",
  "Bec & Bridge", "Aje", "Sass & Bide", "Significant Other",
  "Arnhem", "Dissh", "Shona Joy",
  // New additions
  "Chimi", "Thebe Magugu", "Tongoro", "Lukhanyo Mdingi",
  "Raw Mango", "LeBlancStudios", "Grace Ling", "Iamisigo",
  "Tokyo James", "Banke Kuku", "Fruché", "HAWII",
  "Loza Maléombho", "Eloli World", "Patricio Campillo",
  "Permanent Vacation", "Veronica De Piante", "Renaissance Renaissance",
  "Róhe", "Hodakova", "At First Sight Studio", "Lamia Lagha",
  "De Pino", "bettter", "Kallmeyer", "Tolu Coker",
  "Agbobly", "Abra", "Samanta Virginio", "August Barron",
  "Heirlome", "Weise", "Zhadère", "Pierinna Feoli",
  "GOLSHAAH", "YOSHITA 1967", "Marco Ramboldi",
];

const normalise = (s) =>
  s.trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/['']/g, "'");

const ACCEPTED_NORM = ACCEPTED_BRANDS.map(normalise);

// ── Helpers ─────────────────────────────────────────────────────────────────
const getLog = () => { try { return JSON.parse(localStorage.getItem(LOG_KEY) || "[]"); } catch { return []; } };
const saveLog = (e) => { const l = getLog(); l.push(e); localStorage.setItem(LOG_KEY, JSON.stringify(l.slice(-200))); };

const fetchIP = async () => {
  try { const r = await fetch("https://api.ipify.org?format=json"); const d = await r.json(); return d.ip || "Unknown"; }
  catch { return "Unavailable"; }
};

const sendEmailNotification = async (brandName, ip) => {
  try {
    if (!window.emailjs) {
      await new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
      window.emailjs.init(EMAILJS_PUBLIC_KEY);
    }
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: NOTIFY_EMAIL, brand_name: brandName, ip_address: ip,
      timestamp: new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "full", timeStyle: "medium" }),
      user_agent: navigator.userAgent.slice(0, 120),
    });
  } catch (e) { console.warn("EmailJS notification failed:", e); }
};

// ── Ceremony stages ──────────────────────────────────────────────────────────
// "idle" → "emboss" → "verifying" → "confirmed" → "curtain" → navigate
// Each stage is timed precisely

export default function GatekeeperPage() {
  const navigate    = useNavigate();
  const inputRef    = useRef(null);
  const monogramRef = useRef(null);
  const cursorRef   = useRef(null);
  const ringRef     = useRef(null);

  const [value,          setValue]          = useState("");
  const [attempts,       setAttempts]       = useState(0);
  const [blocked,        setBlocked]        = useState(false);
  const [inputState,     setInputState]     = useState("idle");
  const [message,        setMessage]        = useState("");
  const [showVoid,       setShowVoid]       = useState(false);
  const [mounted,        setMounted]        = useState(false);
  const [userIP,         setUserIP]         = useState("");
  const [ipLoading,      setIpLoading]      = useState(false);

  // ── Ceremony state ─────────────────────────────────────────────────────────
  const [ceremony,       setCeremony]       = useState("idle");
  // idle | emboss | verifying | line2 | curtain
  const [confirmedBrand, setConfirmedBrand] = useState("");
  const [curtainOpen,    setCurtainOpen]    = useState(false); // iris expand
  const [showCouncil,    setShowCouncil]    = useState(false); // council welcome overlay

  const mouseRef   = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const ringPosRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const rafRef     = useRef(null);

  // ── Mount ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    setTimeout(() => inputRef.current?.focus(), 900);

    const animRing = () => {
      ringPosRef.current.x += (mouseRef.current.x - ringPosRef.current.x) * 0.12;
      ringPosRef.current.y += (mouseRef.current.y - ringPosRef.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = ringPosRef.current.x + "px";
        ringRef.current.style.top  = ringPosRef.current.y + "px";
      }
      rafRef.current = requestAnimationFrame(animRing);
    };
    rafRef.current = requestAnimationFrame(animRing);

    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + "px";
        cursorRef.current.style.top  = e.clientY + "px";
      }
      if (monogramRef.current && ceremony === "idle") {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;
        monogramRef.current.style.transform = `translate(calc(-50% + ${dx * 18}px), calc(-50% + ${dy * 10}px))`;
        monogramRef.current.style.webkitTextStroke = `1px rgba(197,160,89,${(0.04 + Math.abs(dx) * 0.06 + Math.abs(dy) * 0.04).toFixed(3)})`;
        monogramRef.current.style.textShadow = `${dx * 30}px ${dy * 20}px 80px rgba(197,160,89,0.07)`;
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => { window.removeEventListener("mousemove", onMouseMove); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [ceremony]);

  // ── Auth ───────────────────────────────────────────────────────────────────
  const getMatchedBrand = (val) => {
    const idx = ACCEPTED_NORM.indexOf(normalise(val));
    return idx !== -1 ? ACCEPTED_BRANDS[idx] : null;
  };

  const onSuccess = useCallback(async (brandName) => {
    // Disable input immediately
    setInputState("success");
    setConfirmedBrand(brandName);

    // Stage 1 — emboss shimmer (0ms)
    setCeremony("emboss");

    const ip = userIP || await fetchIP();
    saveLog({ type: "success", brand: brandName, ip, timestamp: new Date().toISOString(), ua: navigator.userAgent.slice(0, 120) });
    sendEmailNotification(brandName, ip);
    sessionStorage.setItem("gala_brand", brandName);

    // Stage 2 — verifying line 1 (500ms after enter)
    setTimeout(() => setCeremony("verifying"), 500);

    // Stage 3 — confirmed line 2 (2200ms)
    setTimeout(() => setCeremony("line2"), 2200);

    // Stage 4 — iris curtain opens (3800ms)
    setTimeout(() => {
      setCeremony("curtain");
      setCurtainOpen(true);
    }, 3800);

    // Stage 5 — council welcome appears over open curtain (4600ms)
    setTimeout(() => setShowCouncil(true), 4600);

    // Stage 6 — navigate (7200ms, after they've read the welcome)
    setTimeout(() => navigate("/home", { state: { brand: brandName } }), 7200);

  }, [navigate, userIP]);

  const onFirstFailure = useCallback(async () => {
    setAttempts(1);
    setValue("");
    setInputState("error");
    setIpLoading(true);
    const ip = await fetchIP();
    setUserIP(ip);
    setIpLoading(false);
    saveLog({ type: "failed", attempted: value, ip, timestamp: new Date().toISOString(), ua: navigator.userAgent.slice(0, 120) });
    setMessage("first_failure");
    setTimeout(() => setInputState("idle"), 2500);
  }, [value]);

  const onSecondFailure = useCallback(async () => {
    const ip = userIP || await fetchIP();
    saveLog({ type: "blocked", attempted: value, ip, timestamp: new Date().toISOString(), ua: navigator.userAgent.slice(0, 120) });
    setBlocked(true);
    setShowVoid(true);
  }, [value, userIP]);

  const handleKeyDown = (e) => {
    if (e.key !== "Enter" || blocked || ceremony !== "idle") return;
    const matched = getMatchedBrand(value);
    if (matched)             onSuccess(matched);
    else if (attempts === 0) onFirstFailure();
    else                     onSecondFailure();
  };

  const handleChange = (e) => {
    if (blocked || inputState === "success") return;
    setValue(e.target.value);
    if (attempts === 1 && inputState === "error") setInputState("idle");
  };

  const borderColor =
    inputState === "error"   ? "rgba(122,21,21,0.8)"  :
    inputState === "success" ? "rgba(197,160,89,0.9)" :
                               "rgba(197,160,89,0.35)";

  const isEmbossing = ceremony === "emboss" || ceremony === "verifying" || ceremony === "line2" || ceremony === "curtain";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=JetBrains+Mono:wght@300;400&family=Montserrat:wght@300;400;500&display=swap');

        .gk-body { cursor: none !important; }
        .gk-body * { cursor: none !important; }

        .gk-input {
          background: transparent; border: none; border-bottom: 1px solid;
          outline: none; width: 100%;
          font-family: 'Cormorant Garamond', serif; font-weight: 300;
          letter-spacing: 0.22em; text-align: center; text-transform: uppercase;
          padding: 0.75rem 0; caret-color: #C5A059;
          transition: border-color 0.6s, color 0.6s, text-shadow 0.6s, background 0.6s;
        }
        .gk-input::placeholder { color: rgba(161,161,161,0.25); letter-spacing: 0.22em; }
        .gk-input:focus-visible { outline: 1px solid rgba(197,160,89,0.35); outline-offset: 8px; }

        /* Gold leaf emboss shimmer */
        @keyframes goldEmboss {
          0%   { text-shadow: 0 0 0px rgba(197,160,89,0); color: rgba(245,245,240,0.9); }
          20%  { text-shadow: 0 0 12px rgba(197,160,89,0.6), 0 0 30px rgba(197,160,89,0.3); color: rgba(219,192,128,1); }
          50%  { text-shadow: 0 0 20px rgba(197,160,89,0.9), 0 0 50px rgba(197,160,89,0.5), 0 0 80px rgba(197,160,89,0.2); color: rgba(230,205,148,1); }
          80%  { text-shadow: 0 0 12px rgba(197,160,89,0.6), 0 0 30px rgba(197,160,89,0.3); color: rgba(219,192,128,1); }
          100% { text-shadow: 0 0 8px rgba(197,160,89,0.4), 0 0 20px rgba(197,160,89,0.2); color: rgba(197,160,89,0.95); }
        }
        .gk-input.embossing {
          animation: goldEmboss 1.2s cubic-bezier(0.22,1,0.36,1) forwards;
          border-bottom-color: rgba(197,160,89,0.8) !important;
        }

        /* Iris curtain — expands from center outward */
        @keyframes irisOpen {
          0%   { clip-path: circle(0% at 50% 50%); opacity: 1; }
          100% { clip-path: circle(150% at 50% 50%); opacity: 1; }
        }
        .iris-curtain {
          animation: irisOpen 1.8s cubic-bezier(0.76,0,0.24,1) forwards;
        }

        @keyframes ipFlash {
          0%,100% { opacity: 1; } 50% { opacity: 0.6; }
        }
        .ip-flash { animation: ipFlash 1.5s ease-in-out 2; }

        /* Council text reveal — letter by letter feel via mask */
        @keyframes councilReveal {
          from { opacity: 0; letter-spacing: 0.5em; }
          to   { opacity: 1; letter-spacing: 0.3em; }
        }
        .council-line { animation: councilReveal 1.2s cubic-bezier(0.22,1,0.36,1) forwards; }
      `}</style>

      <div className="gk-body" style={{ position: "fixed", inset: 0, background: "#050505", overflow: "hidden", fontFamily: "'Montserrat', sans-serif", color: "#F5F5F0" }}>

        {/* ── Cursor ── */}
        <div ref={cursorRef} style={{ position: "fixed", width: 6, height: 6, background: "#C5A059", borderRadius: "50%", pointerEvents: "none", zIndex: 9999, transform: "translate(-50%,-50%)", mixBlendMode: "difference" }} />
        <div ref={ringRef}   style={{ position: "fixed", width: 32, height: 32, border: "1px solid rgba(197,160,89,0.4)", borderRadius: "50%", pointerEvents: "none", zIndex: 9998, transform: "translate(-50%,-50%)" }} />

        {/* ── Grain ── */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100, opacity: 0.025, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "180px 180px" }} />

        {/* ── Glow ── */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(197,160,89,0.03) 0%, transparent 70%)" }} />

        {/* ── Corners ── */}
        {[{ top:"2rem",left:"2rem" },{ top:"2rem",right:"2rem",transform:"scaleX(-1)" },{ bottom:"2rem",left:"2rem",transform:"scaleY(-1)" },{ bottom:"2rem",right:"2rem",transform:"scale(-1)" }].map((s,i)=>(
          <motion.div key={i} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:1.5, delay:1+i*0.1 }}
            style={{ position:"fixed", width:24, height:24, zIndex:20, ...s }}>
            <div style={{ position:"absolute", top:0, left:0, width:"100%", height:1, background:"rgba(197,160,89,0.3)" }} />
            <div style={{ position:"absolute", top:0, left:0, width:1, height:"100%", background:"rgba(197,160,89,0.3)" }} />
          </motion.div>
        ))}

        {/* ── Date stamp ── */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:1.5, delay:1.4 }}
          style={{ position:"fixed", top:"2.4rem", left:"50%", transform:"translateX(-50%)", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.5rem", letterSpacing:"0.2em", color:"rgba(197,160,89,0.25)", zIndex:20, whiteSpace:"nowrap" }}>
          MARCH · 2026 · AUTHENTICATION PORTAL
        </motion.div>

        {/* ── Ghost M ── */}
        <div ref={monogramRef} style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(280px,35vw,520px)", fontWeight:300, lineHeight:1, color:"transparent", WebkitTextStroke:"1px rgba(197,160,89,0.07)", pointerEvents:"none", zIndex:1, userSelect:"none", letterSpacing:"-0.05em", willChange:"transform" }}>
          M
        </div>

        {/* ────────────────────────────────────────────────────────────────────
            IRIS CURTAIN — expands from center, reveals the homepage behind
        ──────────────────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {curtainOpen && (
            <div
              className="iris-curtain"
              style={{ position:"fixed", inset:0, zIndex:160, background:"#050505", clipPath:"circle(0% at 50% 50%)" }}
            >
              {/* Council welcome — appears inside the opening iris */}
              <AnimatePresence>
                {showCouncil && (
                  <motion.div
                    initial={{ opacity:0 }}
                    animate={{ opacity:1 }}
                    transition={{ duration:1.2, ease:[0.22,1,0.36,1] }}
                    style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"2rem", textAlign:"center" }}
                  >
                    {/* Top rule */}
                    <motion.div initial={{ scaleX:0 }} animate={{ scaleX:1 }} transition={{ duration:1, delay:0.2, ease:[0.22,1,0.36,1] }}
                      style={{ width:"clamp(60px,12vw,140px)", height:1, background:"linear-gradient(90deg,transparent,rgba(197,160,89,0.6),transparent)", marginBottom:"2.5rem" }} />

                    {/* Institution line */}
                    <p className="council-line" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"clamp(0.45rem,0.9vw,0.6rem)", letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(197,160,89,0.6)", marginBottom:"2rem", animationDelay:"0.1s", opacity:0 }}>
                      The Metropolitan Museum of Art &nbsp;|&nbsp; The Costume Institute
                    </p>

                    {/* Main acknowledgment */}
                    <motion.h1
                      initial={{ opacity:0, y:20 }}
                      animate={{ opacity:1, y:0 }}
                      transition={{ duration:1.4, delay:0.5, ease:[0.22,1,0.36,1] }}
                      style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(1.6rem,4vw,3rem)", fontWeight:300, color:"#F5F5F0", lineHeight:1.3, letterSpacing:"-0.01em", maxWidth:700, marginBottom:"1.8rem" }}
                    >
                      The Council acknowledges the presence of{" "}
                      <span style={{ color:"#C5A059", fontStyle:"italic" }}>{confirmedBrand}</span>.
                    </motion.h1>

                    {/* Sub line */}
                    <motion.p
                      initial={{ opacity:0 }}
                      animate={{ opacity:1 }}
                      transition={{ duration:1.2, delay:1, ease:[0.22,1,0.36,1] }}
                      style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"clamp(0.55rem,1vw,0.7rem)", letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(161,161,161,0.55)", maxWidth:520, lineHeight:2 }}
                    >
                      Your credentials have been validated for the 2026 Inaugural Laureate Selection.
                    </motion.p>

                    {/* Bottom rule */}
                    <motion.div initial={{ scaleX:0 }} animate={{ scaleX:1 }} transition={{ duration:1, delay:0.6, ease:[0.22,1,0.36,1] }}
                      style={{ width:"clamp(60px,12vw,140px)", height:1, background:"linear-gradient(90deg,transparent,rgba(197,160,89,0.6),transparent)", marginTop:"2.5rem" }} />

                    {/* Proceeding notice */}
                    <motion.p
                      initial={{ opacity:0 }}
                      animate={{ opacity:1 }}
                      transition={{ duration:1, delay:2, ease:[0.22,1,0.36,1] }}
                      style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.48rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(197,160,89,0.3)", marginTop:"2.5rem" }}
                    >
                      Proceeding to internal dashboard...
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>

        {/* ── Void ── */}
        <AnimatePresence>
          {showVoid && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.15 }}
              style={{ position:"fixed", inset:0, zIndex:200, background:"#000000", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(0.75rem,1.5vw,0.95rem)", fontWeight:300, letterSpacing:"0.12em", color:"rgba(161,161,161,0.65)", textAlign:"center", maxWidth:480, lineHeight:2, padding:"0 2rem" }}>
                <div style={{ fontWeight:400, color:"rgba(161,161,161,0.5)", fontSize:"0.65rem", letterSpacing:"0.25em", textTransform:"uppercase", marginBottom:"1.5rem", fontFamily:"'Montserrat',sans-serif" }}>
                  Access Revoked
                </div>
                Your firm's identity has been flagged for non-compliance with the March 18th Security Protocols. Documentation of this attempt has been forwarded to Condé Nast Legal.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ────────────────────────────────────────────────────────────────────
            MAIN STAGE
        ──────────────────────────────────────────────────────────────────── */}
        <div style={{ position:"fixed", inset:0, zIndex:10, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>

          {/* Overline */}
          <motion.p initial={{ opacity:0, y:16 }} animate={{ opacity:mounted?1:0, y:mounted?0:16 }} transition={{ duration:1.2, delay:0.3 }}
            style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.6rem", fontWeight:400, letterSpacing:"0.28em", textTransform:"uppercase", color:"#C5A059", marginBottom:"2.5rem" }}>
            Condé M. Nast Galleries · Met Brand Scout 2026
          </motion.p>

          {/* Deco lines */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:mounted?1:0, y:mounted?0:16 }} transition={{ duration:1.4, delay:0.6 }}
            style={{ display:"flex", alignItems:"center", gap:"1.5rem", marginBottom:"2.8rem" }}>
            <div style={{ width:"clamp(40px,6vw,80px)", height:1, background:"linear-gradient(90deg,transparent,rgba(197,160,89,0.3),transparent)" }} />
            <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(1rem,1.8vw,1.3rem)", fontWeight:300, letterSpacing:"0.35em", textTransform:"uppercase", color:"rgba(197,160,89,0.55)", fontStyle:"italic" }}>
              Gala Gatekeeper
            </span>
            <div style={{ width:"clamp(40px,6vw,80px)", height:1, background:"linear-gradient(90deg,transparent,rgba(197,160,89,0.3),transparent)" }} />
          </motion.div>

          {/* Input + ceremony messages */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:mounted?1:0, y:mounted?0:16 }} transition={{ duration:1.4, delay:0.8 }}
            style={{ width:"clamp(280px,40vw,520px)", display:"flex", flexDirection:"column", alignItems:"center" }}>

            <input
              ref={inputRef}
              className={`gk-input${isEmbossing ? " embossing" : ""}`}
              type="text"
              placeholder="Brand Name"
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={blocked || ceremony !== "idle"}
              autoComplete="off" autoCorrect="off" spellCheck={false}
              data-testid="gatekeeper-input"
              aria-label="Enter your brand name to authenticate"
              style={{
                borderBottomColor: borderColor,
                color: inputState === "error" ? "rgba(205,80,80,0.85)" : "rgba(245,245,240,0.9)",
                fontSize: "clamp(1.1rem,2.2vw,1.5rem)",
              }}
            />

            {/* ── Hint / verification text beneath the line ── */}
            <div style={{ marginTop:"1.4rem", minHeight:"3.5rem", display:"flex", flexDirection:"column", alignItems:"center", gap:"0.6rem" }}>

              {/* Default hint */}
              {ceremony === "idle" && !message && (
                <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.58rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(161,161,161,0.3)", transition:"opacity 0.4s" }}>
                  Press Enter to authenticate
                </p>
              )}

              {/* Verification line 1 */}
              <AnimatePresence>
                {(ceremony === "verifying" || ceremony === "line2" || ceremony === "curtain") && (
                  <motion.p
                    key="v1"
                    initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                    transition={{ duration:0.9, ease:[0.22,1,0.36,1] }}
                    style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"0.72rem", fontWeight:400, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(197,160,89,0.6)", textAlign:"center" }}
                  >
                    Verification of the March 18th Council Register...
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Verification line 2 */}
              <AnimatePresence>
                {(ceremony === "line2" || ceremony === "curtain") && (
                  <motion.p
                    key="v2"
                    initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                    transition={{ duration:1.1, ease:[0.22,1,0.36,1] }}
                    style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"0.78rem", fontWeight:400, letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(245,245,240,0.8)", textAlign:"center" }}
                  >
                    Protocol Confirmed:{" "}
                    <span style={{ color:"#C5A059", fontStyle:"italic" }}>{confirmedBrand}</span>{" "}
                    Recognized.
                  </motion.p>
                )}
              </AnimatePresence>

              {/* ── First failure: IP display ── */}
              <AnimatePresence>
                {message === "first_failure" && (
                  <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.5 }}
                    role="alert" style={{ marginTop:"1rem", textAlign:"center", maxWidth:460, width:"100%" }}>
                    <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"0.78rem", fontWeight:400, letterSpacing:"0.12em", color:"rgba(139,26,26,0.9)", lineHeight:1.9, marginBottom:"1.2rem" }}>
                      Credential mismatch. One final authentication attempt permitted before permanent IP-restricted lockout.
                    </p>
                    <div style={{ border:"1px solid rgba(122,21,21,0.4)", background:"rgba(122,21,21,0.06)", padding:"1rem 1.5rem" }}>
                      <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.5rem", letterSpacing:"0.25em", textTransform:"uppercase", color:"rgba(139,26,26,0.6)", marginBottom:"0.6rem" }}>
                        Flagged Network Identity
                      </p>
                      {ipLoading ? (
                        <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.75rem", color:"rgba(197,160,89,0.4)", letterSpacing:"0.1em" }}>Resolving...</p>
                      ) : (
                        <p className="ip-flash" style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"clamp(1rem,2.5vw,1.4rem)", fontWeight:400, color:"rgba(220,60,60,0.95)", letterSpacing:"0.12em" }}>
                          {userIP}
                        </p>
                      )}
                      <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.48rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(139,26,26,0.4)", marginTop:"0.5rem" }}>
                        This address will be permanently restricted upon second failure
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Confidentiality notice */}
        <motion.div
          initial={{ opacity:0 }} animate={{ opacity:mounted?1:0 }}
          transition={{ duration:2, delay:1.8 }}
          style={{ position:"fixed", bottom:"5.8rem", left:0, right:0, textAlign:"center", zIndex:20, padding:"0 2rem" }}
        >
          <p style={{
            fontFamily:"'Cormorant Garamond',serif",
            fontSize:"clamp(0.55rem,0.85vw,0.68rem)",
            fontWeight:400,
            letterSpacing:"0.12em",
            color:"rgba(197,160,89,0.45)",
            lineHeight:1.9,
            maxWidth:"640px",
            margin:"0 auto",
            fontStyle:"italic",
          }}>
            In compliance with the confidentiality mandates established during the March 18th Executive Session,
            this portal has been deliberately withheld from all public search indices and web discovery platforms.
            Its existence will remain unverifiable through conventional search channels until the official public
            announcement coinciding with the Met Gala red carpet reveal on Monday, May 4, 2026.
            If you have accessed this portal, it is because your credentials were extended through direct
            and authorized channels exclusively.
          </p>
        </motion.div>

        {/* Footer */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:mounted?1:0 }} transition={{ duration:2, delay:1.2 }}
          style={{ position:"fixed", bottom:"2.5rem", left:0, right:0, textAlign:"center", fontFamily:"'Montserrat',sans-serif", fontSize:"0.5rem", letterSpacing:"0.28em", textTransform:"uppercase", color:"rgba(161,161,161,0.2)", zIndex:20 }}>
          support@metbrandscout.co · By Invitation Only
        </motion.div>
      </div>

      {/* No-JS fallback */}
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: `
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background: #050505;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: Georgia, serif;
            color: #F5F5F0;
            padding: 2rem;
            text-align: center;
          }
          .ns-m {
            position: fixed; top: 50%; left: 50%;
            transform: translate(-50%,-50%);
            font-size: 45vw; font-weight: bold;
            color: transparent;
            -webkit-text-stroke: 1px rgba(197,160,89,0.07);
            pointer-events: none; user-select: none; z-index: 0;
          }
          .ns-wrap { position: relative; z-index: 1; max-width: 500px; }
          .ns-over { font-size: 0.55rem; letter-spacing: 0.28em; text-transform: uppercase; color: #C5A059; margin-bottom: 2rem; font-family: Arial, sans-serif; }
          .ns-rule { width: 60px; height: 1px; background: rgba(197,160,89,0.3); margin: 0 auto 1.5rem; }
          .ns-head { font-size: 1.1rem; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(197,160,89,0.5); font-style: italic; margin-bottom: 2rem; }
          .ns-body { font-size: 0.9rem; color: rgba(245,245,240,0.65); line-height: 1.9; letter-spacing: 0.05em; }
          .ns-body span { color: #C5A059; }
          .ns-foot { position: fixed; bottom: 2.5rem; left: 0; right: 0; text-align: center; font-size: 0.48rem; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(161,161,161,0.2); font-family: Arial, sans-serif; }
        ` }} />
        <div className="ns-m">M</div>
        <div className="ns-wrap">
          <p className="ns-over">Condé M. Nast Galleries · Met Brand Scout 2026</p>
          <div className="ns-rule"></div>
          <p className="ns-head">Gala Gatekeeper</p>
          <p className="ns-body">
            This portal requires <span>JavaScript</span> to be enabled
            in your browser to complete credential authentication.<br /><br />
            Please enable JavaScript and refresh this page to proceed.<br /><br />
            For assistance: <span>support@metbrandscout.co</span>
          </p>
        </div>
        <p className="ns-foot">support@metbrandscout.co · By Invitation Only</p>
      </noscript>
    </>
  );
}
