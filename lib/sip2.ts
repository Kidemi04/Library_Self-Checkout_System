const BASE = process.env.SIP2_BASE_URL;
const TOKEN = process.env.SIP2_API_KEY;
const SIP2_TIMEOUT_MS = Number(process.env.SIP2_TIMEOUT_MS ?? 5000);

if (!BASE || !TOKEN) {
  console.warn('[SIP2] Configuration missing.');
}

type SipEndpoint = '/login' | '/logout' | '/checkOut' | '/checkIn' | '/item';

async function request<T>(endpoint: SipEndpoint, payload: unknown): Promise<T> {
  if (!BASE || !TOKEN) {
    throw new Error('SIP2 service unavailable.');
  }

  // Cap each request — SIP2 is auxiliary; Supabase is source of truth. Without
  // a cap, an unresponsive emulator blocks the server action until system TCP
  // timeout, freezing the UI on "Processing…" for 30+ seconds.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SIP2_TIMEOUT_MS);

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
      signal: controller.signal,
    });
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError';
    console.error('[SIP2] Network error', {
      endpoint,
      reason: aborted ? `timeout after ${SIP2_TIMEOUT_MS}ms` : 'network',
      time: new Date().toISOString(),
    });

    throw new Error(aborted ? 'SIP2 request timed out.' : 'SIP2 service unreachable.');
  } finally {
    clearTimeout(timeoutId);
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