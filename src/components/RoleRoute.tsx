import { Navigate, Outlet } from "react-router-dom";
import type { Role } from "../api/types.js";
import { useAuth } from "../contexts/AuthContext.js";

type Props = {
  allow: Role[];
};

export const RoleRoute = ({ allow }: Props) => {
  const { user } = useAuth();

  if (!user || !allow.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
