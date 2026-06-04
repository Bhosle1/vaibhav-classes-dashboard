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

  // If already authenticated, skip straight to the dashboard
  useEffect(() => {
    if (localStorage.getItem("auth_token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  function validate() {
    const errs = {};
    if (!userId.trim()) errs.userId = "User ID is required";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError("");
    setErrors({});

    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { userId, password });
      const { token, user } = res.data.data;
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/dashboard");
    } catch (err) {
      setApiError(err.response?.data?.message || "Connection refused. Please check credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1.5rem",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Floating ambient orbs */}
      <div style={{
        position: "absolute", width: "600px", height: "600px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.13) 0%, transparent 70%)",
        top: "-150px", left: "-150px", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: "500px", height: "500px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 70%)",
        bottom: "-100px", right: "-100px", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: "300px", height: "300px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%)",
        top: "50%", left: "60%", pointerEvents: "none",
      }} />

      {/* Outer gradient border ring — the iOS 26 signature look */}
      <div
        className="animate-fade-in"
        style={{
          width: "100%", maxWidth: "400px",
          borderRadius: "var(--radius-xl)",
          padding: "1.5px",
          background: "linear-gradient(135deg, rgba(139,92,246,0.50) 0%, rgba(236,72,153,0.30) 50%, rgba(6,182,212,0.20) 100%)",
          boxShadow: "0 0 70px rgba(139,92,246,0.20), 0 0 140px rgba(139,92,246,0.08)",
        }}
      >
        {/* Inner frosted glass card */}
        <div style={{
          background: "rgba(10, 8, 22, 0.75)",
          backdropFilter: "blur(48px) saturate(200%)",
          WebkitBackdropFilter: "blur(48px) saturate(200%)",
          borderRadius: "calc(var(--radius-xl) - 1.5px)",
          padding: "2.75rem 2.25rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>

          {/* Specular highlight on top edge */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22) 35%, rgba(255,255,255,0.38) 50%, rgba(255,255,255,0.22) 65%, transparent)",
            pointerEvents: "none",
          }} />

          {/* App icon */}
          <div style={{
            width: "3.75rem", height: "3.75rem",
            borderRadius: "var(--radius-md)",
            background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1.75rem auto",
            boxShadow: "0 10px 36px rgba(139,92,246,0.50), inset 0 1px 0 rgba(255,255,255,0.28)",
            position: "relative",
          }}>
            {/* Icon specular */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "50%",
              background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)",
              borderRadius: "var(--radius-md) var(--radius-md) 0 0",
              pointerEvents: "none",
            }} />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.886a1 1 0 0 1-.95.688H3l4.9 3.56a1 1 0 0 1 .36 1.11L6.35 20 12 16.36 17.65 20l-1.91-5.756a1 1 0 0 1 .36-1.11L21 9.574h-6.138a1 1 0 0 1-.95-.688L12 3Z" />
            </svg>
          </div>

          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.3rem", letterSpacing: "-0.03em" }}>
            Welcome back
          </h1>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.40)", marginBottom: "2rem" }}>
            Sign in to your administration dashboard
          </p>

          {/* Error alert */}
          {apiError && (
            <div className="alert-error animate-fade-in" style={{ marginBottom: "1.5rem" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* User ID */}
            <div className="form-group" style={{ textAlign: "left" }}>
              <label className="form-label" htmlFor="userId">User ID</label>
              <input
                id="userId" type="text"
                className={`form-input ${errors.userId ? "input-error" : ""}`}
                placeholder="Enter admin username"
                value={userId}
                onChange={e => { setUserId(e.target.value); if (errors.userId) setErrors(p => ({ ...p, userId: "" })); }}
                disabled={loading} autoComplete="username"
              />
              {errors.userId && <span className="field-error">{errors.userId}</span>}
            </div>

            {/* Password */}
            <div className="form-group" style={{ textAlign: "left" }}>
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  className={`form-input ${errors.password ? "input-error" : ""}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: "" })); }}
                  disabled={loading} autoComplete="current-password"
                  style={{ paddingRight: "3rem" }}
                />
                <button
                  type="button" onClick={() => setShowPass(s => !s)}
                  style={{
                    position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: "rgba(255,255,255,0.32)",
                    cursor: "pointer", padding: "0.25rem", display: "flex",
                    transition: "color 0.15s ease",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.72)"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.32)"}
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

            {/* Sign In button */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%", padding: "0.9rem", marginTop: "0.5rem", fontSize: "0.95rem", borderRadius: "var(--radius-md)", letterSpacing: "0" }}
            >
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <span style={{
                    width: "1rem", height: "1rem",
                    border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                    borderRadius: "50%", display: "inline-block",
                    animation: "spin 0.65s linear infinite",
                  }} />
                  <span>Signing in...</span>
                </div>
              ) : "Sign in →"}
            </button>
          </form>

          {/* Credential hint */}
          <p style={{ marginTop: "1.75rem", fontSize: "0.73rem", color: "rgba(255,255,255,0.20)", lineHeight: 1.7 }}>
            Try <span style={{ color: "rgba(167,139,250,0.60)" }}>vaibhav</span> or{" "}
            <span style={{ color: "rgba(167,139,250,0.60)" }}>ajinkya</span>{" "}
            · password <span style={{ color: "rgba(167,139,250,0.60)" }}>123456789</span>
          </p>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    </div>
  );
}
