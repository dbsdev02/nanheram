import { useState } from "react";
import { MessageCircle, Mail, MapPin, Building2, ShoppingBag, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type InquiryType = "general" | "b2b";

const Contact = () => {
  const { toast } = useToast();
  const [inquiryType, setInquiryType] = useState<InquiryType>("general");
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: inquiryType === "b2b" ? "B2B inquiry sent!" : "Message sent!",
      description: "Thank you for reaching out. We'll get back to you soon.",
    });
    setForm({ name: "", email: "", phone: "", company: "", message: "" });
  };

  return (
    <main className="py-12 md:py-20">
      <div className="container">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Contact</span>
          <h1 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-5xl">
            Get in Touch
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Have questions, want to place a bulk order, or interested in B2B partnerships? We'd love to hear from you.
          </p>
        </div>

        {/* Inquiry Type Toggle */}
        <div className="mx-auto mt-10 flex max-w-md items-center justify-center gap-3">
          <button
            onClick={() => setInquiryType("general")}
            className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all ${
              inquiryType === "general"
                ? "border-accent bg-accent text-accent-foreground shadow-sm"
                : "border-border bg-card text-muted-foreground hover:border-accent/50"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            General Inquiry
          </button>
          <button
            onClick={() => setInquiryType("b2b")}
            className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all ${
              inquiryType === "b2b"
                ? "border-accent bg-accent text-accent-foreground shadow-sm"
                : "border-border bg-card text-muted-foreground hover:border-accent/50"
            }`}
          >
            <Building2 className="h-4 w-4" />
            B2B / Wholesale
          </button>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-12 md:grid-cols-2">
          {/* Contact Info */}
          <div className="space-y-8">
            {inquiryType === "b2b" ? (
              <>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-foreground">B2B & Wholesale</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Looking for premium dry fruits in bulk? We offer competitive wholesale pricing for retailers, restaurants, hotels, and corporate gifting. Minimum order quantities apply.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/50 p-5 space-y-3">
                  <h4 className="font-semibold text-foreground text-sm">Why Partner with NanheRam?</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      Premium quality, directly sourced dry fruits
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      Competitive wholesale pricing
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      Custom packaging & private labeling available
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      Pan-India delivery with reliable logistics
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div>
                <h3 className="font-serif text-xl font-semibold text-foreground">Order via WhatsApp</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  The fastest way to order! Tap below to chat with us directly.
                </p>
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat on WhatsApp
                </a>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Mail className="mt-1 h-5 w-5 text-accent" />
              <div>
                <h4 className="font-semibold text-foreground">Email</h4>
                <p className="text-sm text-muted-foreground">
                  {inquiryType === "b2b" ? "info@nanheram.com" : "hello@nanheram.com"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-1 h-5 w-5 text-accent" />
              <div>
                <h4 className="font-semibold text-foreground">Phone</h4>
                <p className="text-sm text-muted-foreground">+91 76238 78971</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-accent" />
              <div>
                <h4 className="font-semibold text-foreground">Location</h4>
                <p className="text-sm text-muted-foreground">India</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
            <h3 className="font-serif text-lg font-semibold text-foreground">
              {inquiryType === "b2b" ? "B2B Inquiry Form" : "Send Us a Message"}
            </h3>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                required
              />
            </div>
            {inquiryType === "b2b" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Company Name</label>
                <Input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="Your company or business name"
                  required
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Phone</label>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {inquiryType === "b2b" ? "Requirements / Message" : "Message"}
              </label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder={
                  inquiryType === "b2b"
                    ? "Tell us about your requirements — products, quantities, delivery location..."
                    : "Tell us what you need..."
                }
                rows={4}
                required
              />
            </div>
            <Button type="submit" className="w-full rounded-full">
              {inquiryType === "b2b" ? "Submit B2B Inquiry" : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Contact;
