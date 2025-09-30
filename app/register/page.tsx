import Link from 'next/link';

export default function RegisterPage() {
    return (
        <main className='flex min-h-screen items-center justify-center bg-gray-100 p-6'>
        <title>Register</title>

            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                <a href='/' >
                    <img className='mx-auto static shadow-lg scale-125' src="https://www.swinburne.edu.my/wp-content/themes/mytheme-2021/images/logo-long-full.svg"></img>
                </a>
                <br></br>
                <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
                    Register Account
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

                        <br></br>
                        {/* Register button */}
                        <button
                            type="submit"
                            className="w-full rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition hover:bg-blue-400">
                                Register
                        </button>

                        <p className="text-center text-sm text-gray-600">
                            <Link href="/login" className="text-blue-500 hover:underline">
                                Back to Login
                            </Link>
                        </p>

                    </form>
            </div>
        </main>
    )
}