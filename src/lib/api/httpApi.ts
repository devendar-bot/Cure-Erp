// Real data layer: talks to the Vercel serverless functions in /api,
// which read/write the Google Sheet. Same four-function contract as mockApi.

export type Resource = "items" | "purchaseOrdersDomestic";

async function request<T>(method: string, resource: Resource, id?: string, body?: unknown): Promise<T> {
  const qs = new URLSearchParams({ resource });
  if (id) qs.set("id", id);
  const res = await fetch(`/api/records?${qs.toString()}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status})`);
  return data as T;
}

export const httpApi = {
  list: <T>(resource: Resource) => request<T[]>("GET", resource),
  create: <T extends { id?: string }>(resource: Resource, payload: T) => request<T>("POST", resource, undefined, payload),
  update: <T extends { id: string }>(resource: Resource, id: string, payload: Partial<T>) =>
    request<T>("PUT", resource, id, payload),
  remove: async (resource: Resource, id: string) => {
    await request<{ ok: boolean }>("DELETE", resource, id);
  },
};
