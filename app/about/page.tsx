import Link from 'next/link';

export default function AboutPage() {
    return (
        <main>
            <title>About</title>
            <header className="flex items-center justify-between bg-blue-600 px-6 py-4">
                <img
                    className="h-10 md:h-14"
                    src="https://www.swinburne.edu.my/wp-content/themes/mytheme-2021/images/logo-long-full.svg"
                    alt="Swinburne Logo"/>
            </header>
        </main>
    )
}