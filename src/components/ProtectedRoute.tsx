import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "./ui/spinner.js";

import { useAuth } from "../contexts/AuthContext.js";

export const ProtectedRoute = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Spinner />
          Checking session...
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
