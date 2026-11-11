export type ApiJson<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string; details?: unknown } };

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<ApiJson<T>> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    credentials: "same-origin",
  });
  const json = (await res.json().catch(() => null)) as ApiJson<T> | null;
  if (!json) return { ok: false, error: { code: "INVALID_RESPONSE", message: "Invalid server response" } };
  return json;
}

export function fieldErrors(details: unknown): Record<string, string> {
  if (!details || typeof details !== "object") return {};
  const d = details as { fieldErrors?: Record<string, string[] | undefined>; formErrors?: string[] };
  const out: Record<string, string> = {};
  if (d.fieldErrors) for (const [k, v] of Object.entries(d.fieldErrors)) if (v?.[0]) out[k] = v[0];
  if (d.formErrors?.[0]) out._form = d.formErrors[0];
  return out;
}
