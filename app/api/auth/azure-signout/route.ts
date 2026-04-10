import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const tenantId = process.env.AZURE_AD_TENANT_ID ?? 'common';
  const origin = new URL(request.url).origin;
  const postLogoutUri = `${origin}/login`;

  const logoutUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(postLogoutUri)}`;

  return NextResponse.redirect(logoutUrl);
}
