import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Check, Mail, ArrowLeft, Loader2 } from "lucide-react";
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
                Application Complete
              </p>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-light text-[var(--text-primary)] leading-tight mb-6">
                Welcome to the
                <br />
                <span className="italic text-[var(--gold)]">Met Gala 2026</span>
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
                Congratulations{application ? `, ${application.brand_name}` : ""}! Your application
                has been successfully received and your registration fee has been recorded.
              </p>

              <div className="border border-[var(--border-dark)] bg-[var(--bg-surface)] p-8 mt-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Mail className="w-5 h-5 text-[var(--gold)]" strokeWidth={1.5} />
                  <h3 className="text-[var(--text-primary)] text-sm tracking-[0.15em] uppercase font-body font-medium">
                    Next Steps
                  </h3>
                </div>
                <p className="text-[var(--text-secondary)] text-sm font-body leading-relaxed mb-4">
                  All further information regarding your participation in the 2026 Met Gala,
                  including your official invitation, dress code guidelines, event schedule,
                  and on-site coordination details, will be sent to:
                </p>
                {application && (
                  <p data-testid="confirmation-email" className="text-[var(--gold)] text-lg font-body font-medium">
                    {application.brand_email}
                  </p>
                )}
                <p className="text-[var(--text-secondary)] text-xs font-body mt-4">
                  Please ensure your inbox is monitored. Check your spam folder if you
                  do not receive correspondence within 48 hours.
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
                className="group inline-flex items-center gap-3 px-8 py-4 border border-[var(--gold)] text-[var(--gold)] text-xs tracking-[0.2em] uppercase font-body font-medium hover:bg-[var(--gold)] hover:text-[var(--bg-primary)] transition-colors duration-500 mt-6"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                Return to Home
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
