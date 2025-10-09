"use client";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        redirectTo: "http://localhost:3000/try", // 👈 redirect here after login
      },
    });

    if (error) console.error("Login error:", error);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>🔐 Login with Microsoft</h1>
      <button
        onClick={handleLogin}
        style={{
          padding: "10px 20px",
          backgroundColor: "#2F2F9D",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Sign in with Azure
      </button>
    </div>
  );
}
