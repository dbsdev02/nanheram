import { Link } from "react-router-dom";
import { MessageCircle, Leaf, ShieldCheck, Award, Package } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import heroVideo from "@/assets/hero1.mp4";
import makhanaImg from "@/assets/Makhana.jpeg";
import cashewImg from "@/assets/cashewnew.jpeg";
import elaichiImg from "@/assets/Elaichi.jpeg";

const useReveal = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
};

const Section = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}>
      {children}
    </div>
  );
};

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("products").select("*").eq("featured", true).limit(4).then(({ data }) => {
      setFeaturedProducts(data || []);
    });
  }, []);

  return (
    <main>
      {/* Hero Video */}
      <section className="relative flex min-h-[85vh] items-end justify-center overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover">
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="relative z-10 pb-12">
          <Link to="/shop" className="rounded-full bg-accent px-8 py-3 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent/90 hover:scale-105">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-y border-border bg-secondary py-4">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array(2).fill(["✦ 100% Natural", "✦ Premium Quality", "✦ Hygienically Packed", "✦ Preservative-Free", "✦ Hand-Selected", "✦ Farm Fresh"]).flat().map((text, i) => (
            <span key={i} className="mx-8 text-sm font-medium uppercase tracking-widest text-muted-foreground">{text}</span>
          ))}
        </div>
      </div>

      {/* Brand Story */}
      <section className="py-16 md:py-24">
        <div className="container">
          <Section>
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Our Story</span>
              <h2 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-5xl">A Legacy of Purity & Taste</h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                At NanheRam, we believe in bringing nature's finest treasures to your table. Every product is hand-selected, hygienically packed, and delivered with a promise of unmatched quality.
              </p>
            </div>
          </Section>
        </div>
      </section>

      {/* Parallax */}
      <section className="parallax-section relative flex h-96 items-center justify-center md:h-[600px]" style={{ backgroundImage: `url(${cashewImg})` }}>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24">
        <div className="container">
          <Section>
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Our Products</span>
              <h2 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-5xl">Handpicked Favourites</h2>
            </div>
          </Section>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <Section key={product.id}><ProductCard product={product} /></Section>
            ))}
          </div>
          <Section>
            <div className="mt-10 text-center">
              <Link to="/shop" className="inline-block rounded-full border-2 border-primary px-8 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground">
                View All Products
              </Link>
            </div>
          </Section>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container">
          <Section>
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Explore</span>
              <h2 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-5xl">Shop by Category</h2>
            </div>
          </Section>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { name: "Dry Fruits", image: cashewImg, filter: "dry-fruits" },
              { name: "Spices", image: elaichiImg, filter: "spices" },
              { name: "Snacks", image: makhanaImg, filter: "snacks" },
            ].map((cat) => (
              <Section key={cat.name}>
                <Link to={`/shop?category=${cat.filter}`} className="group relative block aspect-[4/5] overflow-hidden rounded-lg">
                  <img src={cat.image} alt={cat.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6">
                    <h3 className="font-serif text-2xl font-bold text-white md:text-3xl">{cat.name}</h3>
                    <span className="mt-2 inline-block text-sm font-medium text-white/80 underline underline-offset-4">Shop {cat.name} →</span>
                  </div>
                </Link>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* Parallax 2 */}
      <section className="parallax-section relative flex h-96 items-center justify-center md:h-[600px]" style={{ backgroundImage: `url(${makhanaImg})` }}>
      </section>

      {/* Trust Badges */}
      <section className="py-16 md:py-24">
        <div className="container">
          <Section>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Leaf, title: "100% Natural", desc: "No artificial colours, flavours, or additives." },
                { icon: Package, title: "Hygienically Packed", desc: "Sealed fresh for maximum shelf life." },
                { icon: Award, title: "Premium Quality", desc: "Hand-selected and rigorously tested." },
                { icon: ShieldCheck, title: "Preservative-Free", desc: "Pure ingredients, zero preservatives." },
              ].map((badge) => (
                <div key={badge.title} className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <badge.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">{badge.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{badge.desc}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-12 md:py-16">
        <div className="container text-center">
          <Section>
            <h2 className="font-serif text-2xl font-bold text-primary-foreground md:text-4xl">Ready to Order?</h2>
            <p className="mt-3 text-primary-foreground/80">Browse our products and get them delivered to your doorstep.</p>
            <Link to="/shop" className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent/90 hover:scale-105">
              Shop Now
            </Link>
          </Section>
        </div>
      </section>
    </main>
  );
};

export default Index;
