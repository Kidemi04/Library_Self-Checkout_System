"use client";

import { useEffect, useState } from "react";
import { supabaseBrowserClient } from "@/app/lib/supabase/client";
import HomePageMobile from "@/app/ui/homepage-mobile";
import HomePageDesktop from "@/app/ui/homepage-desktop";
import type { User } from "@supabase/supabase-js";

export default function HomePageWrapper() {
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabaseBrowserClient.auth.getSession();
      if (error || !data.session) {
        window.location.href = "/login";
      } else {
        setUser(data.session.user);
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (!loading) {
      const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
      checkScreenSize();
      window.addEventListener("resize", checkScreenSize);
      return () => window.removeEventListener("resize", checkScreenSize);
    }
  }, [loading]);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <h1 className="text-xl font-semibold text-white">
        👋 Welcome, {user?.email}
      </h1>
      {isMobile ? <HomePageMobile /> : <HomePageDesktop />}
    </>
  );
}
