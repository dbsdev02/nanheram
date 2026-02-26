import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eqyvawvybtpwttdhgxgk.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeXZhd3Z5YnRwd3R0ZGhneGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNDU4MTMsImV4cCI6MjA4NjkyMTgxM30.rArm35bixtmVPwVQ4sfztdAiJv7JeEACHOLQctlpDXc';

const supabase = createClient(supabaseUrl, supabaseKey);

const products = [
  {
    name: "Premium Almonds",
    slug: "premium-almonds",
    description: "High-quality California almonds, rich in nutrients and perfect for snacking.",
    short_desc: "Crunchy and nutritious California almonds",
    category: "dry-fruits",
    category_label: "Dry Fruits",
    price: 599,
    compare_price: 699,
    image_url: "https://images.unsplash.com/photo-1508747703725-719777637510?w=800",
    benefits: ["Rich in Vitamin E", "Heart healthy", "High in protein", "Boosts brain function"],
    in_stock: true,
    featured: true
  },
  {
    name: "Cashew Nuts",
    slug: "cashew-nuts",
    description: "Premium quality cashews, creamy and delicious.",
    short_desc: "Creamy and buttery cashew nuts",
    category: "dry-fruits",
    category_label: "Dry Fruits",
    price: 799,
    compare_price: 899,
    image_url: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800",
    benefits: ["Rich in minerals", "Good for heart", "Boosts immunity", "Healthy fats"],
    in_stock: true,
    featured: true
  },
  {
    name: "Raisins",
    slug: "raisins",
    description: "Sweet and chewy raisins, naturally dried grapes.",
    short_desc: "Sweet and nutritious dried grapes",
    category: "dry-fruits",
    category_label: "Dry Fruits",
    price: 299,
    compare_price: 349,
    image_url: "https://images.unsplash.com/photo-1587049352846-4a222e784acc?w=800",
    benefits: ["Natural energy boost", "Rich in iron", "Good for digestion", "Antioxidants"],
    in_stock: true,
    featured: false
  },
  {
    name: "Walnuts",
    slug: "walnuts",
    description: "Brain-shaped walnuts packed with omega-3 fatty acids.",
    short_desc: "Omega-3 rich walnuts",
    category: "dry-fruits",
    category_label: "Dry Fruits",
    price: 899,
    compare_price: 999,
    image_url: "https://images.unsplash.com/photo-1622484211850-cc1f8f6e3f6e?w=800",
    benefits: ["Brain health", "Omega-3 fatty acids", "Anti-inflammatory", "Heart healthy"],
    in_stock: true,
    featured: true
  },
  {
    name: "Turmeric Powder",
    slug: "turmeric-powder",
    description: "Pure and organic turmeric powder with natural curcumin.",
    short_desc: "Pure organic turmeric powder",
    category: "spices",
    category_label: "Spices",
    price: 149,
    compare_price: 199,
    image_url: "https://images.unsplash.com/photo-1615485500834-bc10199bc768?w=800",
    benefits: ["Anti-inflammatory", "Boosts immunity", "Natural antioxidant", "Aids digestion"],
    in_stock: true,
    featured: true
  },
  {
    name: "Red Chili Powder",
    slug: "red-chili-powder",
    description: "Spicy and aromatic red chili powder for authentic Indian cooking.",
    short_desc: "Authentic spicy chili powder",
    category: "spices",
    category_label: "Spices",
    price: 129,
    compare_price: 159,
    image_url: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800",
    benefits: ["Boosts metabolism", "Rich in Vitamin C", "Pain relief", "Improves digestion"],
    in_stock: true,
    featured: false
  },
  {
    name: "Cumin Seeds",
    slug: "cumin-seeds",
    description: "Aromatic cumin seeds, essential for Indian cuisine.",
    short_desc: "Aromatic whole cumin seeds",
    category: "spices",
    category_label: "Spices",
    price: 99,
    compare_price: 129,
    image_url: "https://images.unsplash.com/photo-1596040033229-a0b3b83e6c4f?w=800",
    benefits: ["Aids digestion", "Rich in iron", "Boosts immunity", "Antioxidant properties"],
    in_stock: true,
    featured: false
  },
  {
    name: "Roasted Peanuts",
    slug: "roasted-peanuts",
    description: "Crunchy roasted peanuts, perfect for snacking.",
    short_desc: "Crunchy roasted peanuts",
    category: "snacks",
    category_label: "Snacks",
    price: 199,
    compare_price: 249,
    image_url: "https://images.unsplash.com/photo-1566454419290-0a0e85a0c2c3?w=800",
    benefits: ["High protein", "Good fats", "Energy boost", "Rich in vitamins"],
    in_stock: true,
    featured: false
  },
  {
    name: "Mixed Nuts",
    slug: "mixed-nuts",
    description: "A delicious mix of almonds, cashews, and walnuts.",
    short_desc: "Premium mixed dry fruits",
    category: "snacks",
    category_label: "Snacks",
    price: 699,
    compare_price: 799,
    image_url: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800",
    benefits: ["Complete nutrition", "Heart healthy", "Energy boost", "Rich in minerals"],
    in_stock: true,
    featured: true
  }
];

async function seedProducts() {
  console.log('Starting to seed products...');
  
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(products)
      .select();

    if (error) {
      console.error('Error seeding products:', error);
      return;
    }

    console.log(`Successfully seeded ${data.length} products!`);
    console.log(data);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

seedProducts();
