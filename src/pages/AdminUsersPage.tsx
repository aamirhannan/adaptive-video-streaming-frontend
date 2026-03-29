import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { Role, User } from "../api/types.js";
import * as adminApi from "../api/admin.js";
import { useAuth } from "../contexts/AuthContext.js";
import { ApiError } from "../api/errors.js";

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
      setUsers((prev) =>
        prev.map((u) => (u.userId === userId ? res.user : u)),
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Update failed");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box className="space-y-4">
      <Typography variant="h4" component="h1">
        Users (admin)
      </Typography>
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Button variant="outlined" onClick={() => void load()}>
        Refresh
      </Button>
      <Table component={Paper} size="small">
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>User ID</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Updated</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.userId}>
              <TableCell>{u.email}</TableCell>
              <TableCell className="font-mono text-xs max-w-[200px] truncate">
                {u.userId}
              </TableCell>
              <TableCell>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    label="Role"
                    value={u.role}
                    disabled={savingId === u.userId}
                    onChange={(e) =>
                      void changeRole(u.userId, e.target.value as Role)
                    }
                  >
                    {ROLES.map((r) => (
                      <MenuItem key={r} value={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell>
                {u.updatedAt
                  ? new Date(u.updatedAt).toLocaleString()
                  : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};
