import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isPhoneNumber = (value: string) => /^\d{10}$/.test(value.replace(/\s/g, ""));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "login") {
      const { error } = await signIn(emailOrPhone, password);
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      } else {
        navigate("/");
      }
    } else {
      const { data, error } = await signUp(emailOrPhone, password, fullName, phone);
      if (error) {
        toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account created!", description: "Welcome to NanheRam!" });
        navigate("/");
      }
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="text-center">
          <Link to="/" className="font-serif text-2xl font-bold text-foreground">
            Nanhe<span className="text-accent">Ram</span>
          </Link>
          <h1 className="mt-4 font-serif text-2xl font-bold text-foreground">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login" ? "Sign in with email or mobile number" : "Sign up and start shopping"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" required />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {mode === "login" ? "Email or Mobile Number" : "Email"}
            </label>
            <Input
              type={mode === "login" ? "text" : "email"}
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder={mode === "login" ? "your@email.com or 9876543210" : "your@email.com"}
              required
            />
          </div>
          {mode === "signup" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Mobile Number</label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                required
                pattern="[0-9]{10}"
                title="Enter 10-digit mobile number"
              />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="font-medium text-accent hover:underline">
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </main>
  );
};

export default Auth;
