import './ui/global.css'; // whatever you already have
import Providers from './providers';

export const metadata = {
  title: 'Library Self-Checkout',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-swin-ivory text-swin-charcoal">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
