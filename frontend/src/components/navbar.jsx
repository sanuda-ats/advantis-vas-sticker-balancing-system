import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

const formatDate = (d) =>
  d.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const Navbar = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [today, setToday] = useState(() => new Date());

  // Keeps the displayed date correct if the app is left open across midnight.
  useEffect(() => {
    const interval = setInterval(() => setToday(new Date()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="navbar-title">{title}</div>
        <div className="navbar-date muted">{formatDate(today)}</div>
      </div>
      <div className="navbar-identity">
        <div className="navbar-identity-text">
          <span className="navbar-user">{user?.userName}</span>
          <span className="navbar-meta mono">
            ID {user?.userId} &middot; {user?.location}
          </span>
        </div>
        <ThemeToggle />
        <button type="button" className="btn btn-ghost" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  );
};

export default Navbar;