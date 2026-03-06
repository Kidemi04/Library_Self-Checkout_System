"use client";

import { useEffect, useState } from "react";
import HomePageMobile from "@/app/ui/homepage-mobile";
import HomePageDesktop from "@/app/ui/homepage-desktop";

export default function HomePageWrapper() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (isMobile) {
    return <HomePageMobile />;
  }

  return <HomePageDesktop />;
}
