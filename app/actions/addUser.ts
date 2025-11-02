"use server";

import { createClient } from "@supabase/supabase-js";

/**
 * ✅ Server-side Supabase client (bypasses RLS using the Service Role Key)
 * Note: Never expose the service role key on the client!
 */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Must exist in your .env.local
  {
    auth: { persistSession: false },
  }
);

export async function addUserAction(formData: {
  email: string;
  display_name: string;
  role: string;
}) {
  try {
    if (!formData.email || !formData.role) {
      return { success: false, error: "Missing required fields (email or role)." };
    }

    // ✅ Perform insert
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email: formData.email.trim().toLowerCase(),
          display_name: formData.display_name || null,
          role: formData.role,
        },
      ])
      .select();

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return {
        success: false,
        error: `${error.message} (code: ${error.code || "unknown"})`,
      };
    }

    console.log(`✅ User added: ${formData.email}`);
    return { success: true, data };
  } catch (err: any) {
    console.error("🔥 Unexpected server error:", err);
    return { success: false, error: err.message || "Unexpected error" };
  }
}
