import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function lookupRoleByEmail(email: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("email", email)
      .single();

    if (error) {
      console.warn("Role lookup failed:", error.message);
      return null;
    }
    return data?.role ?? null;
  } catch (err) {
    console.error("Unexpected role lookup error:", err);
    return null;
  }
}
