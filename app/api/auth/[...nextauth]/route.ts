// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthConfig } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { createClient } from "../../../lib/supabase/server";
import type { DashboardRole } from "../../../lib/auth/types";

const USERS_TABLE = "users";

// optional dev bypass (from your .env.local)
const DEV_BYPASS_AUTH = process.env.DEV_BYPASS_AUTH === "true";
const DEV_BYPASS_ROLE = (process.env.DEV_BYPASS_ROLE || "student") as DashboardRole;
const DEV_BYPASS_EMAIL = process.env.DEV_BYPASS_EMAIL?.toLowerCase();

const authConfig: NextAuthConfig = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      // if you have a tenant, keep this, otherwise you can remove it
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          // force Microsoft to let you choose the account every time
          prompt: "select_account",
        },
      },
    }),
  ],

  callbacks: {
    // 1) after Microsoft signs in, make sure user exists in Supabase
    async signIn({ user }: any) {
      if (!user?.email) return false;

      const email = user.email.toLowerCase();
      const supabase = createClient();

      // does this email exist already?
      const { data: existing } = await supabase
        .from(USERS_TABLE)
        .select("id, role")
        .eq("email", email)
        .maybeSingle();

      if (!existing) {
        // new user → default to student
        let roleToSet: DashboardRole = "student";

        // but if it's your dev fake email, use the dev role
        if (DEV_BYPASS_AUTH && DEV_BYPASS_EMAIL === email) {
          roleToSet = DEV_BYPASS_ROLE;
        }

        await supabase.from(USERS_TABLE).insert({
          email,
          display_name: user.name ?? "",
          role: roleToSet,
        });
      }
      // if it exists, we trust the role in DB
      return true;
    },

    // 2) put role from DB into JWT
    async jwt({ token, user }: any) {
      // on first login, user is present
      if (user?.email) {
        const email = user.email.toLowerCase();
        const supabase = createClient();

        const { data: dbUser } = await supabase
          .from(USERS_TABLE)
          .select("role")
          .eq("email", email)
          .maybeSingle();

        token.role = (dbUser?.role as DashboardRole) ?? "student";
      }
      return token;
    },

    // 3) expose the role to the client (so /profile and navbar can show it)
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).role = (token.role as DashboardRole) ?? "student";
      }
      return session;
    },

    // 4) after login send them to our router page
    async redirect({ baseUrl }: any) {
      return `${baseUrl}/post-login`;
    },
  },
};

// v5 style export
const { GET, POST } = NextAuth(authConfig).handlers;
export { GET, POST };
