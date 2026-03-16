import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Phone, KeyRound, ArrowLeft } from "lucide-react";

type Step = "phone" | "otp";

const Auth = () => {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInWithPhone, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) {
      toast({ title: "Invalid number", description: "Enter a valid 10-digit mobile number.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signInWithPhone(phone);
    setLoading(false);
    if (error) {
      toast({ title: "Failed to send OTP", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "OTP Sent!", description: `A 6-digit OTP has been sent to +91 ${phone}` });
      setStep("otp");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({ title: "Invalid OTP", description: "Enter the 6-digit OTP.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await verifyOtp(phone, otp);
    setLoading(false);
    if (error) {
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome to NanheRam!", description: "You are now signed in." });
      navigate("/");
    }
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="text-center">
          <Link to="/" className="font-serif text-2xl font-bold text-foreground">
            Nanhe<span className="text-accent">Ram</span>
          </Link>
          <h1 className="mt-4 font-serif text-2xl font-bold text-foreground">
            {step === "phone" ? "Sign In / Sign Up" : "Verify OTP"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {step === "phone"
              ? "Enter your mobile number to receive an OTP"
              : `Enter the 6-digit OTP sent to +91 ${phone}`}
          </p>
        </div>

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Mobile Number</label>
              <div className="flex items-center gap-2">
                <span className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
                  +91
                </span>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9876543210"
                  required
                  maxLength={10}
                />
              </div>
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={loading}>
              <Phone className="mr-2 h-4 w-4" />
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Enter OTP</label>
              <Input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                required
                maxLength={6}
                className="text-center text-xl tracking-[0.5em]"
              />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={loading}>
              <KeyRound className="mr-2 h-4 w-4" />
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
            <button
              type="button"
              onClick={() => { setStep("phone"); setOtp(""); }}
              className="flex w-full items-center justify-center gap-1 text-sm text-muted-foreground hover:text-accent"
            >
              <ArrowLeft className="h-3 w-3" /> Change number
            </button>
          </form>
        )}
      </div>
    </main>
  );
};

export default Auth;
