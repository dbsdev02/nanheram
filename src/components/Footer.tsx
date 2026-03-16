import { Link } from "react-router-dom";
import { MessageCircle, Instagram, Facebook, Linkedin, Twitter, Youtube } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import mainLogo from "@/assets/mainlogo.png";

const Footer = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase
      .from("admin_settings")
      .select("setting_key, setting_value")
      .eq("setting_group", "footer")
      .then(({ data }) => {
        const map: Record<string, string> = {};
        (data || []).forEach((s) => { map[s.setting_key] = s.setting_value || ""; });
        setSettings(map);
      });
  }, []);

  const tagline = settings.footer_tagline || "Pure nutrition packed in every bite. Premium dry fruits, spices & snacks sourced with care.";
  const whatsapp = settings.footer_whatsapp || "916569494409";
  const copyright = settings.footer_copyright || "NanheRam. All rights reserved.";

  return (
    <footer className="border-t border-border bg-foreground text-white">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <img src={mainLogo} alt="NanheRam" className="h-16 w-auto mb-3" />
            <p className="mt-3 text-sm leading-relaxed text-white/70">{tagline}</p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-50">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Home", to: "/" },
                { label: "Shop", to: "/shop" },
                { label: "About Us", to: "/about" },
                { label: "Contact", to: "/contact" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-white/70 transition-opacity hover:opacity-100">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Categories */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-50">Information</h4>
            <ul className="space-y-2 text-sm">
              {["Dry Fruits", "Spices", "Snacks"].map((cat) => (
                <li key={cat}>
                  <Link to="/shop" className="text-white/70 transition-opacity hover:opacity-100">{cat}</Link>
                </li>
              ))}
              <li>
                <Link to="/privacy-policy" className="text-white/70 transition-opacity hover:opacity-100">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="text-white/70 transition-opacity hover:opacity-100">Terms & Conditions</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-50">Get in Touch</h4>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp Us
            </a>
            <div className="mt-4">
              <p className="text-sm text-white/70 mb-3">Follow us on social media</p>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="https://www.instagram.com/nanheram_india"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="https://www.facebook.com/share/1JA6rSr7Sg/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="https://www.linkedin.com/in/nanheram-india-a36737376"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href="https://x.com/Nanheram_india"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
                  aria-label="Twitter/X"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a
                  href="https://youtube.com/@nanheramindia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
                  aria-label="YouTube"
                >
                  <Youtube className="h-4 w-4" />
                </a>
                <a
                  href="https://www.threads.com/@nanheram_india"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
                  aria-label="Threads"
                >
                  <span className="text-lg font-bold">@</span>
                </a>
                <a
                  href="https://pin.it/41IdVLmdZ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
                  aria-label="Pinterest"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.182-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.852 0 1.264.64 1.264 1.408 0 .858-.545 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.331 1.781.745 2.281a.3.3 0 01.069.288l-.278 1.133c-.044.183-.145.223-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.525-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} {copyright}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
