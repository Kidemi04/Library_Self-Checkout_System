import { cookies } from 'next/headers';
import '@/app/ui/global.css';
import { ThemeProvider, type ThemeMode } from '@/app/ui/theme/theme-provider';

const THEME_COOKIE = 'dashboard-theme';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const storedTheme = cookieStore.get(THEME_COOKIE)?.value;
  const resolvedTheme: ThemeMode = storedTheme === 'dark' ? 'dark' : 'light';

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen bg-swin-ivory text-swin-charcoal transition-colors duration-300 dark:bg-swin-dark-bg dark:text-slate-100"
      >
        <ThemeProvider defaultTheme={resolvedTheme}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
