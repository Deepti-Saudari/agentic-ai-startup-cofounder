// If NEXT_PUBLIC_API_URL is configured (e.g. separate FastAPI host), use it.
// Otherwise, default to internal Next.js "/api" routes that execute directly on Vercel.
export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/+$/, "");

export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;

  if (API_BASE === "/api" || API_BASE.endsWith("/api")) {
    const pathWithoutApi = cleanEndpoint.startsWith("api/") ? cleanEndpoint.slice(4) : cleanEndpoint;
    return `/api/${pathWithoutApi}`;
  }

  return `${API_BASE}/${cleanEndpoint}`;
}

export async function callAPI<T = any>(endpoint: string, data: any): Promise<T> {
  const url = getApiUrl(endpoint);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}
