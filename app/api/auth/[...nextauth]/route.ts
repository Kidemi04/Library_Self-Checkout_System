// app/api/auth/[...nextauth]/route.ts

import NextAuth, { type NextAuthConfig } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "../../../lib/supabase/server";
import type { DashboardRole } from "../../../lib/auth/types";

const USERS_TABLE = "users";

const DEV_BYPASS_AUTH = process.env.DEV_BYPASS_AUTH === "true";
const DEV_BYPASS_ROLE = (process.env.DEV_BYPASS_ROLE || "student") as DashboardRole;
const DEV_BYPASS_EMAIL = process.env.DEV_BYPASS_EMAIL?.toLowerCase();
const tenantId = process.env.AZURE_AD_TENANT_ID;

// detect if Azure is actually configured (not placeholder)
const hasAzure =
  !!process.env.AZURE_AD_CLIENT_ID &&
  process.env.AZURE_AD_CLIENT_ID !== "YOUR-AZURE-CLIENT-ID" &&
  !!process.env.AZURE_AD_CLIENT_SECRET &&
  process.env.AZURE_AD_CLIENT_SECRET !== "YOUR-AZURE-CLIENT-SECRET";

const providers: NonNullable<NextAuthConfig["providers"]> = [];

// 1) Azure provider (only if real)
if (hasAzure) {
  providers.push(
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      ...(tenantId && tenantId.trim().length > 0
        ? { issuer: `https://login.microsoftonline.com/${tenantId}/v2.0` }
        : {}),
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  );
}

// 2) Credentials fallback for dev
providers.push(
  Credentials({
    name: "Dev login",
    credentials: {
      email: { label: "Email", type: "text" },
    },
    async authorize(credentials) {
      const raw = credentials?.email;
      const email = typeof raw === "string" ? raw.toLowerCase() : "";
      if (!email) return null;
      return {
        id: email,
        email,
        name: email.split("@")[0],
      };
    },
  }),
);

const authConfig: NextAuthConfig = {
  providers,

  callbacks: {
    // make sure user exists in Supabase
    async signIn({ user }: any) {
      const rawEmail: unknown = user?.email ?? user?.id;
      const email = typeof rawEmail === "string" ? rawEmail.toLowerCase() : null;
      if (!email) return false;

      try {
        const supabase = createClient();

        const { data: existing, error } = await supabase
          .from(USERS_TABLE)
          .select("id, role")
          .eq("email", email)
          .maybeSingle();

        if (error) {
          console.error("[auth][signIn] supabase select error:", error);
          return true;
        }

        if (!existing) {
          let roleToSet: DashboardRole = "student";
          if (DEV_BYPASS_AUTH && DEV_BYPASS_EMAIL === email) {
            roleToSet = DEV_BYPASS_ROLE;
          }

          const { error: insertError } = await supabase.from(USERS_TABLE).insert({
            email,
            display_name: user.name ?? "",
            role: roleToSet,
          });

          if (insertError) {
            console.error("[auth][signIn] supabase insert error:", insertError);
          }
        }
      } catch (e) {
        console.error("[auth][signIn] unexpected:", e);
      }

      return true;
    },

    // attach role from Supabase into JWT
    async jwt({ token, user }: any) {
      if (user?.email || user?.id) {
        const rawEmail: unknown = user.email ?? user.id;
        const email = typeof rawEmail === "string" ? rawEmail.toLowerCase() : null;

        if (email) {
          try {
            const supabase = createClient();
            const { data: dbUser, error } = await supabase
              .from(USERS_TABLE)
              .select("role")
              .eq("email", email)
              .maybeSingle();

            token.role = !error && dbUser?.role ? (dbUser.role as DashboardRole) : "student";
          } catch (e) {
            console.error("[auth][jwt] unexpected:", e);
            token.role = "student";
          }
        }
      }
      return token;
    },

    // expose role to client
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).role = (token.role as DashboardRole) ?? "student";
      }
      return session;
    },

    // after sign-in, always go to router page
    async redirect({ baseUrl }) {
      return `${baseUrl}/post-login`;
    },
  },
};

// 👇 this is the correct v5 pattern
const { handlers, auth } = NextAuth(authConfig);
export const { GET, POST } = handlers;
export { auth };
