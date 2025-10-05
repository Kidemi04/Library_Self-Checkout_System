import NextAuth from 'next-auth';
import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import AzureADProvider from 'next-auth/providers/azure-ad';

const isProduction = process.env.NODE_ENV === 'production';

const clientId = process.env.AUTH_AZURE_AD_CLIENT_ID;
const clientSecret = process.env.AUTH_AZURE_AD_CLIENT_SECRET;
const tenantId = process.env.AUTH_AZURE_AD_TENANT_ID;

if (isProduction) {
  const missing = [
    ['AUTH_AZURE_AD_CLIENT_ID', clientId],
    ['AUTH_AZURE_AD_CLIENT_SECRET', clientSecret],
    ['AUTH_AZURE_AD_TENANT_ID', tenantId],
    ['NEXTAUTH_SECRET', process.env.NEXTAUTH_SECRET],
  ].filter(([, value]) => !value);

  if (missing.length > 0) {
    console.error(
      `Missing required environment variables for Azure AD authentication: ${missing
        .map(([key]) => key)
        .join(', ')}. Authentication will fail until these are configured.`,
    );
  }
}

export const authOptions = {
  providers: [
    AzureADProvider({
      clientId: clientId ?? 'development-client-id',
      clientSecret: clientSecret ?? 'development-client-secret',
      issuer: `https://login.microsoftonline.com/${tenantId ?? 'common'}/v2.0`,
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session?.user) {
        (session.user as typeof session.user & { id?: string }).id = token.sub ?? '';
      }
      return session;
    },
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
