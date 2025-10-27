import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <title>Login</title>

      <Image
        src="https://aadcdn.msauthimages.net/447973e2-uddq3dansz8dzvbzqaldisw5-z1gjnyitaoanchjrvw/logintenantbranding/0/illustration?ts=636377489049121844"
        alt="background"
        fill
        sizes="100vw"
        style={{ objectFit: 'cover', objectPosition: 'center' }}
        priority
      />

      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <Link href="/">
          <img
            className="mx-auto scale-125 shadow-lg"
            src="https://www.swinburne.edu.my/wp-content/themes/mytheme-2021/images/logo-long-full.svg"
            alt="Swinburne logo"
          />
        </Link>
        <h1 className="mt-6 text-center text-2xl font-bold text-swin-charcoal">
          Swinburne Sarawak Library
        </h1>
        <p className="mt-2 text-center text-sm text-swin-charcoal/70">
          Sign in with your Swinburne Microsoft account to access the borrow-and-return dashboard.
        </p>

        <div className="mt-8 space-y-4">
          <Link
            href="/api/auth/signin/azure-ad"
            prefetch={false}
            className="flex items-center justify-center gap-3 rounded-lg bg-swin-red px-4 py-3 text-sm font-semibold text-swin-ivory shadow transition hover:bg-swin-red/90"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path fill="#f25022" d="M11 11H3V3h8z" />
              <path fill="#00a4ef" d="M21 11h-8V3h8z" />
              <path fill="#7fba00" d="M11 21H3v-8h8z" />
              <path fill="#ffb900" d="M21 21h-8v-8h8z" />
            </svg>
            <span>Sign in with Microsoft</span>
          </Link>

          <p className="text-center text-xs text-swin-charcoal/60">
            Local development bypasses authentication automatically. In production you must sign in
            with your Swinburne Microsoft account.
          </p>
        </div>
      </div>
    </main>
  );
}
