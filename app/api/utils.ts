export async function forwardToLibraryAPI(endpoint: string, body: any) {
  const baseUrl = "https://library-emulator-staging.swinburne.edu.my/api";

  try {
    const res = await fetch(`${baseUrl}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LIBRARY_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`❌ Error calling Library API (${endpoint}):`, error);
    return { status: -1, error: "Connection failed" };
  }
}
