"use server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function authenticateUser(email: string, password: string) {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, role, password_hash")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !user) {
      return { success: false, error: "User not found" };
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return { success: false, error: "Invalid password" };
    }

    return {
      success: true,
      user: { id: user.id, email: user.email, role: user.role },
    };
  } catch (err: any) {
    console.error("Login error:", err);
    return { success: false, error: err.message || "Unexpected error" };
  }
}
