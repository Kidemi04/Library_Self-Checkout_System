"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowserClient } from "@/app/lib/supabase/client";

export default function AuthRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      const { data } = await supabaseBrowserClient.auth.getSession();

      // ✅ Wait until session is ready
      if (!data.session) {
        console.log("⚠️ No session yet — returning to login.");
        router.replace("/login");
        return;
      }

      const user = data.session.user;
      const email = user.email || "";

      // ✅ Define which emails are admins
      const adminEmails = [
        "admin@swinburne.edu.my",
        "librarian@swinburne.edu.my",
        "nigellingzj@gmail.com",
      ];

      // ✅ Redirect based on role
      if (adminEmails.includes(email)) {
        console.log("✅ Admin detected:", email);
        router.replace("/dashboard/admin");
      } else {
        console.log("✅ Student detected:", email);
        router.replace("/dashboard/student"); // 👈 FIXED: correct student page
      }
    };

    checkRoleAndRedirect();
  }, [router]);

  return <p>Redirecting to your dashboard...</p>;
}
