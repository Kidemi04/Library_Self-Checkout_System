// app/post-login/page.tsx
import { redirect } from "next/navigation";
import { auth } from "../api/auth/[...nextauth]/route";
import { createClient } from "../lib/supabase/server";

export default async function PostLoginPage() {
  // 1) who just logged in?
  const session = await auth();

  if (!session?.user?.email) {
    // no session, go back to login
    redirect("/login");
  }

  const email = session.user.email.toLowerCase().trim();

  // 2) get the REAL role from Supabase
  const supabase = createClient();
  const { data: dbUser, error } = await supabase
    .from("users")
    .select("role")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("[post-login] supabase error:", error);
    // if DB fails, just send to student dashboard to be safe
    redirect("/dashboard");
  }

  const role = dbUser?.role ?? "student";

  // 3) branch by real role
  if (role === "staff" || role === "admin") {
    redirect("/dashboard/admin");
  }

  redirect("/dashboard");
}
