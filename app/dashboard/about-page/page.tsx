export default function AboutPage() {
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
        <h2 className="text-lg font-semibold text-swin-charcoal">Our Team</h2>

        <div className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold text-swin-charcoal">Kenneth Hui Hong CHUA</h3>
          <p className="text-sm text-swin-charcoal/80 mt-1">
            Bachelor of Computer Science (Artificial Intelligence)
          </p>
          <p className="text-sm text-swin-charcoal/80 mt-1">
            Student ID: 102782494
          </p>
          <p className="text-sm text-swin-charcoal/60 mt-2">
            <span className="font-medium">Email:</span>{" "}
            <a
              href="mailto:102782494@students.swinburne.edu.my"
              className="text-swin-red hover:underline"
            >
              102782494@students.swinburne.edu.my
            </a>
          </p>
        </div>

       <div className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold text-swin-charcoal">Kelvin Wen Kiong FONG</h3>
          <p className="text-sm text-swin-charcoal/80 mt-1">
            Bachelor of Computer Science (Artificial Intelligence)
          </p>
          <p className="text-sm text-swin-charcoal/80 mt-1">
            Student ID: 102782287
          </p>
          <p className="text-sm text-swin-charcoal/60 mt-2">
            <span className="font-medium">Email:</span>{" "}
            <a
              href="mailto:102782287@students.swinburne.edu.my"
              className="text-swin-red hover:underline"
            >
              102782287@students.swinburne.edu.my
            </a>
          </p>
        </div>

        <div className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold text-swin-charcoal">Nigel Zi Jun LING</h3>
          <p className="text-sm text-swin-charcoal/80 mt-1">
            Bachelor of Computer Science (Artificial Intelligence)
          </p>
          <p className="text-sm text-swin-charcoal/80 mt-1">
            Student ID: 102779140
          </p>
          <p className="text-sm text-swin-charcoal/60 mt-2">
            <span className="font-medium">Email:</span>{" "}
            <a
              href="mailto:102779140@students.swinburne.edu.my"
              className="text-swin-red hover:underline"
            >
              102779140@students.swinburne.edu.my
            </a>
          </p>
        </div>

        <div className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold text-swin-charcoal">Enoch Eren CHUA</h3>
          <p className="text-sm text-swin-charcoal/80 mt-1">
            Bachelor of Computer Science (Artificial Intelligence)
          </p>
          <p className="text-sm text-swin-charcoal/80 mt-1">
            Student ID: 104401704
          </p>
          <p className="text-sm text-swin-charcoal/60 mt-2">
            <span className="font-medium">Email:</span>{" "}
            <a
              href="mailto:104401704@students.swinburne.edu.my"
              className="text-swin-red hover:underline"
            >
              104401704@students.swinburne.edu.my
            </a>
          </p>
        </div>

        <div className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold text-swin-charcoal">Ivan Jia Wei HOAN</h3>
          <p className="text-sm text-swin-charcoal/80 mt-1">
            Bachelor of Computer Science (Software Development)
          </p>
          <p className="text-sm text-swin-charcoal/80 mt-1">
            Student ID: 102786580
          </p>
          <p className="text-sm text-swin-charcoal/60 mt-2">
            <span className="font-medium">Email:</span>{" "}
            <a
              href="mailto:102786580@students.swinburne.edu.my"
              className="text-swin-red hover:underline"
            >
              102786580@students.swinburne.edu.my
            </a>
          </p>
        </div>

</section>
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-swin-charcoal">Contact Us</h2>

        <div className="rounded-2xl bg-swin-ivory p-6 shadow-md border border-swin-charcoal/10">
          <p className="text-swin-charcoal/80">
            For any library queries, please get in touch with library staff or
            reach out through the following channels:
          </p>

          <ul className="mt-4 space-y-2 text-swin-charcoal/80">
            <li>
              <strong>Email:</strong>{" "}
              <a
                href="mailto:library@swinburne.edu.my"
                className="text-swin-red hover:underline"
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
                className="text-swin-red hover:underline"
              >
                Swinburne Sarawak Library
              </a>
            </li>
            <li> <strong>Find a Library Liaison</strong></li>
          </ul>

          <div className="mt-6">
            <p className="font-semibold text-swin-charcoal">Follow us:</p>
            <div className="flex gap-4 mt-2">
                <a
                  href="https://www.facebook.com/SwinburneSarawakLibrary"
                  target="_blank"
                  rel="noopener noreferrer"
                 >
                 <img
                 src="/public/image/facebook.png"
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
                 src="/public/image/instagram.png"
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
                 src="/public/image/x.png"
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
                 src="/public/image/tiktok.png"
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
