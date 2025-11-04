import { NextResponse } from "next/server";
import { login } from "@/lib/sip2";

export async function GET() {
  try {
    // Replace with actual test credentials from your lecturer / SIP2 doc
    const result = await login({
      uid: "1",           // library card number / student ID
      pwd: "1",               // PIN or password
      loginUserId: "libadmin",   // staff login ID
      loginPassword: "password"  // staff password
    });

    return NextResponse.json({ ok: true, data: result });
  } catch (err) {
    console.error("❌ SIP2 Test Error:", err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
