import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ArrowRight, Star, Crown, Gem, Lock } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
};

const NOTABLE_ATTENDEES = [
  { name: "Anna Wintour", role: "Editor-in-Chief, Vogue & Global Chief Content Officer, Condé Nast", desc: "Chair of the Met Gala since 1995, transforming it into fashion's most prestigious cultural fundraiser." },
  { name: "Rihanna", role: "Singer, Entrepreneur & Fashion Icon", desc: "Known for showstopping Met Gala looks including the iconic 2015 Guo Pei cape gown." },
  { name: "Zendaya", role: "Actress & Fashion Muse", desc: "Consistently delivers transformative Met Gala moments that define contemporary fashion." },
  { name: "Kim Kardashian", role: "Entrepreneur & Cultural Figure", desc: "From Mugler to Balenciaga, a red carpet presence that shapes cultural conversation." },
  { name: "Billy Porter", role: "Actor & Style Revolutionary", desc: "The golden Egyptian sun god outfit in 2019 remains one of the Gala's most iconic entrances." },
  { name: "Lady Gaga", role: "Singer & Performance Artist", desc: "Her 2019 four-outfit reveal on the pink carpet redefined Met Gala theatricality." },
];

const SECTION_TABS = ["ABOUT", "MEMO", "HISTORY", "CONTACT"];

const IMGS = {
  hero: "https://images.unsplash.com/photo-1768885560973-454bc193824d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxyZWQlMjBjYXJwZXQlMjBnYWxhfGVufDB8fHx8MTc3NDAzOTc5MHww&ixlib=rb-4.1.0&q=85",
  museum: "https://images.pexels.com/photos/5825359/pexels-photo-5825359.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  arch: "https://images.pexels.com/photos/5825377/pexels-photo-5825377.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  fashion: "https://images.unsplash.com/photo-1763152608881-67c80e52d0fc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwyfHxyZWQlMjBjYXJwZXQlMjBnYWxhfGVufDB8fHx8MTc3NDAzOTc5MHww&ixlib=rb-4.1.0&q=85",
};

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [brand, setBrand] = useState("");
  const [activeTab, setActiveTab] = useState("ABOUT");

  // ── Parallax hero ──────────────────────────────────────────────────────
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  // Gentle upward drift — slow enough to show full mannequin
  const heroY = useTransform(heroScroll, [0, 1], ["0%", "25%"]);
  // Start at natural size — no zoom crop
  const heroScale = useTransform(heroScroll, [0, 1], [1.0, 1.0]);
  const [memoRevealed, setMemoRevealed] = useState(false);

  useEffect(() => {
    const fromState = location.state?.brand;
    const fromSession = sessionStorage.getItem("gala_brand");
    const resolved = fromState || fromSession || "";
    setBrand(resolved);
    if (!resolved) navigate("/", { replace: true });
  }, [location.state, navigate]);

  useEffect(() => {
    if (activeTab === "MEMO") {
      const t = setTimeout(() => setMemoRevealed(true), 500);
      return () => clearTimeout(t);
    } else {
      setMemoRevealed(false);
    }
  }, [activeTab]);

  const handleTabChange = (tab) => setActiveTab(tab);

  return (
    <div data-testid="landing-page" className="min-h-screen bg-[var(--bg-primary)]">
      <Header />

      {/* HERO */}
      <section ref={heroRef} data-testid="hero-section" className="relative min-h-screen flex items-end pb-24 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            style={{ y: heroY, scale: heroScale }}
            className="absolute inset-0 w-full"
            initial={{ scale: 1.0 }}
          >
            <img
              src={IMGS.hero}
              alt="Met Gala"
              className="w-full h-full object-cover opacity-40"
              style={{ objectPosition: "center 20%", willChange: "transform" }}
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)]/80 to-transparent" />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 w-full">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, delay: 0.3 }} className="max-w-3xl">
            <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
              className="text-[var(--gold)] text-xs tracking-[0.3em] uppercase font-body mb-6">
              The Metropolitan Museum of Art &middot; Costume Institute
            </motion.p>
            {brand && (
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.6 }}
                className="text-[var(--text-secondary)] text-xs tracking-[0.25em] uppercase font-body mb-3">
                Welcome, <span className="text-[var(--gold)]">{brand}</span>. Your access has been verified.
              </motion.p>
            )}
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.7 }}
              className="font-heading text-5xl sm:text-6xl lg:text-8xl font-light text-[var(--text-primary)] leading-[0.95] tracking-tight mb-8">
              Fashion Brand
              <br /><span className="text-[var(--gold)] italic">Scout Program</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1 }}
              className="text-[var(--text-secondary)] text-base md:text-lg font-body leading-relaxed max-w-xl mb-10">
              {brand
                ? `${brand}, this is your exclusive portal to the 2026 Met Gala Scout Program — an invitation-only opportunity for fashion houses like yours to debut on the world's most storied red carpet.`
                : `An exclusive opportunity for emerging fashion houses to showcase their vision at the world's most prestigious fashion event.`}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.3 }}
              className="flex items-center gap-6">
              <button data-testid="hero-apply-button" onClick={() => navigate("/apply")}
                className="group flex items-center gap-3 px-8 py-4 bg-[var(--gold)] text-[var(--bg-primary)] text-xs tracking-[0.2em] uppercase font-body font-semibold hover:bg-[var(--gold-hover)] transition-colors duration-500">
                Begin Application
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button data-testid="hero-learn-more"
                onClick={() => document.getElementById("editorial-nav")?.scrollIntoView({ behavior: "smooth" })}
                className="text-[var(--text-secondary)] text-xs tracking-[0.15em] uppercase font-body hover:text-[var(--gold)] transition-colors duration-300">
                Learn More
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* COUNTDOWN */}
      <CountdownTimer />

      {/* NAV TABS */}
      <div id="editorial-nav" className="border-y border-[var(--border-dark)] sticky top-0 z-40 bg-[var(--bg-primary)]/95 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex items-center overflow-x-auto">
            {SECTION_TABS.map((tab) => (
              <button key={tab} onClick={() => handleTabChange(tab)}
                className="relative px-8 py-5 text-[0.6rem] tracking-[0.28em] uppercase font-body shrink-0 transition-colors duration-300"
                style={{ color: activeTab === tab ? "var(--gold)" : "var(--text-secondary)" }}>
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-px bg-[var(--gold)]"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TAB PANELS */}
      <AnimatePresence mode="wait">

        {/* ── ABOUT ── */}
        {activeTab === "ABOUT" && (
          <motion.div key="about"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>

            {/* Brand Scout Program */}
            <section data-testid="about-scout" className="py-24 md:py-32">
              <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
                  <div>
                    <motion.p {...fadeUp} className="text-[var(--gold)] text-xs tracking-[0.3em] uppercase font-body mb-4">
                      March 18, 2026 · Private Council Session
                    </motion.p>
                    <motion.h2 {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}
                      className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light text-[var(--text-primary)] leading-tight mb-8">
                      The Brand Scout Program:
                      <br /><span className="italic text-[var(--gold)]">Participation & Secrecy</span>
                    </motion.h2>
                    <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}
                      className="space-y-6 text-[var(--text-secondary)] text-sm md:text-base leading-relaxed font-body">
                      {brand && (
                        <p className="border-l border-[var(--border-gold)] pl-4 italic">
                          <span className="text-[var(--gold)] not-italic">{brand}</span>, you have been granted clearance to review the full scope of this initiative. Read carefully.
                        </p>
                      )}
                      <p>In a private council session held on March 18, 2026, co-chaired by <strong className="text-[var(--text-primary)]">Anna Wintour</strong>, the Met Council finalized the parameters for the Met Gala Brand Scout initiative. This exclusive program offers a select cohort of emerging fashion houses the opportunity to have their work integrated directly into the inaugural exhibition.</p>
                      <p>Selected designs will be displayed on bespoke, mirrored-face mannequins commissioned from artist <strong className="text-[var(--text-primary)]">Samar Hejazi</strong>. These sculptural forms are engineered to "bridge the gap between the viewer and the object," reflecting the Museum's commitment to diversity, identity, and the universality of the human form.</p>
                    </motion.div>

                    {/* NDA box */}
                    <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.35 }}
                      className="mt-10 border border-[var(--border-gold)] p-6 bg-[var(--bg-surface)]/50">
                      <div className="flex items-center gap-2 mb-4">
                        <Lock className="w-3 h-3 text-[var(--gold)]" strokeWidth={1.5} />
                        <span className="text-[var(--gold)] text-[0.6rem] tracking-[0.25em] uppercase font-body">Confidentiality & Compliance Notice</span>
                      </div>
                      <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-body">
                        Due to the high-profile nature of the 2026 Met Gala — co-chaired by <strong className="text-[var(--text-primary)]">Beyoncé, Nicole Kidman, Venus Williams, and Anna Wintour</strong> — all applicants are bound by a strict multi-lateral Non-Disclosure Agreement. Any unauthorized leak of the "Brand Scout" selection list or architectural specifications of the <strong className="text-[var(--text-primary)]">Peterson Rich Office (PRO)</strong> gallery layout will result in immediate disqualification and legal recourse by Condé Nast and The Metropolitan Museum of Art. Final selections will remain under total embargo until the official red carpet reveal on <strong className="text-[var(--text-primary)]">Monday, May 4, 2026</strong>.
                      </p>
                      {brand && <p className="text-[var(--gold)] text-xs font-body mt-4 opacity-60">This notice is acknowledged by {brand} upon accessing this portal.</p>}
                    </motion.div>
                  </div>

                  <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.3 }} className="space-y-6">
                    <div className="border border-[var(--border-dark)] overflow-hidden">
                      <img src={IMGS.museum} alt="Condé M. Nast Galleries Interior" className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-[10s]" />
                    </div>
                    <div className="border border-[var(--border-dark)] overflow-hidden">
                      <img src={IMGS.fashion} alt="Fashion as Art" className="w-full aspect-[16/9] object-cover hover:scale-105 transition-transform duration-[10s]" />
                    </div>
                    <p className="text-[var(--text-secondary)] text-xs tracking-[0.12em] uppercase font-body opacity-30 text-right">Condé M. Nast Galleries · PRO Design Suite · Spring 2026</p>
                  </motion.div>
                </div>
              </div>
            </section>

            <div className="border-t border-[var(--border-dark)]" />

            {/* Project Overview */}
            <section data-testid="about-gallery" className="py-24 md:py-32">
              <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
                  <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="space-y-6">
                    <div className="border border-[var(--border-dark)] overflow-hidden">
                      <img src={IMGS.arch} alt="Peterson Rich Office Architecture" className="w-full aspect-[3/4] object-cover hover:scale-105 transition-transform duration-[10s]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { num: "12,000", label: "Square Feet" },
                        { num: "~200", label: "Garments Exhibited" },
                        { num: "May 4", label: "Gala Night 2026" },
                        { num: "1", label: "Grand Laureate" },
                      ].map((s) => (
                        <div key={s.label} className="border border-[var(--border-dark)] p-6 bg-[var(--bg-surface)]">
                          <p className="font-heading text-3xl text-[var(--gold)] mb-2">{s.num}</p>
                          <p className="text-[var(--text-secondary)] text-xs tracking-[0.15em] uppercase font-body">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <div>
                    <motion.p {...fadeUp} className="text-[var(--gold)] text-xs tracking-[0.3em] uppercase font-body mb-4">Project Overview · Opening May 10, 2026</motion.p>
                    <motion.h2 {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}
                      className="font-heading text-4xl sm:text-5xl font-light text-[var(--text-primary)] leading-tight mb-8">
                      The Condé M. Nast Galleries
                      <br /><span className="italic text-[var(--gold)]">& Costume Art 2026</span>
                    </motion.h2>
                    <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}
                      className="space-y-6 text-[var(--text-secondary)] text-sm md:text-base leading-relaxed font-body">
                      {brand && (
                        <p className="border-l border-[var(--border-gold)] pl-4 italic">
                          <span className="text-[var(--gold)] not-italic">{brand}</span>, this is the physical space your work could inhabit. Study it.
                        </p>
                      )}
                      <p>The Metropolitan Museum of Art is pleased to announce the opening of the <strong className="text-[var(--text-primary)]">Condé M. Nast Galleries</strong>, a transformative 12,000-square-foot exhibition suite situated immediately adjacent to the Great Hall. Designed by the award-winning Brooklyn-based architecture firm <strong className="text-[var(--text-primary)]">Peterson Rich Office (PRO)</strong>, this state-of-the-art expansion converts the Museum's former ground-floor retail footprint into a premier destination for the study and celebration of fashion as a fine art form.</p>
                      <p>The galleries will be christened with the Spring 2026 Costume Institute exhibition, <strong className="text-[var(--text-primary)]">Costume Art</strong>. Curated by <strong className="text-[var(--text-primary)]">Andrew Bolton</strong>, the show examines the "centrality of the dressed body," pairing nearly 200 contemporary and historical garments with masterpieces from the Museum's permanent collection — including Greek and Roman sculpture, Renaissance painting, and modern silhouettes.</p>
                    </motion.div>
                    <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.3 }} className="mt-10 space-y-px">
                      {[
                        { icon: Crown, label: "The PRO Architecture", desc: "Peterson Rich Office's Variable Transparency glass and polished steel environment redefines how fashion is encountered spatially." },
                        { icon: Star, label: "Samar Hejazi Mannequins", desc: "Mirrored-steel sculptural forms commissioned exclusively for this exhibition, reflecting both garment and viewer in real time." },
                        { icon: Gem, label: "Direct-to-Archive Access", desc: "The Grand Inaugural Laureate bypasses the traditional 20-year career requirement for permanent collection consideration." },
                      ].map((item) => (
                        <div key={item.label} className="group flex gap-5 p-6 border border-[var(--border-dark)] hover:border-[var(--border-gold)] transition-colors duration-500 bg-[var(--bg-surface)]">
                          <item.icon className="w-5 h-5 text-[var(--gold)] shrink-0 mt-0.5" strokeWidth={1} />
                          <div>
                            <p className="text-[var(--text-primary)] text-sm font-body mb-1">{item.label}</p>
                            <p className="text-[var(--text-secondary)] text-xs leading-relaxed font-body">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </div>
            </section>

            {/* Notable Attendees */}
            <section data-testid="attendees-section" className="py-24 md:py-32 border-t border-[var(--border-dark)]">
              <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                <motion.p {...fadeUp} className="text-[var(--gold)] text-xs tracking-[0.3em] uppercase font-body mb-4">The Faces of the Gala</motion.p>
                <motion.h2 {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}
                  className="font-heading text-4xl sm:text-5xl font-light text-[var(--text-primary)] leading-tight mb-4 max-w-2xl">
                  Notable <span className="italic text-[var(--gold)]">Attendees</span>
                </motion.h2>
                {brand && (
                  <motion.p {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}
                    className="text-[var(--text-secondary)] text-sm font-body mb-16 max-w-xl">
                    {brand}, these are the luminaries whose presence defines the Gala. Your brand would join their legacy.
                  </motion.p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border-dark)]">
                  {NOTABLE_ATTENDEES.map((person, i) => (
                    <motion.div key={person.name} {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 * (i + 1) }}
                      className="bg-[var(--bg-primary)] p-8 md:p-10 group hover:bg-[var(--bg-surface)] transition-colors duration-500">
                      <div className="w-10 h-10 border border-[var(--border-dark)] group-hover:border-[var(--gold)] flex items-center justify-center mb-6 transition-colors duration-500">
                        <span className="text-[var(--text-secondary)] group-hover:text-[var(--gold)] text-sm font-mono transition-colors duration-500">{String(i + 1).padStart(2, "0")}</span>
                      </div>
                      <h3 className="font-heading text-xl md:text-2xl text-[var(--text-primary)] mb-2">{person.name}</h3>
                      <p className="text-[var(--gold)] text-xs tracking-wide font-body mb-4">{person.role}</p>
                      <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-body">{person.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA */}
            <section data-testid="cta-section" className="py-24 md:py-32 border-t border-[var(--border-dark)]">
              <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-center">
                <motion.p {...fadeUp} className="text-[var(--gold)] text-xs tracking-[0.3em] uppercase font-body mb-6">Applications Now Open</motion.p>
                <motion.h2 {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}
                  className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light text-[var(--text-primary)] leading-tight mb-8 max-w-3xl mx-auto">
                  {brand
                    ? <><span className="italic text-[var(--gold)]">{brand}</span>,<br />the Spotlight Awaits You</>
                    : <>Your Brand Deserves the <span className="italic text-[var(--gold)]">Spotlight</span></>}
                </motion.h2>
                <motion.p {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}
                  className="text-[var(--text-secondary)] text-base md:text-lg font-body mb-12 max-w-xl mx-auto">
                  {brand
                    ? `Your credentials have been verified, ${brand}. You are one application away from joining an exclusive roster of five fashion houses selected for the 2026 Met Gala experience.`
                    : `Join an exclusive roster of emerging fashion houses selected to participate in the 2026 Met Gala experience.`}
                </motion.p>
                <motion.button {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.3 }}
                  data-testid="cta-apply-button" onClick={() => navigate("/apply")}
                  className="group inline-flex items-center gap-3 px-10 py-5 bg-[var(--gold)] text-[var(--bg-primary)] text-xs tracking-[0.2em] uppercase font-body font-semibold hover:bg-[var(--gold-hover)] transition-colors duration-500">
                  Begin Your Application
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>
              </div>
            </section>
          </motion.div>
        )}

        {/* ── MEMO ── */}
        {activeTab === "MEMO" && (
          <motion.div key="memo"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <section className="py-24 md:py-32">
              <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col items-center">
                <motion.p {...fadeUp} className="text-[var(--gold)] text-xs tracking-[0.3em] uppercase font-body mb-4 self-start w-full max-w-[650px]">
                  Classified Internal Document · Eyes Only
                </motion.p>
                {brand && (
                  <motion.p {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}
                    className="text-[var(--text-secondary)] text-xs font-body mb-10 self-start max-w-[650px]">
                    <span className="text-[var(--gold)]">{brand}</span> — this document was made accessible to you upon successful authentication. Do not distribute.
                  </motion.p>
                )}

                {/* Parchment */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: memoRevealed ? 1 : 0, y: memoRevealed ? 0 : 30 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  style={{ width: "100%", maxWidth: 650, position: "relative" }}
                  className="border border-[rgba(197,160,89,0.18)] bg-[#080808]"
                >
                  {/* Ghost M watermark */}
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20rem", fontWeight: 300, color: "transparent", WebkitTextStroke: "1px rgba(197,160,89,0.025)", userSelect: "none" }}>M</span>
                  </div>

                  {/* Classification bar */}
                  <div className="relative z-10 border-b border-[rgba(197,160,89,0.12)] px-8 py-3 flex items-center justify-between">
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.2em", color: "rgba(197,160,89,0.45)", textTransform: "uppercase" }}>MET-CMS-2026-B</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.15em", color: "rgba(139,26,26,0.65)", textTransform: "uppercase" }}>◼ STRICTLY CONFIDENTIAL</span>
                  </div>

                  <div className="relative z-10 px-8 md:px-12 py-10" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {/* Header block */}
                    <div className="mb-8 pb-8 border-b border-[rgba(197,160,89,0.08)]">
                      <p style={{ fontSize: "0.68rem", letterSpacing: "0.12em", color: "rgba(197,160,89,0.75)", lineHeight: 2.2, textTransform: "uppercase" }}>
                        MEMO: COORDINATION OF THE CONDÉ M. NAST GALLERIES<br />& MET BRAND SCOUT PILOT
                      </p>
                      <p style={{ fontSize: "0.63rem", letterSpacing: "0.1em", color: "rgba(161,161,161,0.5)", lineHeight: 2.2, marginTop: "0.5rem" }}>
                        DATE: March 19, 2026<br />
                        DOCUMENT REF: MET-CMS-2026-B<br />
                        <span style={{ color: "rgba(139,26,26,0.7)" }}>CLASSIFICATION: STRICTLY CONFIDENTIAL – EYES ONLY</span><br />
                        DISTRIBUTION: Met Council, Office of the Editor-in-Chief (Condé Nast), PRO Architectural Lead
                      </p>
                    </div>

                    {/* Executive Summary */}
                    <div className="mb-8">
                      <p style={{ fontSize: "0.55rem", letterSpacing: "0.22em", color: "rgba(197,160,89,0.5)", textTransform: "uppercase", marginBottom: "0.75rem" }}>EXECUTIVE SUMMARY: THE DUAL-TRACK INAUGURATION</p>
                      <p style={{ fontSize: "0.66rem", color: "rgba(245,245,240,0.6)", lineHeight: 2, letterSpacing: "0.03em" }}>
                        The May 10, 2026, opening of the Condé M. Nast Galleries represents the most significant structural expansion of The Metropolitan Museum of Art in a generation. While the physical gallery construction is public knowledge, the Met Brand Scout Program remains a restricted-access pilot initiative. This memorandum outlines the strategic necessity for this synchronization and the mandatory confidentiality protocols currently in effect.
                      </p>
                    </div>

                    {/* Section 1 */}
                    <div className="mb-8">
                      <p style={{ fontSize: "0.55rem", letterSpacing: "0.22em", color: "rgba(197,160,89,0.5)", textTransform: "uppercase", marginBottom: "0.75rem" }}>1. ARCHITECTURAL INTEGRATION & LIABILITY</p>
                      <p style={{ fontSize: "0.66rem", color: "rgba(245,245,240,0.6)", lineHeight: 2, letterSpacing: "0.03em", marginBottom: "1rem" }}>
                        The 12,000-square-foot suite designed by Peterson Rich Office (PRO) utilizes a revolutionary "Variable Transparency" glass and polished steel environment. To ensure the Costume Art exhibition meets structural safety and insurance standards, the Brand Scout program was fast-tracked during the March 18th Executive Session.
                      </p>
                      <div style={{ borderLeft: "1px solid rgba(197,160,89,0.15)", paddingLeft: "1.25rem" }}>
                        <p style={{ fontSize: "0.63rem", color: "rgba(245,245,240,0.45)", lineHeight: 2.1, letterSpacing: "0.03em", marginBottom: "0.75rem" }}>
                          <span style={{ color: "rgba(197,160,89,0.65)" }}>• THE BENEFIT:</span> Selected houses are granted proprietary access to the PRO architectural "Digital Twin" software. This allows designers to calibrate their silhouettes against the specific light-refraction indices of the Samar Hejazi mirrored displays.
                        </p>
                        <p style={{ fontSize: "0.63rem", color: "rgba(245,245,240,0.45)", lineHeight: 2.1, letterSpacing: "0.03em" }}>
                          <span style={{ color: "rgba(197,160,89,0.65)" }}>• THE CONSTRAINT:</span> Due to the experimental nature of the gallery's climate-control systems for un-archived textiles, participant names must remain under embargo to satisfy AXA Art Insurance liability underwriters.
                        </p>
                      </div>
                    </div>

                    {/* Section 2 */}
                    <div className="mb-8">
                      <p style={{ fontSize: "0.55rem", letterSpacing: "0.22em", color: "rgba(197,160,89,0.5)", textTransform: "uppercase", marginBottom: "0.75rem" }}>2. THE SELECTION MANDATE: THE "INVOLUNTARY FIVE"</p>
                      <p style={{ fontSize: "0.66rem", color: "rgba(245,245,240,0.6)", lineHeight: 2, letterSpacing: "0.03em", marginBottom: "1rem" }}>
                        Per the directive of the 2026 Co-Chairs — Beyoncé, Nicole Kidman, Venus Williams, and Anna Wintour — the scouted cohort will be limited to five (5) emerging fashion houses.
                      </p>
                      <div style={{ borderLeft: "1px solid rgba(197,160,89,0.15)", paddingLeft: "1.25rem" }}>
                        <p style={{ fontSize: "0.63rem", color: "rgba(245,245,240,0.45)", lineHeight: 2.1, letterSpacing: "0.03em", marginBottom: "0.75rem" }}>
                          <span style={{ color: "rgba(197,160,89,0.65)" }}>• THE PROCESS:</span> These five finalists will have their garments integrated into the Costume Art layout for a private technical review on April 30th.
                        </p>
                        <p style={{ fontSize: "0.63rem", color: "rgba(245,245,240,0.45)", lineHeight: 2.1, letterSpacing: "0.03em" }}>
                          <span style={{ color: "rgba(197,160,89,0.65)" }}>• THE LAUREATE:</span> Only one (1) singular winner will be selected as the "Grand Inaugural Laureate." This brand alone will receive the Direct-to-Archive Accession, bypass the traditional 20-year career requirement, and be featured as a standalone highlight during the global May 4th broadcast.
                        </p>
                      </div>
                    </div>

                    {/* Section 3 */}
                    <div className="mb-8">
                      <p style={{ fontSize: "0.55rem", letterSpacing: "0.22em", color: "rgba(197,160,89,0.5)", textTransform: "uppercase", marginBottom: "0.75rem" }}>3. BROADCAST EXCLUSIVITY & MARKET STABILITY</p>
                      <p style={{ fontSize: "0.66rem", color: "rgba(245,245,240,0.6)", lineHeight: 2, letterSpacing: "0.03em", marginBottom: "1rem" }}>
                        The Met Brand Scout program serves as the "Living Art" component of the May 4th Gala.
                      </p>
                      <div style={{ borderLeft: "1px solid rgba(197,160,89,0.15)", paddingLeft: "1.25rem" }}>
                        <p style={{ fontSize: "0.63rem", color: "rgba(245,245,240,0.45)", lineHeight: 2.1, letterSpacing: "0.03em", marginBottom: "0.75rem" }}>
                          <span style={{ color: "rgba(197,160,89,0.65)" }}>• THE EMBARGO:</span> Public disclosure of the five finalists prior to the Gala would result in speculative market inflation and "Lobbying Interference" from major luxury conglomerates. To maintain the curatorial integrity of the selection committee, all application data is sequestered behind the MetBrandScout.co secure portal.
                        </p>
                        <p style={{ fontSize: "0.63rem", color: "rgba(245,245,240,0.45)", lineHeight: 2.1, letterSpacing: "0.03em" }}>
                          <span style={{ color: "rgba(197,160,89,0.65)" }}>• THE REVEAL:</span> The singular winner will be announced in conjunction with the inauguration of the Peterson Rich Office (PRO) wing.
                        </p>
                      </div>
                    </div>

                    {/* Legal Notice */}
                    <div className="border border-[rgba(139,26,26,0.2)] bg-[rgba(139,26,26,0.03)] p-5 mb-8">
                      <p style={{ fontSize: "0.55rem", letterSpacing: "0.22em", color: "rgba(139,26,26,0.65)", textTransform: "uppercase", marginBottom: "0.5rem" }}>LEGAL NOTICE: TERMS OF EMBARGO</p>
                      <p style={{ fontSize: "0.63rem", color: "rgba(245,245,240,0.4)", lineHeight: 2, letterSpacing: "0.03em" }}>
                        Unauthorized disclosure of the contents of this memorandum or the technical specifications of the Peterson Rich Office (PRO) layout constitutes a breach of the Multi-Lateral Non-Disclosure Agreement signed on March 18. Any brand found to be in non-compliance will face immediate permanent disqualification from the 2026 Gala and subsequent litigation by Condé Nast Legal.
                      </p>
                    </div>

                    {/* Technical footer */}
                    <div className="border-t border-[rgba(197,160,89,0.08)] pt-5">
                      <p style={{ fontSize: "0.48rem", letterSpacing: "0.15em", color: "rgba(161,161,161,0.2)", lineHeight: 2.2, textTransform: "uppercase" }}>
                        Rendered for: Peterson Rich Office (PRO) Digital Twin Environment<br />
                        Mannequin Spec: Samar Hejazi Mirrored-Steel (V.2)<br />
                        {brand && `Recipient: ${brand} · Authenticated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>
          </motion.div>
        )}

        {/* ── HISTORY ── */}
        {activeTab === "HISTORY" && (
          <motion.div key="history"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <section id="history" data-testid="history-section" className="py-24 md:py-32">
              <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
                  <div>
                    <motion.p {...fadeUp} className="text-[var(--gold)] text-xs tracking-[0.3em] uppercase font-body mb-4">Est. 1948</motion.p>
                    <motion.h2 {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}
                      className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light text-[var(--text-primary)] leading-tight mb-8">
                      A Legacy of
                      <br /><span className="italic text-[var(--gold)]">Fashion & Art</span>
                    </motion.h2>
                    <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}
                      className="space-y-6 text-[var(--text-secondary)] text-sm md:text-base leading-relaxed font-body">
                      {brand && (
                        <p className="border-l border-[var(--border-gold)] pl-4 italic">
                          <span className="text-[var(--gold)] not-italic">{brand}</span>, as you tour this space, understand the institution you are applying to be a part of.
                        </p>
                      )}
                      <p>The Met Gala, formally called the Costume Institute Gala or the Costume Institute Benefit, is an annual fundraising gala held for the benefit of the Metropolitan Museum of Art's Costume Institute in New York City. It marks the opening of the Costume Institute's annual fashion exhibit.</p>
                      <p>The event was first held in 1948 as a midnight supper, the brainchild of fashion publicist <strong className="text-[var(--text-primary)]">Eleanor Lambert</strong>. Initially a modest fundraiser with tickets priced at $50, it has evolved into one of the most exclusive and high-profile events in the world, with individual tickets now costing upward of $75,000.</p>
                      <p>Since 1995, the gala has been chaired by <strong className="text-[var(--text-primary)]">Anna Wintour</strong>, editor-in-chief of Vogue, who transformed the event from a New York society dinner into a global fashion phenomenon and major fundraising enterprise. Under her stewardship, it has raised hundreds of millions of dollars for the Costume Institute.</p>
                      {brand && (
                        <p className="border-l border-[var(--border-gold)] pl-4 italic">
                          Now in 2026, <span className="text-[var(--gold)] not-italic">{brand}</span>, you have the opportunity to become part of this living history.
                        </p>
                      )}
                    </motion.div>

                    <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.35 }} className="mt-12 space-y-px">
                      {[
                        { icon: Crown, title: "The Costume Institute", desc: "Home to over 33,000 costumes and accessories spanning seven centuries of fashion from five continents." },
                        { icon: Star, title: "Annual Exhibition", desc: "Each year's theme guides the gala's dress code and curates an exhibition drawing over a million visitors." },
                        { icon: Gem, title: "Condé M. Nast Galleries", desc: "The 2026 expansion celebrates fashion's equivalence with painting, sculpture, and the decorative arts." },
                      ].map((item) => (
                        <div key={item.title} className="group flex gap-5 p-6 border border-[var(--border-dark)] hover:border-[var(--border-gold)] transition-colors duration-500 bg-[var(--bg-surface)]">
                          <item.icon className="w-5 h-5 text-[var(--gold)] shrink-0 mt-0.5" strokeWidth={1} />
                          <div>
                            <p className="text-[var(--text-primary)] text-sm font-body mb-1">{item.title}</p>
                            <p className="text-[var(--text-secondary)] text-xs leading-relaxed font-body">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </div>

                  <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.3 }} className="space-y-6">
                    <div className="border border-[var(--border-dark)] overflow-hidden">
                      <img src={IMGS.museum} alt="The Metropolitan Museum of Art" className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-[10s]" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="border border-[var(--border-dark)] overflow-hidden">
                        <img src={IMGS.arch} alt="Museum Architecture" className="w-full aspect-[3/4] object-cover hover:scale-105 transition-transform duration-[10s]" />
                      </div>
                      <div className="border border-[var(--border-dark)] overflow-hidden">
                        <img src={IMGS.fashion} alt="Fashion Editorial" className="w-full aspect-[3/4] object-cover hover:scale-105 transition-transform duration-[10s]" />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {/* ── CONTACT ── */}
        {activeTab === "CONTACT" && (
          <motion.div key="contact"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <section className="py-24 md:py-32">
              <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                <motion.p {...fadeUp} className="text-[var(--gold)] text-xs tracking-[0.3em] uppercase font-body mb-4">
                  Direct Correspondence
                </motion.p>
                <motion.h2 {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}
                  className="font-heading text-4xl sm:text-5xl font-light text-[var(--text-primary)] leading-tight mb-12 max-w-2xl">
                  {brand
                    ? <><span className="italic text-[var(--gold)]">{brand}</span>,<br />we are at your service</>
                    : <>Contact the <span className="italic text-[var(--gold)]">Scout Office</span></>}
                </motion.h2>

                {/* Protocol notice */}
                <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}
                  className="max-w-2xl mb-16 border-l-2 border-[var(--border-gold)] pl-8 py-2">
                  <p className="text-[var(--text-secondary)] text-sm md:text-base font-body leading-relaxed mb-6">
                    In accordance with the 2026 Met Council security protocols concerning the Met Brand Scout, all direct-line and social communications are currently restricted to prevent third-party scouting interference and speculative market inflation. Access to the full communication suite is granted sequentially based on credential verification and successful application.
                  </p>
                  <p className="text-[var(--text-secondary)] text-sm font-body leading-relaxed">
                    For all inquiries and assistance, do reach out to:{" "}
                    <a
                      href="mailto:support@metbrandscout.co"
                      className="text-[var(--gold)] hover:text-[var(--gold-hover)] transition-colors duration-300 border-b border-[var(--border-gold)] hover:border-[var(--gold)] pb-px"
                      style={{ textDecoration: "none" }}
                    >
                      support@metbrandscout.co
                    </a>
                  </p>
                </motion.div>

                {/* Status grid */}
                <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--border-dark)] max-w-3xl">
                  {[
                    { label: "General Enquiries", value: "support@metbrandscout.co", note: "Response within 48 hours", link: true },
                    { label: "Legal & Compliance", value: "Restricted", note: "Access granted post-application" },
                    { label: "Application Support", value: "support@metbrandscout.co", note: "Technical form assistance", link: true },
                    { label: "Press Office", value: "Under embargo until May 4", note: "No press contact prior to reveal" },
                  ].map((item) => (
                    <div key={item.label} className="bg-[var(--bg-primary)] p-8 hover:bg-[var(--bg-surface)] transition-colors duration-500 group">
                      <p className="text-[var(--gold)] text-[0.6rem] tracking-[0.2em] uppercase font-body mb-3">{item.label}</p>
                      {item.link
                        ? <a href="mailto:support@metbrandscout.co"
                            className="text-[var(--text-primary)] text-sm font-body mb-1 block hover:text-[var(--gold)] transition-colors duration-300"
                            style={{ textDecoration: "none" }}>
                            {item.value}
                          </a>
                        : <p className="text-[var(--text-secondary)] text-sm font-body mb-1 opacity-40 italic">{item.value}</p>
                      }
                      <p className="text-[var(--text-secondary)] text-xs font-body opacity-40 mt-1">{item.note}</p>
                    </div>
                  ))}
                </motion.div>

                {brand && (
                  <motion.p {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.4 }}
                    className="text-[var(--text-secondary)] text-xs font-body mt-12 max-w-xl leading-relaxed opacity-50">
                    All correspondence from <span className="text-[var(--gold)] opacity-100">{brand}</span> will be treated with the highest level of discretion in accordance with the March 18th Multi-Lateral NDA currently in effect.
                  </motion.p>
                )}
              </div>
            </section>
          </motion.div>
        )}

      </AnimatePresence>

      <Footer />
    </div>
  );
}