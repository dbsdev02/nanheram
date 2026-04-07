import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Phone, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import mainLogo from "@/assets/mainlogo.png";
import {
  firebaseAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "@/lib/firebase";
import type { ConfirmationResult } from "@/lib/firebase";

type Mode = "login" | "signup";
type Step = "form" | "otp";

const Auth = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);

  const setupRecaptcha = useCallback(() => {
    if (recaptchaVerifierRef.current) return;

    recaptchaVerifierRef.current = new RecaptchaVerifier(
      firebaseAuth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved
        },
        "expired-callback": () => {
          recaptchaVerifierRef.current = null;
        },
      }
    );
  }, []);

  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {
          // ignore
        }
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const sendFirebaseOtp = async (phoneNumber: string) => {
    setupRecaptcha();
    const formattedPhone = `+91${phoneNumber}`;
    const confirmationResult = await signInWithPhoneNumber(
      firebaseAuth,
      formattedPhone,
      recaptchaVerifierRef.current!
    );
    confirmationResultRef.current = confirmationResult;
  };

  // --- LOGIN FLOW ---
  const handleLoginSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !/^\d{10}$/.test(phone)) {
      toast({ title: "Invalid number", description: "Please enter a valid 10-digit mobile number.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      // Check if phone number is registered before sending OTP
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("phone", phone)
        .maybeSingle();

      if (!profile) {
        toast({ title: "Not registered", description: "No account found with this mobile number. Please sign up first.", variant: "destructive" });
        setLoading(false);
        return;
      }

      await sendFirebaseOtp(phone);
      setStep("otp");
      toast({ title: "OTP Sent!", description: `Verification code sent to +91${phone}` });
    } catch (err: any) {
      console.error("Firebase OTP error:", err);
      recaptchaVerifierRef.current = null;
      toast({ title: "Failed to send OTP", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast({ title: "Invalid OTP", description: "Please enter the 6-digit code.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      // Verify OTP with Firebase
      const result = await confirmationResultRef.current!.confirm(otp);
      const idToken = await result.user.getIdToken();

      // Use Firebase token to sign into Supabase
      const { data, error } = await supabase.functions.invoke("firebase-phone-auth", {
        body: { idToken, phone, mode: "login" },
      });
      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || "Login failed");
      }

      if (data.token_hash && data.email) {
        const { error: authError } = await supabase.auth.verifyOtp({
          // email: data.email,
          token_hash: data.token_hash,
          type: "magiclink",
        });
        if (authError) throw new Error(authError.message);
        toast({ title: "Welcome back!", description: "You are now signed in." });
        navigate("/");
      } else {
        throw new Error("Login verification failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Login verify error:", err);
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // --- SIGNUP FLOW ---
  const handleSignupSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !password) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      toast({ title: "Invalid number", description: "Please enter a valid 10-digit mobile number.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Weak password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await sendFirebaseOtp(phone);
      setStep("otp");
      toast({ title: "OTP Sent!", description: `Verification code sent to +91${phone}` });
    } catch (err: any) {
      console.error("Firebase OTP error:", err);
      recaptchaVerifierRef.current = null;
      toast({ title: "Failed to send OTP", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignupVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast({ title: "Invalid OTP", description: "Please enter the 6-digit code.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      // Verify OTP with Firebase
      const result = await confirmationResultRef.current!.confirm(otp);
      const idToken = await result.user.getIdToken();

      // Verify with backend
      const { data, error } = await supabase.functions.invoke("firebase-phone-auth", {
        body: { idToken, phone, mode: "signup" },
      });
      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || "Verification failed");
      }

      // Create Supabase account
      const { error: signupErr } = await signUp(email, password, fullName, phone);
      if (signupErr) throw new Error(signupErr.message);

      toast({ title: "Account created!", description: "You are now signed in." });
      navigate("/");
    } catch (err: any) {
      console.error("Signup verify error:", err);
      toast({ title: "Sign up failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep("form");
    setOtp("");
    recaptchaVerifierRef.current = null;
    confirmationResultRef.current = null;
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setStep("form");
    setOtp("");
    setPassword("");
    setEmail("");
    setPhone("");
    setFullName("");
    recaptchaVerifierRef.current = null;
    confirmationResultRef.current = null;
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="text-center">
          <Link to="/" className="font-serif text-2xl font-bold text-foreground">
            Nanhe<span className="text-accent">Ram</span>
          </Link>
          <h1 className="mt-4 font-serif text-2xl font-bold text-foreground">
            {mode === "login" ? "Sign In" : "Create Account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {step === "otp"
              ? `Enter the 6-digit code sent to +91${phone}`
              : mode === "login"
              ? "Enter your mobile number to receive OTP"
              : "Fill in your details to get started"}
          </p>
        </div>

        {/* Invisible reCAPTCHA container */}
        <div id="recaptcha-container"></div>

        {/* OTP VERIFICATION STEP */}
        {step === "otp" ? (
          <form onSubmit={mode === "login" ? handleLoginVerifyOtp : handleSignupVerifyOtp} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Verification Code</label>
              <Input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="text-center text-lg tracking-widest"
                autoFocus
                required
              />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={loading || otp.length !== 6}>
              <Shield className="mr-2 h-4 w-4" />
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
            <div className="flex justify-between text-sm">
              <button type="button" onClick={resetFlow} className="text-accent hover:underline">
                ← Change number
              </button>
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  try {
                    await sendFirebaseOtp(phone);
                    toast({ title: "OTP Resent!", description: `New code sent to +91${phone}` });
                  } catch (err: any) {
                    recaptchaVerifierRef.current = null;
                    toast({ title: "Failed", description: err.message, variant: "destructive" });
                  } finally {
                    setLoading(false);
                  }
                }}
                className="text-accent hover:underline"
                disabled={loading}
              >
                Resend OTP
              </button>
            </div>
          </form>
        ) : mode === "login" ? (
          <form onSubmit={handleLoginSendOtp} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Mobile Number</label>
              <div className="flex gap-2">
                <span className="flex items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">+91</span>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9876543210"
                  maxLength={10}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={loading || phone.length !== 10}>
              <Phone className="mr-2 h-4 w-4" />
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button type="button" onClick={() => switchMode("signup")} className="font-medium text-accent hover:underline">
                Sign Up
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignupSendOtp} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name *</label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email *</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Mobile Number *</label>
              <div className="flex gap-2">
                <span className="flex items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">+91</span>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9876543210"
                  maxLength={10}
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Password *</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
              />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={loading}>
              <UserPlus className="mr-2 h-4 w-4" />
              {loading ? "Sending OTP..." : "Sign Up & Verify"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button type="button" onClick={() => switchMode("login")} className="font-medium text-accent hover:underline">
                Sign In
              </button>
            </p>
          </form>
        )}
      </div>
    </main>
  );
};

export default Auth;
