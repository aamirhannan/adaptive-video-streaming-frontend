import { useCallback, useEffect, useState } from "react";
import * as adminApi from "../api/admin.js";
import { ApiError } from "../api/errors.js";
import type { Role, User } from "../api/types.js";
import { Alert } from "../components/ui/alert.js";
import { Button } from "../components/ui/button.js";
import { Card } from "../components/ui/card.js";
import { useAuth } from "../contexts/AuthContext.js";

const ROLES: Role[] = ["viewer", "editor", "admin"];

export const AdminUsersPage = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    setLoading(true);
    try {
      const res = await adminApi.listUsers(token);
      setUsers(res.users);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeRole = async (userId: string, role: Role) => {
    if (!token) return;
    setSavingId(userId);
    setError(null);
    try {
      const res = await adminApi.updateUserRole(token, userId, role);
      setUsers((prev) => prev.map((u) => (u.userId === userId ? res.user : u)));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Update failed");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-slate-400">Admin role management dashboard.</p>
        </div>
        <Button variant="outline" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      {error && <Alert>{error}</Alert>}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-300">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">User ID</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={4}>
                    Loading users...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.userId} className="border-b border-white/8 hover:bg-white/5">
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="max-w-[20rem] truncate px-4 py-3 font-mono text-xs text-slate-300">
                      {u.userId}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="h-9 rounded-lg border border-white/15 bg-white/5 px-2 text-sm outline-none focus:border-violet-400/50"
                        value={u.role}
                        disabled={savingId === u.userId}
                        onChange={(e) => void changeRole(u.userId, e.target.value as Role)}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {u.updatedAt ? new Date(u.updatedAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
