import { Navigate } from "react-router-dom";
import { useAuth, landingRouteForRole } from "../context/AuthContext";

// Usage:
//   <ProtectedRoute allowedRoles={['Sticker Balancing Supervisor']}><Home /></ProtectedRoute>
// Omit allowedRoles to just require "logged in, any role".
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in, but wrong role for this page — send them to
    // wherever they're actually allowed, per Section 3 of the spec.
    return <Navigate to={landingRouteForRole(user.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;