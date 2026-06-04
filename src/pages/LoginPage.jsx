import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect straight to dashboard
  useEffect(() => {
    if (localStorage.getItem("auth_token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  // Local form validation before calling endpoints
  function validate() {
    const errs = {};
    if (!userId.trim()) {
      errs.userId = "User ID is required";
    }
    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    return errs;
  }

  // Handle credentials form submissions
  async function handleSubmit(e) {
    e.preventDefault();
    setApiError("");
    setErrors({});
    
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      // POST payload verification
      const res = await api.post("/auth/login", { userId, password });
      const { token, user } = res.data.data;
      
      // Save session credentials
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      navigate("/dashboard");
    } catch (err) {
      setApiError(
        err.response?.data?.message || "Connection refused. Please check credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "calc(100vh - 60px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1.5rem"
    }}>
      {/* Centered Login Card */}
      <div 
        className="glass-panel animate-fade-in" 
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "2.5rem 2rem",
          textAlign: "center",
          borderRadius: "var(--radius-lg)"
        }}
      >
        {/* Glow Logo Icon */}
        <div style={{
          width: "3.5rem",
          height: "3.5rem",
          borderRadius: "var(--radius-md)",
          background: "var(--gradient-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.5rem auto",
          boxShadow: "var(--shadow-glow)"
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#fff" }}>
            <path d="m12 3-1.912 5.886a1 1 0 0 1-.95.688H3l4.9 3.56a1 1 0 0 1 .36 1.11L6.35 20 12 16.36 17.65 20l-1.91-5.756a1 1 0 0 1 .36-1.11L21 9.574h-6.138a1 1 0 0 1-.95-.688L12 3Z" />
          </svg>
        </div>

        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Welcome back</h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "2rem" }}>
          Sign in to your administration dashboard
        </p>

        {/* API Error Notification */}
        {apiError && (
          <div className="alert-error animate-fade-in">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* User ID Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="userId">User ID</label>
            <input
              id="userId"
              type="text"
              className={`form-input ${errors.userId ? "input-error" : ""}`}
              placeholder="e.g. admin"
              value={userId}
              onChange={e => {
                setUserId(e.target.value);
                if (errors.userId) setErrors(p => ({ ...p, userId: "" }));
              }}
              disabled={loading}
              autoComplete="username"
            />
            {errors.userId && <span className="field-error">{errors.userId}</span>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPass ? "text" : "password"}
                className={`form-input ${errors.password ? "input-error" : ""}`}
                placeholder="••••••••"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(p => ({ ...p, password: "" }));
                }}
                disabled={loading}
                autoComplete="current-password"
                style={{ paddingRight: "3rem" }}
              />
              {/* Show/Hide Toggles */}
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  padding: "0.25rem",
                  transition: "var(--transition)"
                }}
              >
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* Submit Trigger */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.85rem", marginTop: "1rem" }}
            disabled={loading}
          >
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <span style={{
                  width: "1rem",
                  height: "1rem",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin 0.6s linear infinite"
                }} />
                <span>Signing in...</span>
              </div>
            ) : "Sign in"}
          </button>
        </form>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
