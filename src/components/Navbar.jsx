import { useNavigate, Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("auth_token");

  // Don't render the navbar if not logged in
  if (!token) return null;

  const userString = localStorage.getItem("user");
  let user = null;
  try {
    user = userString ? JSON.parse(userString) : null;
  } catch (e) {
    user = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 200, padding: "0.75rem 1.5rem" }}>
      <nav style={{
        background: "rgba(255, 255, 255, 0.045)",
        backdropFilter: "blur(32px) saturate(180%)",
        WebkitBackdropFilter: "blur(32px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.12)",
        padding: "0.55rem 0.85rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1rem",
        maxWidth: "1240px",
        margin: "0 auto",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Top specular highlight line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "1px",
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 35%, rgba(255,255,255,0.40) 50%, rgba(255,255,255,0.28) 65%, transparent 100%)",
          pointerEvents: "none",
        }} />

        {/* Brand */}
        <Link to="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.65rem", flexShrink: 0 }}>
          <div style={{
            width: "2rem", height: "2rem",
            borderRadius: "var(--radius-sm)",
            background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(139,92,246,0.40), inset 0 1px 0 rgba(255,255,255,0.2)",
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.886a1 1 0 0 1-.95.688H3l4.9 3.56a1 1 0 0 1 .36 1.11L6.35 20 12 16.36 17.65 20l-1.91-5.756a1 1 0 0 1 .36-1.11L21 9.574h-6.138a1 1 0 0 1-.95-.688L12 3Z" />
            </svg>
          </div>
          <span style={{
            fontSize: "1.05rem", fontWeight: 800, fontFamily: "var(--font-heading)",
            background: "linear-gradient(135deg, #fff 0%, #c4b5fd 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            letterSpacing: "-0.02em",
          }}>
            Apex Portal
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <NavChip to="/dashboard" label="Dashboard" active={isActive("/dashboard")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
          </NavChip>
        </div>

        {/* Right — user pill + logout */}
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "0.6rem",
              background: "rgba(255,255,255,0.055)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "var(--radius-full)",
              padding: "0.3rem 0.85rem 0.3rem 0.35rem",
              backdropFilter: "blur(12px)",
            }}>
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7c3aed&color=fff&size=80`}
                alt={user.name}
                style={{
                  width: "1.75rem", height: "1.75rem",
                  borderRadius: "var(--radius-full)", objectFit: "cover",
                  border: "1.5px solid rgba(255,255,255,0.18)", flexShrink: 0,
                }}
              />
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "rgba(255,255,255,0.90)" }}>{user.name}</div>
                <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.38)", fontWeight: 500 }}>Admin</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{
                background: "rgba(244,63,94,0.08)",
                border: "1px solid rgba(244,63,94,0.16)",
                borderRadius: "var(--radius-full)",
                width: "2.1rem", height: "2.1rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                transition: "background 0.15s ease, border-color 0.15s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(244,63,94,0.18)";
                e.currentTarget.style.borderColor = "rgba(244,63,94,0.35)";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(244,63,94,0.08)";
                e.currentTarget.style.borderColor = "rgba(244,63,94,0.16)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}

// Small nav link chip component
function NavChip({ to, label, active, children }) {
  return (
    <Link
      to={to}
      style={{
        display: "flex", alignItems: "center", gap: "0.35rem",
        padding: "0.4rem 0.85rem",
        borderRadius: "var(--radius-full)",
        fontSize: "0.85rem", fontWeight: 600,
        textDecoration: "none",
        transition: "background 0.15s ease, color 0.15s ease",
        background: active ? "rgba(139,92,246,0.18)" : "transparent",
        color: active ? "#c4b5fd" : "rgba(255,255,255,0.55)",
        border: active ? "1px solid rgba(139,92,246,0.25)" : "1px solid transparent",
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          e.currentTarget.style.color = "rgba(255,255,255,0.85)";
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "rgba(255,255,255,0.55)";
        }
      }}
    >
      {children}
      {label}
    </Link>
  );
}
