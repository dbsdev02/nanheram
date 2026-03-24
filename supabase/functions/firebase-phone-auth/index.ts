import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FIREBASE_API_KEY = "AIzaSyDItXz-Qcn7XHbOQcXSi7z3Xo8LjEWBM9o";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { idToken, phone, mode } = await req.json();

    if (!idToken || !phone) {
      return new Response(
        JSON.stringify({ error: "ID token and phone are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify Firebase ID token using Google Identity Toolkit
    const verifyResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );

    const verifyData = await verifyResponse.json();
    if (!verifyResponse.ok || !verifyData.users?.length) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired Firebase token. Please try again." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const firebaseUser = verifyData.users[0];
    const verifiedPhone = firebaseUser.phoneNumber; // e.g. "+919876543210"

    // Verify the phone matches what the client claims
    const expectedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
    if (verifiedPhone !== expectedPhone) {
      return new Response(
        JSON.stringify({ error: "Phone number mismatch. Verification failed." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Strip +91 for profile lookup (stored as 10 digits)
    const phoneDigits = phone.replace(/^\+?91/, "");

    if (mode === "login") {
      // Look up user by phone in profiles (use most recent account if duplicates)
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("email, user_id")
        .eq("phone", phoneDigits)
        .order("created_at", { ascending: false })
        .limit(1);

      const profile = profiles?.[0] || null;

      if (!profile?.email || !profile?.user_id) {
        return new Response(
          JSON.stringify({ error: "No account found with this mobile number. Please sign up first." }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Generate magic link for Supabase session
      const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: profile.email,
      });

      if (linkErr || !linkData) {
        throw new Error(`Failed to generate session: ${linkErr?.message}`);
      }

      const tokenHash = linkData.properties?.hashed_token;

      return new Response(
        JSON.stringify({
          success: true,
          email: profile.email,
          token_hash: tokenHash,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For signup mode, just confirm verification passed
    return new Response(
      JSON.stringify({ success: true, verified: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Firebase phone auth error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
