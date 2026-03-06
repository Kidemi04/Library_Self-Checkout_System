'use client';

import { ThemeProvider } from '@/app/ui/theme/themeProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
