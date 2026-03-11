const BASE = process.env.SIP2_BASE_URL;
const TOKEN = process.env.SIP2_API_KEY;

if (!BASE || !TOKEN) {
  console.warn('[SIP2] Configuration missing.');
}

type SipEndpoint = '/login' | '/logout' | '/checkOut' | '/checkIn' | '/item';

async function request<T>(endpoint: SipEndpoint, payload: unknown): Promise<T> {
  if (!BASE || !TOKEN) {
    throw new Error('SIP2 service unavailable.');
  }

  let response: Response;

  try {
    response = await fetch(`${BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
  } catch (err) {
    console.error('[SIP2] Network error', {
      endpoint,
      time: new Date().toISOString(),
    });

    throw new Error('SIP2 service unreachable.');
  }

  if (!response.ok) {
    console.error('[SIP2] Request failed', {
      endpoint,
      status: response.status,
      time: new Date().toISOString(),
    });

    throw new Error('SIP2 operation failed.');
  }

  try {
    return (await response.json()) as T;
  } catch {
    console.error('[SIP2] Invalid JSON response', {
      endpoint,
      time: new Date().toISOString(),
    });

    throw new Error('SIP2 invalid response.');
  }
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