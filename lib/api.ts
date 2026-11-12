/**
 * Resilient API client for AI Startup Co-founder
 * 
 * Priority:
 * 1. User-configured custom backend in localStorage (e.g. https://your-backend.onrender.com)
 * 2. NEXT_PUBLIC_API_URL environment variable (configured in Vercel)
 * 3. Default internal Next.js Serverless routes (/api)
 */

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

export async function callAPI<T = any>(endpoint: string, data: any): Promise<T> {
  const primaryUrl = getApiUrl(endpoint);
  
  try {
    const response = await fetch(primaryUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return await response.json();
    }
    
    // If primary backend (e.g. Render) returned an error status, try internal /api as fallback
    if (!primaryUrl.startsWith("/api")) {
      console.warn(`[API] Primary backend at ${primaryUrl} returned ${response.status}. Falling back to /api.`);
      const fallbackUrl = `/api/${endpoint.replace(/^\/+/, "").replace(/^api\//, "")}`;
      const fallbackRes = await fetch(fallbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (fallbackRes.ok) {
        return await fallbackRes.json();
      }
    }

    return await response.json();
  } catch (error) {
    // If network error occurred (e.g. Render sleeping or CORS issue), try internal /api as fallback
    if (!primaryUrl.startsWith("/api")) {
      console.warn(`[API] Connection to ${primaryUrl} failed. Falling back to internal /api routes.`);
      const fallbackUrl = `/api/${endpoint.replace(/^\/+/, "").replace(/^api\//, "")}`;
      try {
        const fallbackRes = await fetch(fallbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (fallbackRes.ok) {
          return await fallbackRes.json();
        }
      } catch (fallbackError) {
        console.error("[API] Fallback also failed:", fallbackError);
      }
    }
    throw error;
  }
}
