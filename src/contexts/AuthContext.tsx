import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as authApi from "../api/auth.js";
import type { User } from "../api/types.js";
import { ApiError } from "../api/errors.js";

const STORAGE_TOKEN = "avs_token";
const STORAGE_USER = "avs_user";

type AuthContextValue = {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const readStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(STORAGE_USER);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_TOKEN),
  );
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [loading, setLoading] = useState(true);

  const persist = useCallback((t: string | null, u: User | null) => {
    setToken(t);
    setUser(u);
    if (t) localStorage.setItem(STORAGE_TOKEN, t);
    else localStorage.removeItem(STORAGE_TOKEN);
    if (u) localStorage.setItem(STORAGE_USER, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_USER);
  }, []);

  const refreshMe = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { user: u } = await authApi.me(token);
      setUser(u);
      localStorage.setItem(STORAGE_USER, JSON.stringify(u));
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 404)) {
        persist(null, null);
      }
    } finally {
      setLoading(false);
    }
  }, [token, persist]);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password);
      persist(res.token, res.user);
    },
    [persist],
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.register(email, password);
      persist(res.token, res.user);
    },
    [persist],
  );

  const logout = useCallback(() => {
    persist(null, null);
  }, [persist]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      register,
      logout,
      refreshMe,
    }),
    [token, user, loading, login, register, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
