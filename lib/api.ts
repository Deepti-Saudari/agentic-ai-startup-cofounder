/**
 * Resilient API client for AI Startup Co-founder
 * 
 * Supports:
 * - Direct custom backend (e.g. FastAPI on Render)
 * - Built-in Next.js Serverless routes (/api)
 * - Automatic client-side Groq API key pass-through via 'x-groq-api-key' header
 * - Automatic failover from custom backend to /api if custom backend is down/offline
 */

export function getStoredGroqKey(): string {
  if (typeof window === "undefined") return "";
  const key = localStorage.getItem("groq_api_key") || "";
  return key.trim().replace(/^["']|["']$/g, "");
}

export function setStoredGroqKey(key: string): void {
  if (typeof window === "undefined") return;
  const clean = key.trim().replace(/^["']|["']$/g, "");
  if (!clean) {
    localStorage.removeItem("groq_api_key");
  } else {
    localStorage.setItem("groq_api_key", clean);
  }
}

export function getBaseApiUrl(): string {
  if (typeof window !== "undefined") {
    const customUrl = localStorage.getItem("ai_startup_custom_backend");
    if (customUrl && customUrl.trim()) {
      return customUrl.trim().replace(/\/+$/, "");
    }
  }

  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, "");
  }

  return "/api";
}

export const API_BASE = getBaseApiUrl();

export function getApiUrl(endpoint: string): string {
  const base = getBaseApiUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;

  if (base === "/api" || base.endsWith("/api")) {
    const pathWithoutApi = cleanEndpoint.startsWith("api/") ? cleanEndpoint.slice(4) : cleanEndpoint;
    return `/api/${pathWithoutApi}`;
  }

  return `${base}/${cleanEndpoint}`;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const primaryUrl = getApiUrl(endpoint);
  const userGroqKey = getStoredGroqKey();

  const headers = new Headers(options.headers || {});
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (userGroqKey && !headers.has("x-groq-api-key")) {
    headers.set("x-groq-api-key", userGroqKey);
  }

  try {
    const response = await fetch(primaryUrl, {
      ...options,
      headers,
    });

    // If external primary backend (e.g. Render) returned 5xx, 404, or 502, fall back to internal /api
    const isExternal = !primaryUrl.startsWith("/api") && 
      (typeof window !== "undefined" ? !primaryUrl.startsWith(window.location.origin + "/api") : true);

    if (!response.ok && isExternal && response.status >= 400 && response.status !== 401 && response.status !== 422) {
      console.warn(`[API] External backend returned ${response.status}. Attempting fallback to internal /api.`);
      const fallbackUrl = `/api/${endpoint.replace(/^\/+/, "").replace(/^api\//, "")}`;
      const fallbackRes = await fetch(fallbackUrl, {
        ...options,
        headers,
      });
      if (fallbackRes.ok) {
        return fallbackRes;
      }
    }

    return response;
  } catch (error) {
    // If network error occurred (e.g. Render sleeping, offline, or CORS), fallback to internal /api
    const isExternal = !primaryUrl.startsWith("/api");
    if (isExternal) {
      console.warn(`[API] Connection to ${primaryUrl} failed. Falling back to internal /api routes.`);
      const fallbackUrl = `/api/${endpoint.replace(/^\/+/, "").replace(/^api\//, "")}`;
      try {
        const fallbackRes = await fetch(fallbackUrl, {
          ...options,
          headers,
        });
        return fallbackRes;
      } catch (fallbackError) {
        console.error("[API] Fallback to internal /api also failed:", fallbackError);
      }
    }
    throw error;
  }
}

export async function callAPI<T = any>(endpoint: string, data: any): Promise<T> {
  const response = await apiFetch(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`API error ${response.status}: ${errText || response.statusText}`);
  }

  return await response.json();
}
