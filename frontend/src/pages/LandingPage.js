import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ArrowRight, Star, Crown, Gem } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
};

const NOTABLE_ATTENDEES = [
  { name: "Anna Wintour", role: "Editor-in-Chief, Vogue & Global Chief Content Officer, Conde Nast", desc: "Chair of the Met Gala since 1995, transforming it into fashion's most prestigious event." },
  { name: "Rihanna", role: "Singer, Entrepreneur & Fashion Icon", desc: "Known for showstopping Met Gala looks including the iconic 2015 Guo Pei cape gown." },
  { name: "Zendaya", role: "Actress & Fashion Muse", desc: "Consistently delivers transformative Met Gala moments that define contemporary fashion." },
  { name: "Kim Kardashian", role: "Entrepreneur & Cultural Figure", desc: "From Mugler to Balenciaga, a red carpet presence that shapes cultural conversation." },
  { name: "Billy Porter", role: "Actor & Style Revolutionary", desc: "The golden Egyptian sun god outfit in 2019 remains one of the Gala's most iconic entrances." },
  { name: "Lady Gaga", role: "Singer & Performance Artist", desc: "Her 2019 four-outfit reveal on the pink carpet redefined Met Gala theatricality." },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div data-testid="landing-page" className="min-h-screen bg-[var(--bg-primary)]">
      <Header />

      {/* Hero Section */}
      <section data-testid="hero-section" className="relative min-h-screen flex items-end pb-24 md:pb-32 overflow-hidden">
        {/* Hero Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1768885560973-454bc193824d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxyZWQlMjBjYXJwZXQlMjBnYWxhfGVufDB8fHx8MTc3NDAzOTc5MHww&ixlib=rb-4.1.0&q=85"
            alt="Met Gala"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.3 }}
            className="max-w-3xl"
          >
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-[var(--gold)] text-xs tracking-[0.3em] uppercase font-body mb-6"
            >
              The Metropolitan Museum of Art &middot; Costume Institute
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="font-heading text-5xl sm:text-6xl lg:text-8xl font-light text-[var(--text-primary)] leading-[0.95] tracking-tight mb-8"
            >
              Fashion Brand
              <br />
              <span className="text-[var(--gold)] italic">Scout Program</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="text-[var(--text-secondary)] text-base md:text-lg font-body leading-relaxed max-w-xl mb-10"
            >
              An exclusive opportunity for emerging fashion houses to showcase their
              vision at the world's most prestigious fashion event. Inaugurating
              the new Conde M. Nast Galleries, celebrating the equivalency
              between fashion and high art.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.3 }}
              className="flex items-center gap-6"
            >
              <button
                data-testid="hero-apply-button"
                onClick={() => navigate("/apply")}
                className="group flex items-center gap-3 px-8 py-4 bg-[var(--gold)] text-[var(--bg-primary)] text-xs tracking-[0.2em] uppercase font-body font-semibold hover:bg-[var(--gold-hover)] transition-colors duration-500"
              >
                Begin Application
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button
                data-testid="hero-learn-more"
                onClick={() => document.getElementById("history")?.scrollIntoView({ behavior: "smooth" })}
                className="text-[var(--text-secondary)] text-xs tracking-[0.15em] uppercase font-body hover:text-[var(--gold)] transition-colors duration-300"
              >
                Learn More
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Countdown */}
      <CountdownTimer />

      {/* History Section */}
      <section id="history" data-testid="history-section" className="py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* Text Content */}
            <div>
              <motion.p {...fadeUp} className="text-[var(--gold)] text-xs tracking-[0.3em] uppercase font-body mb-4">
                Est. 1948
              </motion.p>
              <motion.h2
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.1 }}
                className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light text-[var(--text-primary)] leading-tight mb-8"
              >
                A Legacy of
                <br />
                <span className="italic text-[var(--gold)]">Fashion & Art</span>
              </motion.h2>

              <motion.div
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.2 }}
                className="space-y-6 text-[var(--text-secondary)] text-sm md:text-base leading-relaxed font-body"
              >
                <p>
                  The Met Gala, formally called the Costume Institute Gala or the
                  Costume Institute Benefit, is an annual fundraising gala held for
                  the benefit of the Metropolitan Museum of Art's Costume Institute
                  in New York City. It marks the opening of the Costume Institute's
                  annual fashion exhibit.
                </p>
                <p>
                  The event was first held in 1948 as a midnight supper, the brainchild
                  of fashion publicist <strong className="text-[var(--text-primary)]">Eleanor Lambert</strong>.
                  Initially a modest fundraiser with tickets priced at $50, it has evolved
                  into one of the most exclusive and high-profile events in the world,
                  with individual tickets now costing upward of $75,000.
                </p>
                <p>
                  Since 1995, the gala has been chaired by <strong className="text-[var(--text-primary)]">Anna Wintour</strong>,
                  editor-in-chief of Vogue, who transformed the event from a New York
                  society dinner into a global fashion phenomenon and major fundraising
                  enterprise. Under her stewardship, it has raised hundreds of millions
                  of dollars for the Costume Institute.
                </p>
                <p>
                  The 2026 gala inaugurates the new <strong className="text-[var(--text-primary)]">Conde M. Nast Galleries</strong>,
                  celebrating "equivalency" between fashion and high art &mdash; a landmark
                  moment in the museum's 154-year history, bridging the worlds of haute
                  couture and fine art within one of the world's greatest cultural institutions.
                </p>
              </motion.div>
            </div>

            {/* Image Grid */}
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.3 }}
              className="space-y-6"
            >
              <div className="border border-[var(--border-dark)] overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/5825359/pexels-photo-5825359.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                  alt="The Metropolitan Museum of Art Interior"
                  className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-[10s]"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="border border-[var(--border-dark)] overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/5825377/pexels-photo-5825377.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                    alt="Museum Architecture"
                    className="w-full aspect-[3/4] object-cover hover:scale-105 transition-transform duration-[10s]"
                  />
                </div>
                <div className="border border-[var(--border-dark)] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1763152608881-67c80e52d0fc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwyfHxyZWQlMjBjYXJwZXQlMjBnYWxhfGVufDB8fHx8MTc3NDAzOTc5MHww&ixlib=rb-4.1.0&q=85"
                    alt="Fashion Editorial"
                    className="w-full aspect-[3/4] object-cover hover:scale-105 transition-transform duration-[10s]"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Met Museum Section */}
      <section data-testid="museum-section" className="py-24 md:py-32 border-y border-[var(--border-dark)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <motion.p {...fadeUp} className="text-[var(--gold)] text-xs tracking-[0.3em] uppercase font-body mb-4">
            The Metropolitan Museum of Art
          </motion.p>
          <motion.h2
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="font-heading text-4xl sm:text-5xl font-light text-[var(--text-primary)] leading-tight mb-12 max-w-2xl"
          >
            Where Fashion Becomes <span className="italic text-[var(--gold)]">Art</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Crown,
                title: "The Costume Institute",
                desc: "Home to over 33,000 costumes and accessories spanning seven centuries of fashion from five continents, curated by a world-class team of scholars.",
              },
              {
                icon: Star,
                title: "Annual Exhibition",
                desc: "Each year's theme guides the gala's dress code and curates an exhibition that draws over a million visitors, elevating fashion to museum-worthy art.",
              },
              {
                icon: Gem,
                title: "Conde M. Nast Galleries",
                desc: "The 2026 expansion brings dedicated galleries celebrating fashion's equivalence with painting, sculpture, and the decorative arts.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.1 * (i + 1) }}
                className="group p-8 md:p-10 bg-[var(--bg-surface)] border border-[var(--border-dark)] hover:border-[var(--border-gold)] transition-colors duration-500"
              >
                <item.icon className="w-6 h-6 text-[var(--gold)] mb-6" strokeWidth={1} />
                <h3 className="font-heading text-xl md:text-2xl text-[var(--text-primary)] mb-4">{item.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-body">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Notable Attendees */}
      <section data-testid="attendees-section" className="py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <motion.p {...fadeUp} className="text-[var(--gold)] text-xs tracking-[0.3em] uppercase font-body mb-4">
            The Faces of the Gala
          </motion.p>
          <motion.h2
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="font-heading text-4xl sm:text-5xl font-light text-[var(--text-primary)] leading-tight mb-16 max-w-2xl"
          >
            Notable <span className="italic text-[var(--gold)]">Attendees</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border-dark)]">
            {NOTABLE_ATTENDEES.map((person, i) => (
              <motion.div
                key={person.name}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.05 * (i + 1) }}
                className="bg-[var(--bg-primary)] p-8 md:p-10 group hover:bg-[var(--bg-surface)] transition-colors duration-500"
              >
                <div className="w-10 h-10 border border-[var(--border-dark)] group-hover:border-[var(--gold)] flex items-center justify-center mb-6 transition-colors duration-500">
                  <span className="text-[var(--text-secondary)] group-hover:text-[var(--gold)] text-sm font-mono transition-colors duration-500">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-heading text-xl md:text-2xl text-[var(--text-primary)] mb-2">{person.name}</h3>
                <p className="text-[var(--gold)] text-xs tracking-wide font-body mb-4">{person.role}</p>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-body">{person.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section data-testid="cta-section" className="py-24 md:py-32 border-t border-[var(--border-dark)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <motion.p {...fadeUp} className="text-[var(--gold)] text-xs tracking-[0.3em] uppercase font-body mb-6">
            Applications Now Open
          </motion.p>
          <motion.h2
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light text-[var(--text-primary)] leading-tight mb-8 max-w-3xl mx-auto"
          >
            Your Brand Deserves the <span className="italic text-[var(--gold)]">Spotlight</span>
          </motion.h2>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.2 }}
            className="text-[var(--text-secondary)] text-base md:text-lg font-body mb-12 max-w-xl mx-auto"
          >
            Join an exclusive roster of emerging fashion houses selected to
            participate in the 2026 Met Gala experience.
          </motion.p>
          <motion.button
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.3 }}
            data-testid="cta-apply-button"
            onClick={() => navigate("/apply")}
            className="group inline-flex items-center gap-3 px-10 py-5 bg-[var(--gold)] text-[var(--bg-primary)] text-xs tracking-[0.2em] uppercase font-body font-semibold hover:bg-[var(--gold-hover)] transition-colors duration-500"
          >
            Begin Your Application
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </motion.button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
