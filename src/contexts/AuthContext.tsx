import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ data?: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithPhone: (phone: string) => Promise<{ error: any }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin role separately - never inside onAuthStateChange to avoid lock deadlock
  useEffect(() => {
    let cancelled = false;
    if (user) {
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle()
        .then(({ data }) => {
          if (!cancelled) setIsAdmin(!!data);
        });
    } else {
      setIsAdmin(false);
    }
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    let mounted = true;

    // Set up listener FIRST - do NOT await anything inside the callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, sess) => {
        if (!mounted) return;
        setSession(sess);
        setUser(sess?.user ?? null);
        setLoading(false);
      }
    );

    // Then restore session from storage
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      if (!mounted) return;
      setSession(sess);
      setUser(sess?.user ?? null);
      setLoading(false);
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    // Safety timeout
    const timeout = setTimeout(() => {
      if (mounted && loading) setLoading(false);
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone: phone || "" },
      },
    });

    // Update phone in profile in background (trigger creates profile, we just add phone)
    if (!error && data?.user && phone) {
      setTimeout(async () => {
        await supabase.from("profiles").update({ phone }).eq("user_id", data.user!.id);
      }, 500);
    }

    return { data, error };
  };

  const signInWithPhone = async (phone: string) => {
    const formatted = phone.startsWith("+") ? phone : `+91${phone.replace(/^0/, "")}`;
    const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
    return { error };
  };

  const verifyOtp = async (phone: string, token: string) => {
    const formatted = phone.startsWith("+") ? phone : `+91${phone.replace(/^0/, "")}`;
    const { error } = await supabase.auth.verifyOtp({ phone: formatted, token, type: "sms" });
    return { error };
  };

  const signIn = async (emailOrPhone: string, password: string) => {
    let email = emailOrPhone.trim();

    // If input is a 10-digit phone number, look up email from profiles
    if (/^\d{10}$/.test(email)) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("phone", email)
        .maybeSingle();

      if (!profile?.email) {
        return { error: { message: "No account found with this mobile number." } };
      }
      email = profile.email;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signUp, signIn, signInWithPhone, verifyOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
