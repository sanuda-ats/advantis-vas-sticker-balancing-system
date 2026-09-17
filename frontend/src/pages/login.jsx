import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, landingRouteForRole } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import Typewriter from "../components/Typewriter";
import advantisLogo from "../assets/advantis-logo-transparent.png";
import heroImage from "../assets/login-hero.jpg";

const FEATURES = [
  "Issue sticker sheets in seconds",
  "Live balancing & reconciliation",
  "Table-wise productivity tracking",
  "One-click Excel reports",
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(userId, password);
      navigate(landingRouteForRole(user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid User ID or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <section className="auth-hero" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="auth-hero-badge">
          <img src={advantisLogo} alt="Advantis" />
        </div>

        <div className="auth-hero-content">
          <div className="auth-hero-eyebrow">Value Added Services</div>
          <h1 className="auth-hero-title">
            Sticker Balancing <span>&amp; Productivity</span> System
          </h1>
          <p className="auth-hero-sub">
            Issue, reconcile and track sticker sheets across every VAS table -
            in real time, with zero guesswork.
          </p>
          <div className="auth-hero-typewriter">
            <Typewriter words={FEATURES} />
          </div>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-theme-toggle">
          <ThemeToggle />
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-brand mono">VAS &middot; Sticker System</div>
          <h2>Sign in</h2>

          <div className="field-group">
            <label className="field-label" htmlFor="userId">
              User ID
            </label>
            <input
              id="userId"
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default Login;