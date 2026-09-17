import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth, landingRouteForRole } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Home from "./pages/Home";
import IssueSticker from "./pages/IssueSticker";
import BalanceSticker from "./pages/BalanceSticker";
import AddSticker from "./pages/AddSticker";
import ProductivitySheet from "./pages/ProductivitySheet";
import AdminUsers from "./pages/AdminUsers";

const SUPERVISOR = "Sticker Balancing Supervisor";
const EXECUTIVE = "Executive";
const ADMIN = "Admin";

const RootRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={landingRouteForRole(user.role)} replace />;
};

const App = () => (
  <Routes>
    <Route path="/login" element={<Login />} />

    <Route
      path="/home"
      element={
        <ProtectedRoute allowedRoles={[SUPERVISOR]}>
          <Home />
        </ProtectedRoute>
      }
    />
    <Route
      path="/issue-sticker"
      element={
        <ProtectedRoute allowedRoles={[SUPERVISOR]}>
          <IssueSticker />
        </ProtectedRoute>
      }
    />
    <Route
      path="/balance-sticker"
      element={
        <ProtectedRoute allowedRoles={[SUPERVISOR]}>
          <BalanceSticker />
        </ProtectedRoute>
      }
    />
    <Route
      path="/add-sticker"
      element={
        <ProtectedRoute allowedRoles={[SUPERVISOR]}>
          <AddSticker />
        </ProtectedRoute>
      }
    />
    {/* Supervisor: view access. Executive: default landing page. Both allowed. */}
    <Route
      path="/productivity"
      element={
        <ProtectedRoute allowedRoles={[SUPERVISOR, EXECUTIVE]}>
          <ProductivitySheet />
        </ProtectedRoute>
      }
    />

    {/* Admin's only page — create/edit/deactivate users. No access to
        Home, Issue/Balance/Add Sticker, or Productivity. */}
    <Route
      path="/admin/users"
      element={
        <ProtectedRoute allowedRoles={[ADMIN]}>
          <AdminUsers />
        </ProtectedRoute>
      }
    />

    <Route path="/" element={<RootRedirect />} />
    <Route path="*" element={<RootRedirect />} />
  </Routes>
);

export default App;