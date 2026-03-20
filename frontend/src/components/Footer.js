import { Separator } from "@/components/ui/separator";

export const Footer = () => {
  return (
    <footer id="footer" data-testid="main-footer" className="bg-[var(--bg-primary)] border-t border-[var(--border-dark)]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 border border-[var(--gold)] flex items-center justify-center">
                <span className="text-[var(--gold)] font-heading text-lg font-semibold">M</span>
              </div>
              <span className="text-[var(--text-primary)] text-xs tracking-[0.2em] uppercase font-body font-medium">
                Met Gala Brand Scout
              </span>
            </div>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-body max-w-xs">
              The official scouting program for emerging fashion brands seeking
              recognition at the Metropolitan Museum of Art's Costume Institute Gala.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[var(--gold)] text-xs tracking-[0.2em] uppercase font-body font-medium mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="/" className="text-[var(--text-secondary)] text-sm font-body hover:text-[var(--gold)] transition-colors duration-300">
                  Home
                </a>
              </li>
              <li>
                <a href="/apply" className="text-[var(--text-secondary)] text-sm font-body hover:text-[var(--gold)] transition-colors duration-300">
                  Apply Now
                </a>
              </li>
              <li>
                <a href="https://www.metmuseum.org" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] text-sm font-body hover:text-[var(--gold)] transition-colors duration-300">
                  The Met Museum
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[var(--gold)] text-xs tracking-[0.2em] uppercase font-body font-medium mb-6">
              Customer Support
            </h4>
            <p className="text-[var(--text-secondary)] text-sm font-body mb-2">
              For inquiries and assistance:
            </p>
            <a
              data-testid="support-email"
              href="mailto:support@metbrandscout.co"
              className="text-[var(--gold)] text-sm font-body hover:text-[var(--gold-hover)] transition-colors duration-300"
            >
              support@metbrandscout.co
            </a>
          </div>
        </div>

        <Separator className="my-12 bg-[var(--border-dark)]" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[var(--text-secondary)] text-xs font-body tracking-wide">
            &copy; {new Date().getFullYear()} Met Gala Brand Scout. In collaboration with The Metropolitan Museum of Art.
          </p>
          <p className="text-[var(--text-secondary)] text-xs font-body tracking-wide">
            The Costume Institute &middot; New York, NY
          </p>
        </div>
      </div>
    </footer>
  );
};
