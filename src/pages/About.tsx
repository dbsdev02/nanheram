import { Leaf, Heart, Star } from "lucide-react";
import cashewImg from "@/assets/cashewnew.jpeg";
import almondsImg from "@/assets/Almonds.jpeg";
import makhanaImg from "@/assets/Makhana.jpeg";
import elaichiImg from "@/assets/Elaichi.jpeg";

const About = () => {
  return (
    <main className="bg-[#F6F1EA]">
      {/* Hero */}
      <section className="relative h-[360px] md:h-[420px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${almondsImg})` }}
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div>
            <p className="text-xs md:text-sm tracking-[0.25em] text-white/80 uppercase">
              About Us
            </p>
            <h1 className="mt-2 text-4xl md:text-6xl font-semibold text-white">
              Our Story
            </h1>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-14 md:py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl md:text-4xl font-semibold text-[#2B1D14] mb-12">
            Our Journey Through Generations
          </h2>

          <div className="space-y-16">
            {/* Generation 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1">
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={makhanaImg}
                    alt="Mr. Nanhe Ram - Founder"
                    className="w-full h-[280px] object-cover"
                  />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-block px-4 py-1 bg-[#E9E0D6] rounded-full text-xs font-semibold text-[#2B1D14] mb-3">
                  Before 1970s
                </div>
                <h3 className="text-2xl font-semibold text-[#2B1D14] mb-4">
                  Mr. Nanhe Ram - The Beginning
                </h3>
                <p className="text-[#5A463B] leading-relaxed">
                  In Gonghari, Madhya Pradesh, Mr. Nanhe Ram started making traditional snacks and sweets in his home. His homemade treats, prepared with care and age-old techniques, gained recognition for their authentic taste and quality throughout the village.
                </p>
              </div>
            </div>

            {/* Generation 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="order-2">
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={elaichiImg}
                    alt="Mr. Rajesh Gupta - Second Generation"
                    className="w-full h-[280px] object-cover"
                  />
                </div>
              </div>
              <div className="order-1">
                <div className="inline-block px-4 py-1 bg-[#E9E0D6] rounded-full text-xs font-semibold text-[#2B1D14] mb-3">
                  Second Generation
                </div>
                <h3 className="text-2xl font-semibold text-[#2B1D14] mb-4">
                  Mr. Rajesh Gupta - Carrying Forward
                </h3>
                <p className="text-[#5A463B] leading-relaxed">
                  After a tragic accident, Mr. Nanhe Ram passed his knowledge and recipes to his son, Rajesh Gupta. Rajesh continued the family tradition, taking the snacks to local markets and working to expand the business with dedication.
                </p>
              </div>
            </div>

            {/* Generation 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1">
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={cashewImg}
                    alt="Mr. Rajat Gupta - Third Generation"
                    className="w-full h-[280px] object-cover"
                  />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-block px-4 py-1 bg-[#E9E0D6] rounded-full text-xs font-semibold text-[#2B1D14] mb-3">
                  Third Generation - Today
                </div>
                <h3 className="text-2xl font-semibold text-[#2B1D14] mb-4">
                  Mr. Rajat Gupta - Modern Vision
                </h3>
                <p className="text-[#5A463B] leading-relaxed">
                  Mr. Rajat Gupta revived the brand with a clear vision and modern approach. He completed all formalities, built a strong business foundation, and transformed Nanheram into a well-established, trusted name serving households across India.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conclusion Section */}
      <section className="py-14 md:py-20 bg-gradient-to-b from-[#F6F1EA] to-[#F2EADF]">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-[#2B1D14] mb-6">
            Today, Nanheram...
          </h2>
          <div className="space-y-5 text-[#5A463B] leading-relaxed text-lg">
            <p>
              Today, Nanheram stands proud as a symbol of perseverance, tradition, and innovation. What started in a humble home in Gonghari has grown into a trusted name across India.
            </p>
            <p className="font-medium text-[#2B1D14]">
              We serve thousands of families with healthy, delicious snacks — each product crafted with the same authenticity and care that Mr. Nanhe Ram believed in.
            </p>
            <p>
              Every pack of Nanheram carries the spirit of three generations, the warmth of Gonghari, and an unwavering commitment to quality. From our family to yours, we continue the legacy — one wholesome bite at a time.
            </p>
          </div>
          <div className="mt-10 inline-block px-8 py-4 bg-white rounded-2xl shadow-md">
            <p className="text-sm text-[#5A463B] mb-2">Our Promise</p>
            <p className="text-xl md:text-2xl font-semibold text-[#2B1D14]">
              Pure. Authentic. Trusted.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-14 md:py-20 bg-[#F2EADF]">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl md:text-4xl font-semibold text-[#2B1D14]">
            What We Stand For
          </h2>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <ValueCard
              title="Purity"
              desc="Every product is 100% natural — free from preservatives, colours, and artificial additives."
              icon="🍃"
            />
            <ValueCard
              title="Care"
              desc="From sourcing to packaging, we handle every step with attention and love."
              icon="💚"
            />
            <ValueCard
              title="Quality"
              desc="Only the finest, hand-selected ingredients make it into a NanheRam pack."
              icon="⭐"
            />
          </div>
        </div>
      </section>
    </main>
  );
};

function ValueCard({ title, desc, icon }: { title: string; desc: string; icon: string }) {
  return (
    <div className="bg-white/80 rounded-2xl border border-black/5 shadow-sm p-8 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-[#E9E0D6] flex items-center justify-center text-xl">
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-semibold text-[#2B1D14]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#5A463B]">{desc}</p>
    </div>
  );
}

export default About;
