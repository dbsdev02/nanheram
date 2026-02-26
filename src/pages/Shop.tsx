import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { filterAndSortFallbackProducts, type CatalogProduct } from "@/lib/productFallback";

const categories = [
  { id: "all", label: "All Products" },
  { id: "dry-fruits", label: "Dry Fruits" },
  { id: "spices", label: "Spices" },
  { id: "snacks", label: "Snacks" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name-az", label: "Name: A to Z" },
  { value: "name-za", label: "Name: Z to A" },
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const searchFromUrl = searchParams.get("search") || "";
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    setSearchQuery(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        let query = supabase.from("products").select("*");
        if (activeCategory !== "all") query = query.eq("category", activeCategory);
        if (searchQuery.trim()) query = query.ilike("name", `%${searchQuery.trim()}%`);
        if (minPrice) query = query.gte("price", Number(minPrice));
        if (maxPrice) query = query.lte("price", Number(maxPrice));

        switch (sortBy) {
          case "oldest":
            query = query.order("created_at", { ascending: true });
            break;
          case "price-low":
            query = query.order("price", { ascending: true });
            break;
          case "price-high":
            query = query.order("price", { ascending: false });
            break;
          case "name-az":
            query = query.order("name", { ascending: true });
            break;
          case "name-za":
            query = query.order("name", { ascending: false });
            break;
          default:
            query = query.order("created_at", { ascending: false });
        }

        const { data, error } = await query;
        if (error) throw error;

        setProducts((data as CatalogProduct[]) || []);
      } catch (error) {
        console.warn("Using fallback shop products:", error);
        setProducts(
          filterAndSortFallbackProducts({
            category: activeCategory,
            search: searchQuery,
            minPrice,
            maxPrice,
            sortBy,
          })
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [activeCategory, searchQuery, sortBy, minPrice, maxPrice]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (activeCategory !== "all") params.category = activeCategory;
    if (searchQuery.trim()) params.search = searchQuery.trim();
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSortBy("newest");
    setMinPrice("");
    setMaxPrice("");
    setSearchParams(activeCategory !== "all" ? { category: activeCategory } : {});
  };

  const hasActiveFilters = searchQuery || minPrice || maxPrice || sortBy !== "newest";

  return (
    <main className="py-12 md:py-20">
      <div className="container">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Shop</span>
          <h1 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-5xl">Our Products</h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Explore our range of premium dry fruits, aromatic spices, and wholesome snacks — all sourced with care.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-lg items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-10"
            />
          </div>
          <button type="submit" className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Search
          </button>
        </form>

        {/* Category Filter */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                const params: Record<string, string> = {};
                if (cat.id !== "all") params.category = cat.id;
                if (searchQuery.trim()) params.search = searchQuery.trim();
                setSearchParams(params);
              }}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                activeCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort & Filters Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${showFilters ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-3 w-3" /> Clear all
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] rounded-full text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Min Price (₹)</label>
                <Input
                  type="number"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  placeholder="0"
                  className="w-28"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Max Price (₹)</label>
                <Input
                  type="number"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  placeholder="10000"
                  className="w-28"
                />
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        {!loading && (
          <p className="mt-4 text-sm text-muted-foreground">
            {products.length} product{products.length !== 1 ? "s" : ""} found
          </p>
        )}

        {loading ? (
          <div className="mt-10 text-center text-muted-foreground">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="mt-10 text-center py-16">
            <Search className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-lg font-medium text-foreground">No products found</p>
            <p className="mt-1 text-muted-foreground">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="mt-4 text-sm text-accent underline">Clear all filters</button>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Shop;
