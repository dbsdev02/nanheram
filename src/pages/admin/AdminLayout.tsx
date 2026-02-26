import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Star, LogOut, ChevronLeft, Tag, Settings, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Orders", to: "/admin/orders", icon: ShoppingCart },
  { label: "Reviews", to: "/admin/reviews", icon: Star },
  { label: "Customers", to: "/admin/customers", icon: Users },
  { label: "Marketing", to: "/admin/marketing", icon: Tag },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/");
  }, [user, isAdmin, loading, navigate]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 flex-shrink-0 border-r border-border bg-card md:block">
        <div className="p-5">
          <Link to="/" className="font-serif text-xl font-bold text-foreground">
            Nanhe<span className="text-accent">Ram</span>
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                location.pathname === item.to ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-3">
          <button onClick={() => { signOut(); navigate("/"); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1">
        {/* Mobile nav */}
        <div className="flex items-center gap-4 border-b border-border bg-card p-4 md:hidden">
          <Link to="/" className="text-muted-foreground"><ChevronLeft className="h-5 w-5" /></Link>
          <span className="font-serif font-bold text-foreground">Admin</span>
          <div className="ml-auto flex gap-2">
            {navItems.map(item => (
              <Link key={item.to} to={item.to} className={`rounded-lg p-2 ${location.pathname === item.to ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                <item.icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
