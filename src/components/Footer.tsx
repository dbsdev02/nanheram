import { Link } from "react-router-dom";
import { MessageCircle, Instagram, Facebook, Linkedin, Twitter, Youtube, Building2 } from "lucide-react";
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
  const whatsapp = settings.footer_whatsapp || "919165694409";
  const copyright = settings.footer_copyright || "Nanheram . Bedar Wills India Pvt Ltd. All rights reserved.";

  return (
    <footer className="border-t border-border bg-foreground text-white">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <img src={mainLogo} alt="NanheRam" className="h-16 w-auto mb-3" />
            <p className="mt-3 text-sm leading-relaxed text-white/70">{tagline}</p>
            {/* Trusted Website */}
            <div className="mt-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-white/40">Trusted Website</p>
              <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                </svg>
                <span className="text-xs font-semibold text-white/70">Secure SSL Encrypted</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-50">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Home", to: "/" },
                { label: "Shop", to: "/shop" },
                { label: "Dry Fruits", to: "/shop?category=dry-fruits" },
                { label: "Spices", to: "/shop?category=spices" },
                { label: "Snacks", to: "/shop?category=snacks" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-white/70 transition-opacity hover:opacity-100">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-50">Information</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "About Us", to: "/about" },
                { label: "Contact", to: "/contact" },
                { label: "Privacy Policy", to: "/privacy-policy" },
                { label: "Terms & Conditions", to: "/terms-and-conditions" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-white/70 transition-opacity hover:opacity-100">{link.label}</Link>
                </li>
              ))}
              <li>
                <Link to="/contact?type=b2b#b2b-section" className="inline-flex items-center gap-1.5 text-white/70 transition-opacity hover:opacity-100">
                  <Building2 className="h-4 w-4" />
                  B2B / Wholesale
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-50">Get in Touch</h4>
            <div className="space-y-3 text-sm mb-4">
              <a href="mailto:care@nanheram.com" className="flex items-center gap-2 text-white/70 transition-opacity hover:opacity-100">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                care@nanheram.com
              </a>
              <a href="tel:+917869462082" className="flex items-center gap-2 text-white/70 transition-opacity hover:opacity-100">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                +91 78694 62082
              </a>
            </div>
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

        {/* Pay & Platform Badges */}
        <div className="mt-10 border-t border-white/10 pt-8 grid gap-6 sm:grid-cols-2">

          {/* Securely pay using */}
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/40">Securely Pay Using</p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-md bg-white/10 px-3 py-2">
                <span className="text-sm font-black tracking-tight text-[#097939]">UPI</span>
                <span className="text-[10px] text-white/50">▶</span>
              </div>
              <div className="flex items-center gap-1 rounded-md bg-white/10 px-3 py-2">
                <span className="inline-block h-5 w-5 rounded-full bg-[#EB001B] opacity-90" style={{marginRight:"-10px"}} />
                <span className="inline-block h-5 w-5 rounded-full bg-[#F79E1B] opacity-90" />
                <span className="ml-1.5 text-xs font-semibold text-white/70">Mastercard</span>
              </div>
              <div className="flex items-center rounded-md bg-white/10 px-3 py-2">
                <span className="text-lg font-black italic tracking-tight text-[#1A1F71]">VISA</span>
              </div>
            </div>
          </div>

          {/* Available soon on */}
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/40">Available Soon On</p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-md bg-white/10 px-3 py-2">
                <span className="text-sm font-black text-[#F8C200]">blinkit</span>
              </div>
              <div className="rounded-md bg-white/10 px-3 py-2">
                <span className="text-sm font-black text-[#84C225]">big</span><span className="text-sm font-black text-[#E31E24]">basket</span>
              </div>
              <div className="rounded-md bg-white/10 px-3 py-2">
                <span className="text-sm font-black text-[#FF9900]">amazon</span>
              </div>
              <div className="rounded-md bg-white/10 px-3 py-2">
                <span className="text-sm font-black text-[#8B2FC9]">zepto</span>
              </div>
              <div className="rounded-md bg-white/10 px-3 py-2">
                <span className="text-sm font-black text-[#2874F0]">flipkart</span>
              </div>
              <div className="rounded-md bg-white/10 px-3 py-2">
                <span className="text-sm font-black text-[#0F6CBD]">JioMart</span>
              </div>
              <div className="rounded-md bg-white/10 px-3 py-2">
                <span className="text-sm font-black text-[#F9A825]">shopsy</span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-6 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} {copyright}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
