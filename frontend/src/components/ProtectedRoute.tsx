import { Navigate } from "react-router-dom";
import { isAnyoneLoggedIn } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "coordinator" | "any";
}

const ProtectedRoute = ({ children, requiredRole = "any" }: ProtectedRouteProps) => {
  if (!isAnyoneLoggedIn()) {
    // Not logged in - redirect to appropriate login
    const userRole = localStorage.getItem("userRole");
    if (userRole === "coordinator") {
      return <Navigate to="/coordinator-login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
