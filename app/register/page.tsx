import Link from 'next/link';
import Image from 'next/image'

export default function RegisterPage() {
    return (
        <main className='flex min-h-screen items-center justify-center bg-swin-ivory p-6 dark:bg-slate-950'>
            <title>Register</title>

            <Image
                src="https://aadcdn.msauthimages.net/447973e2-uddq3dansz8dzvbzqaldisw5-z1gjnyitaoanchjrvw/logintenantbranding/0/illustration?ts=636377489049121844"
                alt="background"
                fill sizes="100vw"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
                priority />

            <div className="absolute inset-0 bg-black/40" />

            <div className="relative w-full max-w-md rounded-xl bg-white/95 p-8 text-swin-charcoal shadow-2xl shadow-black/20 backdrop-blur-sm dark:bg-slate-900/90 dark:text-slate-100">
                <a href='/' >
                    <img className='mx-auto static shadow-lg scale-125' src="https://www.swinburne.edu.my/wp-content/themes/mytheme-2021/images/logo-long-full.svg"></img>
                </a>
                <br></br>
                <h1 className="mb-6 text-center text-2xl font-bold text-swin-charcoal dark:text-white">
                    Register Account
                </h1>
                <form className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-1 block text-sm font-medium text-swin-charcoal/80 dark:text-slate-200">
                                Email
                        </label>

                        <input
                            type="email"
                            id="email"
                            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-swin-charcoal focus:border-swin-red focus:ring-2 focus:ring-swin-red/30 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-300 dark:focus:ring-emerald-300/30"
                            required />
                    
                    </div>
                    {/*Password */}
                    <div>
                        <label
                            htmlFor="password"
                            className="mb-1 block text-sm font-medium text-swin-charcoal/80 dark:text-slate-200" >
                        Password
                        </label>

                        <input
                            type="password"
                            id="password"
                            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-swin-charcoal focus:border-swin-red focus:ring-2 focus:ring-swin-red/30 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-300 dark:focus:ring-emerald-300/30"
                            required />
                    </div>

                    <br></br>
                    {/* Register button */}
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-swin-red px-4 py-2 font-medium text-white transition hover:bg-swin-red/80"
                    >
                        Register
                    </button>

                    <p className="text-center text-sm text-swin-charcoal/70 dark:text-slate-300">
                        <Link href="/login" className="text-swin-red hover:underline">
                            Back to Login
                        </Link>
                    </p>

                </form>
            </div>
        </main>
    )
}
