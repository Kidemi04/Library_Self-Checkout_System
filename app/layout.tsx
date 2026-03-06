import '@/app/ui/global.css';
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className="min-h-screen bg-white dark:bg-swin-dark-bg"
      >
        {/* GLOBAL PROVIDERS: mount once */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
