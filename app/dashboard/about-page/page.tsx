import clsx from 'clsx';
import { getDashboardUser } from '@/app/lib/auth/session';

type AboutUsList = {
  name: string;
  major: string;
  id: number;
}

// Team People details
const aboutUsList : AboutUsList[] = [
  {name: 'Kenneth Hui Hong CHUA', major: 'Artificial Intelligence', id: 102782494},
  {name: 'Kelvin Wen Kiong FONG', major: 'Artificial Intelligence', id: 102782287},
  {name: 'Nigel Zi Jun LING', major: 'Artificial Intelligence', id: 102779140},
  {name: 'Enoch Eren CHUA', major: 'Artificial Intelligence', id: 104401704},
  {name: 'Ivan Jia Wei HOAN', major: 'Software Development', id: 102786580},
];

export default async function Page(){
  const user = await getDashboardUser();
  const isPrivileged = user?.role === 'staff' || user?.role === 'admin';

  const subtitleClasses = clsx(
    'text-xl font-semibold',
    isPrivileged
      ? 'text-white/90'
      : 'text-swin-charcoal'
  );

  const tableClass = clsx(
    'rounded-2xl border border-swin-charcoal/10 p-6 shadow-md',
    isPrivileged
      ? 'bg-swin-charcoal'
      : 'bg-white'
  );

  const tableTitleClass = clsx(
    'text-lg font-semibold',
    isPrivileged 
      ? 'text-white/90'
      : 'text-swin-charcoal'
  )

  const tableContentClass = clsx(
    'text-sm mt-1',
    isPrivileged
      ? 'text-white/80'
      : 'text-swin-charcoal/80'
  );

  const contactTableClass = clsx(
    'rounded-2xl p-6 shadow-md border border-swin-charcoal/10',
    isPrivileged 
      ? 'bg-swin-charcoal'
      : 'bg-swin-ivory'
  );

  const contactTitleClass = clsx(
    'mt-4 space-y-2',
    isPrivileged 
      ? 'text-white-90'
      : 'text-swin-charcoal/80'
  )

  const emailLinkClass = clsx(
    'hover:underline',
    isPrivileged
     ? 'text-red-600'
     : 'text-swin-red'
  )

  return (
    <main className="space-y-8">
      <title>About Us | Dashboard</title>

      <header className="rounded-2xl bg-swin-charcoal p-8 text-swin-ivory shadow-lg shadow-swin-charcoal/30">
        <h1 className="text-2xl font-semibold">About Us</h1>
        <p className="mt-2 max-w-2xl text-sm text-swin-ivory/70">
          This page represents the members who have contributed to the
          development of the Swinburne Library Website project. Each member
          played a vital role in building the system that supports the digital
          library experience, focusing on accessibility, usability, and
          efficiency.
        </p>
      </header>

      <section className="space-y-6">
        <h2 className={subtitleClasses}>Our Team</h2>

        {/* Shorter the team list */}
        {aboutUsList.map((p) => {
          return (
            <div key={p.id} className={tableClass}>
            <h3 className={tableTitleClass}>{p.name}</h3>
            <p className={tableContentClass}>
              Bachelor of Computer Science ({p.major})
            </p>
            <p className={tableContentClass}>
              Student ID: {p.id}
            </p>
            <p className={tableContentClass}>
              <span className="font-medium">Email:</span>{" "}
              {/* Will open your */}
              <a
                href={`https://outlook.office.com/mail/deeplink/compose?to=${p.id}@students.swinburne.edu.my`}
                className={emailLinkClass}
                target="_blank"
              >
                {p.id}@students.swinburne.edu.my
              </a>
            </p>
          </div>
          );
        })}

      </section>
      <section className="space-y-4">
        <h2 className={subtitleClasses}>Contact Us</h2>

        <div className={contactTableClass}>
          <p className={tableContentClass}>
            For any library queries, please get in touch with library staff or
            reach out through the following channels:
          </p>

          <ul className={contactTitleClass}>
            <li>
              <strong>Email:</strong>{"   "}
              {/* Will directly open the OutLook email */}
              <a
                href="https://outlook.office.com/mail/deeplink/compose?to=library@swinburne.edu.my"
                className={emailLinkClass}
              >
                library@swinburne.edu.my
              </a>
            </li>
            <li><strong>Phone:</strong> +6082 260936</li>
            <li>
              <strong>Live Chat:</strong> Available via Library App (during
              operating hours)
            </li>
            <li>
              <strong>Facebook PM:</strong>{" "}
              <a
                href="https://www.facebook.com/SwinburneSarawakLibrary"
                target="_blank"
                rel="noopener noreferrer"
                className={emailLinkClass}
              >
                Swinburne Sarawak Library
              </a>
            </li>
            <li> <strong>Find a Library Liaison</strong></li>
          </ul>

          <div className="mt-6">
            <p className={contactTitleClass}>Follow us:</p>
            <div className="flex gap-4 mt-2">
                <a
                  href="https://www.facebook.com/SwinburneSarawakLibrary"
                  target="_blank"
                  rel="noopener noreferrer"
                 >
                 <img
                 src="https://static.xx.fbcdn.net/rsrc.php/yx/r/e9sqr8WnkCf.ico"
                 alt="Facebook"
                className="w-6 h-6 hover:opacity-80 transition"
                />
                 </a>

              <a
                href="https://www.instagram.com/swinburnesarawak"
                target="_blank"
                rel="noopener noreferrer"
              >
              <img
                 src="https://static.cdninstagram.com/rsrc.php/y4/r/QaBlI0OZiks.ico"
                 alt="Instagram"
                className="w-6 h-6 hover:opacity-80 transition"
                />
                 </a>
              <a
                href="https://x.com/SwinburneSarawak"
                target="_blank"
                rel="noopener noreferrer"
              >
              <img
                 src="https://abs.twimg.com/favicons/twitter.3.ico"
                 alt="Twitter"
                className="w-6 h-6 hover:opacity-80 transition"
                />
                 </a>
                 <a
                href="https://www.tiktok.com/@swinsarawaklib"
                target="_blank"
                rel="noopener noreferrer"
              >
              <img
                 src="https://www.tiktok.com/favicon.ico"
                 alt="TikTok"
                className="w-6 h-6 hover:opacity-80 transition"
                />
                 </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
