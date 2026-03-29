import { ApiError } from "./errors.js";
import { getApiBaseUrl } from "../lib/config.js";

type FetchOptions = RequestInit & {
  token?: string | null;
};

const parseErrorBody = async (res: Response): Promise<string> => {
  const text = await res.text();
  try {
    const j = JSON.parse(text) as { message?: string };
    return j.message ?? (text || res.statusText);
  } catch {
    return text || res.statusText;
  }
};

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const base = getApiBaseUrl();
  const headers = new Headers(options.headers);
  const token = options.token;

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${base}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const message = await parseErrorBody(res);
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const ct = res.headers.get("content-type");
  if (ct?.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.text()) as T;
}
