// app/post-login/page.tsx
import { redirect } from "next/navigation";
import { auth } from "../api/auth/[...nextauth]/route";

export default async function PostLoginPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role ?? "student";

  if (role === "staff" || role === "admin") {
    redirect("/dashboard/admin");
  }

  redirect("/dashboard");
}
