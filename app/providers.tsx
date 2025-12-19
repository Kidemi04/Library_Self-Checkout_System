'use client';

import { ThemeProvider } from '@/app/ui/theme/theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
