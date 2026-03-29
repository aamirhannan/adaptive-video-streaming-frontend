import { apiFetch } from "./client.js";
import type { User } from "./types.js";

export type AuthResponse = {
  token: string;
  user: User;
};

export const login = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const register = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  return apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const me = async (token: string): Promise<{ user: User }> => {
  return apiFetch<{ user: User }>("/api/auth/me", {
    method: "GET",
    token,
  });
};
