"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TestPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error);
      } else if (data.session) {
        setUser(data.session.user);
        // Clean up URL
        window.history.replaceState({}, document.title, "/test");
      } else {
        // No session, redirect to login
        window.location.href = "/login";
      }
    };

    handleAuth();
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>✅ Welcome, {user.email}</h1>
      <p>You’re successfully logged in with Azure and viewing the test page!</p>
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/login";
        }}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#E63946",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}
