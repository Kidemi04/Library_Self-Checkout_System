import { NextResponse } from 'next/server';

const resolveTenantId = () =>
  process.env.AZURE_AD_TENANT_ID ??
  process.env.AUTH_AZURE_AD_TENANT_ID ??
  'common';

export function GET(request: Request) {
  const currentUrl = new URL(request.url);
  const origin = `${currentUrl.protocol}//${currentUrl.host}`;
  const postLogout = `${origin}/login`;
  const tenantId = resolveTenantId();
  const logout = new URL(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout`);
  logout.searchParams.set('post_logout_redirect_uri', postLogout);

  return NextResponse.redirect(logout.toString());
}
