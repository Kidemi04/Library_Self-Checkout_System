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

// 👉 detect if Azure is actually configured
const hasAzure =
  !!process.env.AZURE_AD_CLIENT_ID &&
  process.env.AZURE_AD_CLIENT_ID !== "YOUR-AZURE-CLIENT-ID" &&
  !!process.env.AZURE_AD_CLIENT_SECRET &&
  process.env.AZURE_AD_CLIENT_SECRET !== "YOUR-AZURE-CLIENT-SECRET";

const providers: NonNullable<NextAuthConfig["providers"]> = [];

// 1) Azure provider (only if env is real)
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

// 2) Dev credentials provider (always add, so we never have 0 providers)
providers.push(
  Credentials({
    name: "Dev login",
    credentials: {
      email: { label: "Email", type: "text" },
    },
    async authorize(credentials) {
      // allow any email in dev; in real prod you remove this
      const email = credentials?.email?.toLowerCase();
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
    async signIn({ user }: any) {
      if (!user?.email) return false;
      const email = user.email.toLowerCase();

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

    async jwt({ token, user }: any) {
      if (user?.email) {
        const email = user.email.toLowerCase();

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
      return token;
    },

    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).role = (token.role as DashboardRole) ?? "student";
      }
      return session;
    },

    async redirect({ baseUrl }) {
      return `${baseUrl}/post-login`;
    },
  },
};

const { GET, POST } = NextAuth(authConfig).handlers;
export { GET, POST };
