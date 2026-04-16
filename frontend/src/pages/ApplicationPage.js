import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import axios from "axios";

const API = 'https://scoutweb-srz0.onrender.com/api';

const CATEGORIES = [
  "Haute Couture",
  "Ready-to-Wear",
  "Avant-Garde",
  "Streetwear / Urban Luxury",
  "Bridal & Evening Wear",
  "Accessories & Jewelry",
  "Sustainable Fashion",
  "Emerging Designer",
];

// Nigeria removed as requested
const COUNTRIES = [
  "United States", "United Kingdom", "France", "Italy", "Japan",
  "South Korea", "Brazil", "India", "China",
  "Australia", "Germany", "Spain", "Canada", "Mexico",
  "South Africa", "UAE", "Sweden", "Netherlands", "Other",
];

export default function ApplicationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Retrieve authenticated brand name
  const [brand, setBrand] = useState("");

  useEffect(() => {
    const fromState = location.state?.brand;
    const fromSession = sessionStorage.getItem("gala_brand");
    const resolved = fromState || fromSession || "";
    if (!resolved) {
      navigate("/", { replace: true });
      return;
    }
    setBrand(resolved);
    setForm((prev) => ({ ...prev, brand_name: resolved }));
  }, [location.state, navigate]);

  const [form, setForm] = useState({
    brand_name: "",
    brand_email: "",
    brand_address: "",
    brand_website: "",
    brand_category: "",
    year_founded: "",
    contact_person: "",
    contact_phone: "",
    brand_description: "",
    country: "",
  });

  const updateField = (field, value) => {
    // Prevent editing brand_name — it is locked
    if (field === "brand_name") return;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.brand_name.trim()) newErrors.brand_name = "Brand name is required";
    if (!form.brand_email.trim()) newErrors.brand_email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.brand_email)) newErrors.brand_email = "Invalid email address";
    if (!form.brand_address.trim()) newErrors.brand_address = "Address is required";
    if (!form.brand_category) newErrors.brand_category = "Category is required";
    if (!form.year_founded.trim()) newErrors.year_founded = "Year founded is required";
    if (!form.contact_person.trim()) newErrors.contact_person = "Contact person is required";
    if (!form.contact_phone.trim()) newErrors.contact_phone = "Phone number is required";
    if (!form.brand_description.trim()) newErrors.brand_description = "Description is required";
    if (!form.country) newErrors.country = "Country is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API}/applications`, form);
      const appId = response.data.id;
      navigate(`/payment/${appId}`);
    } catch (err) {
      console.error("Application submission error:", err);
      setErrors({ submit: "Failed to submit application. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "bg-transparent border-0 border-b border-[var(--border-dark)] rounded-none px-0 py-3 text-[var(--text-primary)] font-body text-sm placeholder:text-[var(--text-secondary)]/40 focus:border-[var(--gold)] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-300";

  const lockedInputClass =
    "bg-transparent border-0 border-b border-[var(--border-gold)] rounded-none px-0 py-3 text-[var(--gold)] font-body text-sm focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-not-allowed select-none tracking-wide";

  return (
    <div data-testid="application-page" className="min-h-screen bg-[var(--bg-primary)]">
      <Header />

      <div className="pt-32 pb-24 md:pb-32">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-16"
          >
            <p className="text-[var(--gold)] text-xs tracking-[0.3em] uppercase font-body mb-4">
              Step 1 of 2 &middot; Brand Application
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light text-[var(--text-primary)] leading-tight mb-4">
              Brand <span className="italic text-[var(--gold)]">Registration</span>
            </h1>
            {brand && (
              <p className="text-[var(--text-secondary)] text-sm font-body max-w-xl leading-relaxed">
                <span className="text-[var(--gold)]">{brand}</span>, your identity has been verified and pre-filled below. Complete the remaining fields to submit your application.
              </p>
            )}
          </motion.div>

          {/* Form Container */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl mx-auto"
          >
            <div className="border border-[var(--border-dark)] bg-[var(--bg-surface)] p-8 md:p-12">

              {/* Section: Brand Information */}
              <div className="mb-12">
                <h3 className="font-heading text-2xl text-[var(--text-primary)] mb-8">
                  Brand Information
                </h3>

                <div className="space-y-8">
                  {/* Brand Name — locked */}
                  <div>
                    <Label className="text-[var(--text-secondary)] text-xs tracking-[0.15em] uppercase font-body mb-2 block">
                      Brand Name
                      <span className="ml-3 inline-flex items-center gap-1 text-[var(--gold)] opacity-60">
                        <Lock className="w-2.5 h-2.5" strokeWidth={1.5} />
                        <span className="text-[0.55rem] tracking-[0.1em]">Verified &amp; Locked</span>
                      </span>
                    </Label>
                    <div className="relative">
                      <Input
                        data-testid="input-brand-name"
                        className={lockedInputClass}
                        value={form.brand_name}
                        readOnly
                        tabIndex={-1}
                        aria-readonly="true"
                        aria-label="Brand name — pre-filled and locked"
                      />
                      <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--border-gold)]" />
                    </div>
                    <p className="text-[var(--text-secondary)] text-[0.6rem] tracking-[0.1em] uppercase mt-1.5 font-body opacity-50">
                      Identity authenticated via Gala Gatekeeper
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <Label className="text-[var(--text-secondary)] text-xs tracking-[0.15em] uppercase font-body mb-2 block">
                        Category *
                      </Label>
                      <Select onValueChange={(v) => updateField("brand_category", v)}>
                        <SelectTrigger
                          data-testid="select-brand-category"
                          className="bg-transparent border-0 border-b border-[var(--border-dark)] rounded-none px-0 py-3 text-[var(--text-primary)] font-body text-sm focus:ring-0 focus:ring-offset-0 h-auto"
                        >
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-[var(--bg-elevated)] border-[var(--border-dark)]">
                          {CATEGORIES.map((cat) => (
                            <SelectItem
                              key={cat}
                              value={cat}
                              className="text-[var(--text-primary)] font-body text-sm focus:bg-[var(--bg-surface)] focus:text-[var(--gold)]"
                            >
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.brand_category && <p className="text-[var(--error)] text-xs mt-1 font-body">{errors.brand_category}</p>}
                    </div>

                    <div>
                      <Label className="text-[var(--text-secondary)] text-xs tracking-[0.15em] uppercase font-body mb-2 block">
                        Year Founded *
                      </Label>
                      <Input
                        data-testid="input-year-founded"
                        className={inputClass}
                        placeholder="e.g., 2019"
                        value={form.year_founded}
                        onChange={(e) => updateField("year_founded", e.target.value)}
                      />
                      {errors.year_founded && <p className="text-[var(--error)] text-xs mt-1 font-body">{errors.year_founded}</p>}
                    </div>
                  </div>

                  <div>
                    <Label className="text-[var(--text-secondary)] text-xs tracking-[0.15em] uppercase font-body mb-2 block">
                      Brand Website
                    </Label>
                    <Input
                      data-testid="input-brand-website"
                      className={inputClass}
                      placeholder="https://www.yourbrand.com"
                      value={form.brand_website}
                      onChange={(e) => updateField("brand_website", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="text-[var(--text-secondary)] text-xs tracking-[0.15em] uppercase font-body mb-2 block">
                      Brand Description *
                    </Label>
                    <Textarea
                      data-testid="input-brand-description"
                      className="bg-transparent border-0 border-b border-[var(--border-dark)] rounded-none px-0 py-3 text-[var(--text-primary)] font-body text-sm placeholder:text-[var(--text-secondary)]/40 focus:border-[var(--gold)] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-300 min-h-[100px] resize-none"
                      placeholder="Tell us about your brand's vision, aesthetic, and what makes it unique..."
                      value={form.brand_description}
                      onChange={(e) => updateField("brand_description", e.target.value)}
                    />
                    {errors.brand_description && <p className="text-[var(--error)] text-xs mt-1 font-body">{errors.brand_description}</p>}
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="h-px bg-[var(--border-dark)] my-12" />

              {/* Section: Contact & Address */}
              <div className="mb-12">
                <h3 className="font-heading text-2xl text-[var(--text-primary)] mb-8">
                  Contact & Address
                </h3>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <Label className="text-[var(--text-secondary)] text-xs tracking-[0.15em] uppercase font-body mb-2 block">
                        Contact Person *
                      </Label>
                      <Input
                        data-testid="input-contact-person"
                        className={inputClass}
                        placeholder="Full Name"
                        value={form.contact_person}
                        onChange={(e) => updateField("contact_person", e.target.value)}
                      />
                      {errors.contact_person && <p className="text-[var(--error)] text-xs mt-1 font-body">{errors.contact_person}</p>}
                    </div>

                    <div>
                      <Label className="text-[var(--text-secondary)] text-xs tracking-[0.15em] uppercase font-body mb-2 block">
                        Contact Phone *
                      </Label>
                      <Input
                        data-testid="input-contact-phone"
                        className={inputClass}
                        placeholder="+1 (212) 555-0100"
                        value={form.contact_phone}
                        onChange={(e) => updateField("contact_phone", e.target.value)}
                      />
                      {errors.contact_phone && <p className="text-[var(--error)] text-xs mt-1 font-body">{errors.contact_phone}</p>}
                    </div>
                  </div>

                  <div>
                    <Label className="text-[var(--text-secondary)] text-xs tracking-[0.15em] uppercase font-body mb-2 block">
                      Brand Email *
                    </Label>
                    <Input
                      data-testid="input-brand-email"
                      className={inputClass}
                      placeholder="contact@yourbrand.com"
                      type="email"
                      value={form.brand_email}
                      onChange={(e) => updateField("brand_email", e.target.value)}
                    />
                    {errors.brand_email && <p className="text-[var(--error)] text-xs mt-1 font-body">{errors.brand_email}</p>}
                  </div>

                  <div>
                    <Label className="text-[var(--text-secondary)] text-xs tracking-[0.15em] uppercase font-body mb-2 block">
                      Brand Address *
                    </Label>
                    <Input
                      data-testid="input-brand-address"
                      className={inputClass}
                      placeholder="123 Fashion Ave, Suite 500"
                      value={form.brand_address}
                      onChange={(e) => updateField("brand_address", e.target.value)}
                    />
                    {errors.brand_address && <p className="text-[var(--error)] text-xs mt-1 font-body">{errors.brand_address}</p>}
                  </div>

                  <div>
                    <Label className="text-[var(--text-secondary)] text-xs tracking-[0.15em] uppercase font-body mb-2 block">
                      Country *
                    </Label>
                    <Select onValueChange={(v) => updateField("country", v)}>
                      <SelectTrigger
                        data-testid="select-country"
                        className="bg-transparent border-0 border-b border-[var(--border-dark)] rounded-none px-0 py-3 text-[var(--text-primary)] font-body text-sm focus:ring-0 focus:ring-offset-0 h-auto"
                      >
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--bg-elevated)] border-[var(--border-dark)]">
                        {COUNTRIES.map((c) => (
                          <SelectItem
                            key={c}
                            value={c}
                            className="text-[var(--text-primary)] font-body text-sm focus:bg-[var(--bg-surface)] focus:text-[var(--gold)]"
                          >
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.country && <p className="text-[var(--error)] text-xs mt-1 font-body">{errors.country}</p>}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="mb-8 p-4 border border-[var(--error)]/30 bg-[var(--error)]/5">
                  <p data-testid="submit-error" className="text-[var(--error)] text-sm font-body">{errors.submit}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                data-testid="submit-application-button"
                onClick={handleSubmit}
                disabled={loading}
                className="group w-full flex items-center justify-center gap-3 px-8 py-4 bg-[var(--gold)] text-[var(--bg-primary)] text-xs tracking-[0.2em] uppercase font-body font-semibold hover:bg-[var(--gold-hover)] disabled:opacity-50 transition-colors duration-500"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Registration Fee
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>

              <p className="text-[var(--text-secondary)] text-xs font-body mt-6 text-center leading-relaxed">
                By submitting this application, you confirm that all information
                provided is accurate. A registration fee of $10,000 in Bitcoin
                will be required in the next step.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
