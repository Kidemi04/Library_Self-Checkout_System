export default function AboutPage() {
  return (
    <main className="space-y-8">
      <title>About Us | Dashboard</title>

      {/* ----- Header ----- */}
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

      {/* ----- Team Members ----- */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-swin-charcoal">Our Team</h2>

        {/* Member 1 */}
        <div className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold text-swin-charcoal">Alice Tan</h3>
          <p className="text-sm text-swin-charcoal/80 mt-1">
            Bachelor of Computer Science (Software Development)
          </p>
          <p className="text-sm text-swin-charcoal/60 mt-2">
            <span className="font-medium">Email:</span>{" "}
            <a
              href="mailto:alice.tan@student.swinburne.edu.my"
              className="text-swin-red hover:underline"
            >
              alice.tan@student.swinburne.edu.my
            </a>
          </p>
        </div>

        {/* Member 2 */}
        <div className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold text-swin-charcoal">Benjamin Wong</h3>
          <p className="text-sm text-swin-charcoal/80 mt-1">
            Bachelor of Information and Communication Technology
          </p>
          <p className="text-sm text-swin-charcoal/60 mt-2">
            <span className="font-medium">Email:</span>{" "}
            <a
              href="mailto:benjamin.wong@student.swinburne.edu.my"
              className="text-swin-red hover:underline"
            >
              benjamin.wong@student.swinburne.edu.my
            </a>
          </p>
        </div>

        {/* Member 3 */}
        <div className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold text-swin-charcoal">Chloe Lim</h3>
          <p className="text-sm text-swin-charcoal/80 mt-1">
            Bachelor of Design (Multimedia Design)
          </p>
          <p className="text-sm text-swin-charcoal/60 mt-2">
            <span className="font-medium">Email:</span>{" "}
            <a
              href="mailto:chloe.lim@student.swinburne.edu.my"
              className="text-swin-red hover:underline"
            >
              chloe.lim@student.swinburne.edu.my
            </a>
          </p>
        </div>

        {/* Member 4 */}
        <div className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold text-swin-charcoal">Daniel Lee</h3>
          <p className="text-sm text-swin-charcoal/80 mt-1">
            Bachelor of Computer Science (Cybersecurity)
          </p>
          <p className="text-sm text-swin-charcoal/60 mt-2">
            <span className="font-medium">Email:</span>{" "}
            <a
              href="mailto:daniel.lee@student.swinburne.edu.my"
              className="text-swin-red hover:underline"
            >
              daniel.lee@student.swinburne.edu.my
            </a>
          </p>
        </div>
      </section>

      {/* ----- Contact Section ----- */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-swin-charcoal">Contact Us</h2>

        <div className="rounded-2xl bg-swin-ivory p-6 shadow-md border border-swin-charcoal/10">
          <p className="text-swin-charcoal/80">
            For any library queries, please get in touch with library staff or
            reach out through the following channels:
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
