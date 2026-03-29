import { apiFetch } from "./client.js";
import type { Role, User } from "./types.js";

export const listUsers = async (
  token: string,
): Promise<{ users: User[] }> => {
  return apiFetch<{ users: User[] }>("/api/admin/users", {
    method: "GET",
    token,
  });
};

export const updateUserRole = async (
  token: string,
  userId: string,
  role: Role,
): Promise<{ user: User }> => {
  return apiFetch<{ user: User }>(
    `/api/admin/users/${encodeURIComponent(userId)}/role`,
    {
      method: "PATCH",
      body: JSON.stringify({ role }),
      token,
    },
  );
};
