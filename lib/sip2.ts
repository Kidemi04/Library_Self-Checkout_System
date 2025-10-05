const BASE = process.env.SIP2_BASE_URL;
const TOKEN = process.env.SIP2_API_KEY;

if (!BASE || !TOKEN) {
  console.warn('SIP2_BASE_URL or SIP2_API_KEY is not set. SIP2 requests will fail.');
}

async function request<T>(endpoint: string, payload: unknown): Promise<T> {
  if (!BASE || !TOKEN) {
    throw new Error('SIP2 configuration missing. Set SIP2_BASE_URL and SIP2_API_KEY.');
  }

  const response = await fetch(`${BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(`SIP2 request failed: ${response.status} ${message}`);
  }

  return response.json() as Promise<T>;
}

export async function login(payload: unknown) {
  return request('/login', payload);
}

export async function logout(payload: unknown) {
  return request('/logout', payload);
}

export async function checkOut(payload: unknown) {
  return request('/checkOut', payload);
}

export async function checkIn(payload: unknown) {
  return request('/checkIn', payload);
}

export async function item(payload: unknown) {
  return request('/item', payload);
}
