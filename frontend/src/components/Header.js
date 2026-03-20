import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      data-testid="main-header"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        scrolled
          ? "bg-black/70 backdrop-blur-2xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
        <button
          data-testid="logo-home-link"
          onClick={() => navigate("/")}
          className="flex items-center gap-3 group"
        >
          <div className="w-8 h-8 border border-[var(--gold)] flex items-center justify-center">
            <span className="text-[var(--gold)] font-heading text-lg font-semibold">M</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[var(--text-primary)] text-xs tracking-[0.2em] uppercase font-body font-medium">
              Met Gala
            </span>
            <span className="text-[var(--text-secondary)] text-[10px] tracking-[0.15em] uppercase font-body">
              Brand Scout
            </span>
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-10">
          <button
            data-testid="nav-about"
            onClick={() => navigate("/")}
            className="text-[var(--text-secondary)] text-xs tracking-[0.15em] uppercase font-body hover:text-[var(--gold)] transition-colors duration-300"
          >
            About
          </button>
          <button
            data-testid="nav-history"
            onClick={() => {
              if (location.pathname === "/") {
                document.getElementById("history")?.scrollIntoView({ behavior: "smooth" });
              } else {
                navigate("/");
              }
            }}
            className="text-[var(--text-secondary)] text-xs tracking-[0.15em] uppercase font-body hover:text-[var(--gold)] transition-colors duration-300"
          >
            History
          </button>
          <button
            data-testid="nav-contact"
            onClick={() => {
              if (location.pathname === "/") {
                document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" });
              } else {
                navigate("/");
              }
            }}
            className="text-[var(--text-secondary)] text-xs tracking-[0.15em] uppercase font-body hover:text-[var(--gold)] transition-colors duration-300"
          >
            Contact
          </button>
        </nav>

        <button
          data-testid="apply-button"
          onClick={() => navigate("/apply")}
          className="px-6 py-2.5 border border-[var(--gold)] text-[var(--gold)] text-xs tracking-[0.2em] uppercase font-body font-medium hover:bg-[var(--gold)] hover:text-[var(--bg-primary)] transition-colors duration-500"
        >
          Apply Now
        </button>
      </div>
    </motion.header>
  );
};
