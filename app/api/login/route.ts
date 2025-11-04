import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Missing email or password." },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, role, password_hash")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password_hash || "");
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Invalid password." },
        { status: 401 }
      );
    }

    // ✅ Successful login
    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err: any) {
    console.error("🔥 Login error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Unexpected server error." },
      { status: 500 }
    );
  }
}
