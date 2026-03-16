import { products as staticProducts } from "@/data/products";

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_price: number | null;
  image_url: string | null;
  hover_image_url: string | null;
  short_desc: string | null;
  description: string | null;
  category: "dry-fruits" | "spices" | "snacks";
  category_label: string;
  in_stock: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

const fallbackPriceBySlug: Record<string, number> = {
  cashews: 899,
  almonds: 799,
  raisins: 449,
  elaichi: 1199,
  makhana: 349,
};

export const FALLBACK_PRODUCTS: CatalogProduct[] = staticProducts.map((product, index) => {
  const price = fallbackPriceBySlug[product.slug] ?? 499;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price,
    compare_price: price + 100,
    image_url: product.image,
    hover_image_url: null,
    short_desc: product.shortDesc,
    description: product.description,
    category: product.category,
    category_label: product.categoryLabel,
    in_stock: true,
    featured: index < 4,
    created_at: new Date(Date.now() - index * 86_400_000).toISOString(),
    updated_at: new Date().toISOString(),
  };
});

export const getFeaturedFallbackProducts = (limit = 4) =>
  FALLBACK_PRODUCTS.filter((product) => product.featured).slice(0, limit);

type FallbackFilterParams = {
  category: string;
  search: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
};

export const filterAndSortFallbackProducts = ({
  category,
  search,
  minPrice,
  maxPrice,
  sortBy,
}: FallbackFilterParams) => {
  let filtered = [...FALLBACK_PRODUCTS];

  if (category !== "all") {
    filtered = filtered.filter((product) => product.category === category);
  }

  const trimmedSearch = search.trim().toLowerCase();
  if (trimmedSearch) {
    filtered = filtered.filter((product) => product.name.toLowerCase().includes(trimmedSearch));
  }

  if (minPrice) {
    filtered = filtered.filter((product) => product.price >= Number(minPrice));
  }

  if (maxPrice) {
    filtered = filtered.filter((product) => product.price <= Number(maxPrice));
  }

  filtered.sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "name-az":
        return a.name.localeCompare(b.name);
      case "name-za":
        return b.name.localeCompare(a.name);
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return filtered;
};
