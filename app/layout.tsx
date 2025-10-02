import '@/app/ui/global.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-swin-ivory text-swin-charcoal">{children}</body>
    </html>
  );
}
