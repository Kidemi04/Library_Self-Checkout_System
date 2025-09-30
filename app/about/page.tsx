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

            <img
                className='scale-50'
                src="https://aadcdn.msauthimages.net/447973e2-uddq3dansz8dzvbzqaldisw5-z1gjnyitaoanchjrvw/logintenantbranding/0/illustration?ts=636377489049121844" />
        </main>
    )
}