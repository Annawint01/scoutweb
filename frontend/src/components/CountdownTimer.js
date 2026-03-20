import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const TARGET_DATE = new Date("2026-05-04T19:00:00-04:00");

const calculateTimeLeft = () => {
  const now = new Date();
  const diff = TARGET_DATE - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

const pad = (n) => String(n).padStart(2, "0");

const TimeUnit = ({ value, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    className="flex flex-col items-center"
  >
    <span
      data-testid={`countdown-${label.toLowerCase()}`}
      className="font-mono text-5xl sm:text-7xl lg:text-8xl font-light text-[var(--text-primary)] tracking-tighter gold-glow"
    >
      {pad(value)}
    </span>
    <span className="text-[var(--gold)] text-[10px] sm:text-xs tracking-[0.3em] uppercase font-body mt-3">
      {label}
    </span>
  </motion.div>
);

export const CountdownTimer = () => {
  const [time, setTime] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => setTime(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section data-testid="countdown-section" className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(197,160,89,0.02)] to-transparent pointer-events-none" />
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-[var(--gold)] text-xs tracking-[0.3em] uppercase font-body mb-8"
        >
          The First Monday in May
        </motion.p>

        <div className="flex items-center justify-center gap-6 sm:gap-10 md:gap-16">
          <TimeUnit value={time.days} label="Days" delay={0} />
          <span className="text-[var(--border-gold)] text-4xl sm:text-6xl font-light font-mono mt-[-20px]">:</span>
          <TimeUnit value={time.hours} label="Hours" delay={0.1} />
          <span className="text-[var(--border-gold)] text-4xl sm:text-6xl font-light font-mono mt-[-20px]">:</span>
          <TimeUnit value={time.minutes} label="Minutes" delay={0.2} />
          <span className="text-[var(--border-gold)] text-4xl sm:text-6xl font-light font-mono mt-[-20px]">:</span>
          <TimeUnit value={time.seconds} label="Seconds" delay={0.3} />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-[var(--text-secondary)] text-sm font-body mt-10 tracking-wide"
        >
          May 4, 2026 &middot; The Metropolitan Museum of Art, New York
        </motion.p>
      </div>
    </section>
  );
};
