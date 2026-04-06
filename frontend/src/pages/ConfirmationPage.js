import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Check, Mail, ArrowLeft, Loader2, Clock, Home } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ConfirmationPage() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const resp = await axios.get(`${API}/applications/${appId}`);
        setApplication(resp.data);
      } catch (err) {
        console.error("Failed to load application:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [appId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--gold)] animate-spin" />
      </div>
    );
  }

  return (
    <div data-testid="confirmation-page" className="min-h-screen bg-[var(--bg-primary)]">
      <Header />

      <div className="pt-32 pb-24 md:pb-32 min-h-screen flex items-center">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full">
          <div className="max-w-2xl mx-auto text-center">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="w-20 h-20 border-2 border-[var(--gold)] mx-auto mb-10 flex items-center justify-center"
            >
              <Check className="w-10 h-10 text-[var(--gold)]" strokeWidth={1.5} />
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <p className="text-[var(--gold)] text-xs tracking-[0.3em] uppercase font-body mb-6">
                Registration Successful
              </p>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-light text-[var(--text-primary)] leading-tight mb-6">
                Congratulations,
                <br />
                <span className="italic text-[var(--gold)]">
                  {application ? application.brand_name : "Applicant"}
                </span>
              </h1>
            </motion.div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="space-y-6"
            >
              <p className="text-[var(--text-secondary)] text-base md:text-lg font-body leading-relaxed max-w-lg mx-auto">
                Your application to the Met Gala 2026 Brand Scout Program has been
                successfully submitted and your registration fee has been recorded.
                Welcome aboard.
              </p>

              {/* What Happens Next */}
              <div className="border border-[var(--border-dark)] bg-[var(--bg-surface)] p-8 md:p-10 mt-10">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Clock className="w-5 h-5 text-[var(--gold)]" strokeWidth={1.5} />
                  <h3 className="text-[var(--text-primary)] text-sm tracking-[0.15em] uppercase font-body font-medium">
                    What Happens Next
                  </h3>
                </div>
                <p className="text-[var(--text-secondary)] text-sm font-body leading-relaxed mb-6">
                  Our curatorial team will now review your application and brand portfolio.
                  Please allow our team <strong className="text-[var(--text-primary)]">5&ndash;10 business days</strong> to
                  evaluate your submission. You will receive feedback and further
                  correspondence regarding your participation directly to:
                </p>
                {application && (
                  <p data-testid="confirmation-email" className="text-[var(--gold)] text-lg font-body font-medium mb-4">
                    {application.brand_email}
                  </p>
                )}
                <div className="h-px bg-[var(--border-dark)] my-6" />
                <div className="space-y-3 text-left max-w-md mx-auto">
                  {[
                    "Application review by the Met Gala curatorial committee",
                    "Official invitation and dress code guidelines",
                    "Event schedule and on-site coordination details",
                    "Media and press accreditation information",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-[var(--gold)] text-xs font-mono mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                      <p className="text-[var(--text-secondary)] text-sm font-body">{step}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[var(--text-secondary)] text-xs font-body mt-6">
                  Please ensure your inbox is monitored. Check your spam folder if you
                  do not receive correspondence within the stated timeframe.
                </p>
              </div>

              {application && (
                <div className="border border-[var(--border-dark)] bg-[var(--bg-surface)] p-6 mt-6">
                  <p className="text-[var(--text-secondary)] text-xs font-mono mb-1">APPLICATION REFERENCE</p>
                  <p data-testid="application-reference" className="text-[var(--gold)] text-sm font-mono break-all">
                    {application.id}
                  </p>
                </div>
              )}

              <p className="text-[var(--text-secondary)] text-sm font-body mt-8">
                For any questions or concerns, contact our team at{" "}
                <a
                  href="mailto:support@metbrandscout.co"
                  className="text-[var(--gold)] hover:text-[var(--gold-hover)] transition-colors duration-300"
                >
                  support@metbrandscout.co
                </a>
              </p>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                data-testid="back-to-home"
                onClick={() => navigate("/")}
                className="group inline-flex items-center gap-3 px-10 py-5 bg-[var(--gold)] text-[var(--bg-primary)] text-xs tracking-[0.2em] uppercase font-body font-semibold hover:bg-[var(--gold-hover)] transition-colors duration-500 mt-6"
              >
                <Home className="w-4 h-4" />
                Return to Homepage
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
