import { motion } from "framer-motion";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ApiError } from "../api/errors.js";
import { useAuth } from "../contexts/AuthContext.js";
import { Alert } from "../components/ui/alert.js";
import { Button } from "../components/ui/button.js";
import { Card } from "../components/ui/card.js";
import { Input } from "../components/ui/input.js";
import { Spinner } from "../components/ui/spinner.js";

const DEMO_PASSWORD = "Test@123";
const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@gmail.com" },
  { label: "Editor", email: "editor@gmail.com" },
  { label: "Viewer", email: "viewer@gmail.com" },
] as const;

const showDemoLogin =
  import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO_LOGIN === "true";

export const LoginPage = () => {
  const { login, token, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && token) return <Navigate to="/" replace />;

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner size={22} />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="relative overflow-hidden p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.2),transparent_50%)]" />
          <div className="relative space-y-4">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
              Welcome back
            </h1>
            <p className="text-sm text-slate-400">
              Sign in to manage uploads, sharing, and playback.
            </p>
            {error && <Alert>{error}</Alert>}
            {showDemoLogin && (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Demo accounts
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <Button
                      key={acc.email}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      disabled={submitting}
                      onClick={() => {
                        setEmail(acc.email);
                        setPassword(DEMO_PASSWORD);
                        setError(null);
                      }}
                    >
                      {acc.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                autoComplete="current-password"
              />
              <Button
                type="submit"
                className="w-full"
                disabled={submitting}
                size="lg"
              >
                {submitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <p className="text-xs text-slate-400">
              No account?{" "}
              <Link to="/register" className="text-violet-300 hover:text-violet-200">
                Create one
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
