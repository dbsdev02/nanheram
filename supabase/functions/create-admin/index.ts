import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Create the admin user
  const { data: userData, error: createError } = await supabase.auth.admin.createUser({
    email: "info@nanheram.com",
    password: "Admin@123",
    email_confirm: true,
    user_metadata: { full_name: "NanheRam Admin" },
  });

  if (createError) {
    return new Response(JSON.stringify({ error: createError.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // The trigger will create profile and user role.
  // Now upgrade to admin role.
  const userId = userData.user.id;
  const { error: roleError } = await supabase
    .from("user_roles")
    .update({ role: "admin" })
    .eq("user_id", userId);

  if (roleError) {
    // If trigger hasn't fired yet, insert directly
    await supabase.from("user_roles").upsert({ user_id: userId, role: "admin" });
  }

  return new Response(
    JSON.stringify({ success: true, user_id: userId }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
