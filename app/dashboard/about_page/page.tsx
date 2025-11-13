export default function AboutPage() {
  const teamMembers = [
    {
      id: 1,
      name: "Alice Tan",
      bachelor: "Bachelor of Computer Science (Software Development)",
      email: "alice.tan@student.swinburne.edu.my",
    },
    {
      id: 2,
      name: "Benjamin Wong",
      bachelor: "Bachelor of Information and Communication Technology",
      email: "benjamin.wong@student.swinburne.edu.my",
    },
    {
      id: 3,
      name: "Chloe Lim",
      bachelor: "Bachelor of Design (Multimedia Design)",
      email: "chloe.lim@student.swinburne.edu.my",
    },
    {
      id: 4,
      name: "Daniel Lee",
      bachelor: "Bachelor of Computer Science (Cybersecurity)",
      email: "daniel.lee@student.swinburne.edu.my",
    },
  ];

  return (
    <main className="space-y-8">
      <title>About Us | Dashboard</title>

      {/* ----- Header Section ----- */}
      <header className="rounded-2xl bg-swin-charcoal p-8 text-swin-ivory shadow-lg shadow-swin-charcoal/30">
        <h1 className="text-2xl font-semibold">About Us</h1>
        <p className="mt-2 max-w-2xl text-sm text-swin-ivory/70">
          Meet the development team behind the Swinburne Library Dashboard. Our
          mission is to enhance accessibility and improve user experience for
          all library users.
        </p>
      </header>

      {/* ----- Team Section ----- */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-swin-charcoal">Our Team</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-md transition hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold text-swin-charcoal">
                {member.name}
              </h3>
              <p className="text-sm text-swin-charcoal/80 mt-1">
                {member.bachelor}
              </p>
              <p className="text-sm text-swin-charcoal/60 mt-2">
                <span className="font-medium">Email:</span>{" "}
                <a
                  href={`mailto:${member.email}`}
                  className="text-swin-red hover:underline"
                >
                  {member.email}
                </a>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ----- Contact Section ----- */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-swin-charcoal">Contact Us</h2>

        <div className="rounded-2xl bg-swin-ivory p-6 shadow-md border border-swin-charcoal/10">
          <p className="text-swin-charcoal/80">
            For any library queries, please get in touch with library staff or
            through:
          </p>

          <ul className="mt-4 space-y-2 text-swin-charcoal/80">
            <li>
              📧 <strong>Email:</strong>{" "}
              <a
                href="mailto:library@swinburne.edu.my"
                className="text-swin-red hover:underline"
              >
                library@swinburne.edu.my
              </a>
            </li>
            <li>📞 <strong>Phone:</strong> +6082 260936</li>
            <li>
              💬 <strong>Live Chat:</strong> Available via Library App (during
              operating hours)
            </li>
            <li>
              📘 <strong>Facebook PM:</strong>{" "}
              <a
                href="https://www.facebook.com/SwinburneSarawakLibrary"
                target="_blank"
                rel="noopener noreferrer"
                className="text-swin-red hover:underline"
              >
                Swinburne Sarawak Library
              </a>
            </li>
            <li>👩‍🏫 <strong>Find a Library Liaison</strong></li>
          </ul>

          <div className="mt-6">
            <p className="font-semibold text-swin-charcoal">Follow us:</p>
            <div className="flex gap-4 mt-2">
              <a
                href="https://www.facebook.com/SwinburneSarawakLibrary"
                target="_blank"
                rel="noopener noreferrer"
                className="text-swin-red hover:underline"
              >
                Facebook
              </a>
              <a
                href="https://www.instagram.com/swinburnesarawak"
                target="_blank"
                rel="noopener noreferrer"
                className="text-swin-red hover:underline"
              >
                Instagram
              </a>
              <a
                href="https://x.com/SwinburneSarawak"
                target="_blank"
                rel="noopener noreferrer"
                className="text-swin-red hover:underline"
              >
                X (Twitter)
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
