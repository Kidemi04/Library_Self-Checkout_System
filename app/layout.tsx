import '@/app/ui/global.css';

import { cookies } from 'next/headers';
import { ThemeProvider, type ThemeMode } from '@/app/ui/theme/theme-provider';

const THEME_COOKIE = 'dashboard-theme';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read theme from cookie on the server
  const cookieStore = await cookies();
  const storedTheme = cookieStore.get(THEME_COOKIE)?.value;

  // Resolve theme (default to light if missing)
  const resolvedTheme: ThemeMode =
    storedTheme === 'dark' ? 'dark' : 'light';

  return (
    // IMPORTANT:
    // Set theme class on <html> during SSR
    // This prevents hydration mismatch
    <html
      lang="en"
      className={resolvedTheme}
      suppressHydrationWarning
    >
      <body
        className="
          min-h-screen
          transition-colors
          duration-300
          bg-swin-ivory
          text-swin-charcoal
          dark:bg-swin-dark-bg
          dark:text-slate-100
        "
      >
        {/* 
          ThemeProvider uses the SAME theme as SSR.
          No theme switch on first render.
        */}
        <ThemeProvider defaultTheme={resolvedTheme}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
