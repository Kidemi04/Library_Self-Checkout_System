"use server";

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs"; // ✅ added

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function addUserAction(formData: {
  email: string;
  display_name: string;
  role: string;
  password: string;
}) {
  try {
    if (!formData.email || !formData.role || !formData.password) {
      return { success: false, error: "Missing required fields (email, role, or password)." };
    }

    // ✅ Hash password before storing
    const hashedPassword = await bcrypt.hash(formData.password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email: formData.email.trim().toLowerCase(),
          display_name: formData.display_name || null,
          role: formData.role,
          password_hash: hashedPassword, // ✅ store hashed password
        },
      ])
      .select();

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return { success: false, error: error.message };
    }

    console.log(`✅ User added successfully: ${formData.email}`);
    return { success: true, data };
  } catch (err: any) {
    console.error("🔥 Unexpected server error:", err);
    return { success: false, error: err.message || "Unexpected error" };
  }
}
