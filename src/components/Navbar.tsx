import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, ShoppingCart, User, MessageCircle, Search, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import mainLogo from "@/assets/mainlogo.png";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { totalItems } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* Search overlay */}
      {searchOpen && (
        <div className="absolute inset-x-0 top-0 z-50 bg-background border-b border-border p-4 shadow-lg">
          <form onSubmit={handleSearch} className="container flex items-center gap-3">
            <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <Input
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-lg"
            />
            <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="rounded-full p-2 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}

      <div className="container flex h-16 items-center justify-between md:h-20">
        <Link to="/" className="flex items-center gap-2">
          <img src={mainLogo} alt="NanheRam" className="h-14 w-auto md:h-16" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium tracking-wide uppercase transition-colors hover:text-accent ${
                location.pathname === link.to ? "text-accent" : "text-foreground/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Search */}
          <button onClick={() => setSearchOpen(true)} className="rounded-full p-2 text-foreground/70 transition-colors hover:text-accent">
            <Search className="h-5 w-5" />
          </button>

          {/* Cart */}
          <Link to="/cart" className="relative rounded-full p-2 text-foreground/70 transition-colors hover:text-accent">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Account */}
          {user ? (
            <Link to={isAdmin ? "/admin" : "/dashboard"} className="hidden rounded-full p-2 text-foreground/70 transition-colors hover:text-accent md:block">
              <User className="h-5 w-5" />
            </Link>
          ) : (
            <Link to="/auth" className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 md:flex">
              Sign In
            </Link>
          )}

          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 md:flex"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background">
              <SheetTitle className="flex items-center gap-2">
                <img src={mainLogo} alt="NanheRam" className="h-10 w-auto" />
              </SheetTitle>
              <nav className="mt-8 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to} onClick={() => setOpen(false)}
                    className={`text-lg font-medium tracking-wide transition-colors hover:text-accent ${location.pathname === link.to ? "text-accent" : "text-foreground/70"}`}>
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="text-lg font-medium text-foreground/70 hover:text-accent">My Account</Link>
                ) : (
                  <Link to="/auth" onClick={() => setOpen(false)} className="text-lg font-medium text-accent">Sign In</Link>
                )}
                <a href="https://wa.me/" target="_blank" rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
                  <MessageCircle className="h-4 w-4" /> Order on WhatsApp
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
