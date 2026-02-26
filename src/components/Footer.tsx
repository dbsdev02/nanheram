import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
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
  const whatsapp = settings.footer_whatsapp || "";
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
            <p className="mt-4 text-sm text-white/70">We'd love to hear from you!</p>
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
