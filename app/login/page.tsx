import Link from 'next/link';
import Image from 'next/image'

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
            <title>Login Page</title>

            <Image
                src="https://aadcdn.msauthimages.net/447973e2-uddq3dansz8dzvbzqaldisw5-z1gjnyitaoanchjrvw/logintenantbranding/0/illustration?ts=636377489049121844"
                alt="background"
                fill sizes="100vw"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
                priority />

            <div className="absolute inset-0 bg-black/40" />
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg relative">
                <a href='/' >
                    <img className='mx-auto static shadow-lg scale-125' src="https://www.swinburne.edu.my/wp-content/themes/mytheme-2021/images/logo-long-full.svg"></img>
                </a>
                    <br></br>
                <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
                    Swinburne Sarawak Library
                </h1>

                <form className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-1 block text-sm font-medium text-gray-700">
                                Email
                        </label>

                        <input
                            type="email"
                            id="email"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            required />
                    
                    </div>
                    {/*Password */}
                    <div>
                        <label
                            htmlFor="password"
                            className="mb-1 block text-sm font-medium text-gray-700" >
                        Password
                        </label>

                        <input
                            type="password"
                            id="password"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            required />
                    </div>

                    {/* Remember + Forgot password */}
                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded border-gray-300" />
                                Remember me
                        </label>
                    
                        <Link href="#" className="text-red-500 hover:underline">
                            Forgot password?
                        </Link>
                    </div>

                    {/* Login button */}
                    <button
                    type="submit"
                    className="w-full rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition hover:bg-red-400">
                        Log In
                    </button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center">
                    <div className="h-px flex-1 bg-gray-200"></div>
                    <span className="px-2 text-sm text-gray-500">or</span>
                    <div className="h-px flex-1 bg-gray-200"></div>
                </div>

                    {/* Signup link */}
                    <p className="text-center text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Link href="/register" className="text-red-500 hover:underline">
                            Sign up
                        </Link>
                    </p>
            </div>
        </main>
    );
}

