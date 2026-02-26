import cashewImg from "@/assets/Cashew.jpeg";
import almondsImg from "@/assets/Almonds.jpeg";
import resinImg from "@/assets/Resin.jpeg";
import elaichiImg from "@/assets/Elaichi.jpeg";
import makhanaImg from "@/assets/Makhana.jpeg";

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: "dry-fruits" | "spices" | "snacks";
  categoryLabel: string;
  image: string;
  shortDesc: string;
  description: string;
  benefits: string[];
  whatsappMessage: string;
};

export const products: Product[] = [
  {
    id: "cashew",
    name: "Premium Cashews",
    slug: "cashews",
    category: "dry-fruits",
    categoryLabel: "Dry Fruits",
    image: cashewImg,
    shortDesc: "Hand-selected whole cashews with a rich, buttery taste.",
    description:
      "Our premium cashews are carefully sourced and selected for their superior size, crunch, and flavour. Each cashew is whole, unbroken, and naturally rich in healthy fats, protein, and essential minerals. Perfect for snacking, cooking, or gifting.",
    benefits: ["100% Natural", "Rich in Protein", "No Preservatives", "Premium Quality"],
    whatsappMessage: "Hi, I'd like to order Premium Cashews from NanheRam. Please share details.",
  },
  {
    id: "almonds",
    name: "California Almonds",
    slug: "almonds",
    category: "dry-fruits",
    categoryLabel: "Dry Fruits",
    image: almondsImg,
    shortDesc: "Crunchy California almonds — nature's powerhouse snack.",
    description:
      "Sourced from the finest Californian orchards, our almonds are packed with Vitamin E, fibre, and healthy fats. Enjoy them raw, soaked, or roasted — a timeless superfood for every household.",
    benefits: ["100% Natural", "Rich in Vitamin E", "Heart Healthy", "Hygienically Packed"],
    whatsappMessage: "Hi, I'd like to order California Almonds from NanheRam. Please share details.",
  },
  {
    id: "raisins",
    name: "Golden Raisins",
    slug: "raisins",
    category: "dry-fruits",
    categoryLabel: "Dry Fruits",
    image: resinImg,
    shortDesc: "Sweet, golden raisins — a natural energy booster.",
    description:
      "Our golden raisins are sun-dried to perfection, retaining their natural sweetness and nutritional goodness. Rich in iron and antioxidants, they make an excellent addition to desserts, cereals, and everyday snacking.",
    benefits: ["100% Natural", "Rich in Iron", "Natural Sweetness", "Preservative-Free"],
    whatsappMessage: "Hi, I'd like to order Golden Raisins from NanheRam. Please share details.",
  },
  {
    id: "elaichi",
    name: "Green Elaichi",
    slug: "elaichi",
    category: "spices",
    categoryLabel: "Spices",
    image: elaichiImg,
    shortDesc: "Aromatic green cardamom — the queen of spices.",
    description:
      "Hand-picked and naturally dried, our green elaichi delivers an intense aroma and warm flavour that elevates every dish and beverage. From chai to biryani, experience the authentic taste of premium cardamom.",
    benefits: ["100% Natural", "Intensely Aromatic", "Traditionally Sourced", "Premium Grade"],
    whatsappMessage: "Hi, I'd like to order Green Elaichi from NanheRam. Please share details.",
  },
  {
    id: "makhana",
    name: "Roasted Makhana",
    slug: "makhana",
    category: "snacks",
    categoryLabel: "Snacks",
    image: makhanaImg,
    shortDesc: "Light, crunchy fox nuts — the guilt-free snack.",
    description:
      "Our roasted makhana (fox nuts) are lightly seasoned and perfectly crunchy. Low in calories and high in protein, they're the ideal snack for health-conscious families. A wholesome alternative to processed snacks.",
    benefits: ["100% Natural", "Low Calorie", "High Protein", "Guilt-Free Snacking"],
    whatsappMessage: "Hi, I'd like to order Roasted Makhana from NanheRam. Please share details.",
  },
];

export const categories = [
  { id: "all", label: "All Products" },
  { id: "dry-fruits", label: "Dry Fruits" },
  { id: "spices", label: "Spices" },
  { id: "snacks", label: "Snacks" },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const getRelatedProducts = (id: string) => products.filter((p) => p.id !== id).slice(0, 3);
export const getWhatsAppLink = (message: string) =>
  `https://wa.me/?text=${encodeURIComponent(message)}`;
