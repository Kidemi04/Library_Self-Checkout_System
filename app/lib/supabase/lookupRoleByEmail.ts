import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function lookupRoleByEmail(email: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("lookupRoleByEmail error:", error);
    return null;
  }
  return data?.role ?? null;
}
