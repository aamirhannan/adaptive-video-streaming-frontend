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

export const RegisterPage = () => {
  const { register, token, loading } = useAuth();
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
      await register(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed");
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
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_45%)]" />
          <div className="relative space-y-4">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
              Create account
            </h1>
            <p className="text-sm text-slate-400">
              Join to upload, share, and stream videos securely.
            </p>
            {error && <Alert>{error}</Alert>}
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
                placeholder="Minimum 8 characters"
                required
                autoComplete="new-password"
                minLength={8}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={submitting}
                size="lg"
              >
                {submitting ? "Creating..." : "Create account"}
              </Button>
            </form>
            <p className="text-xs text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="text-violet-300 hover:text-violet-200">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
