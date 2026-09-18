// Every call to bajaaj/'s API needs the same base URL + Bearer token +
// error handling. One place for that instead of repeating it per hook.
export async function apiFetch<T>(
  path: string,
  token: string | null,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request to ${path} failed (${res.status})`);
  }

  return res.json();
}
