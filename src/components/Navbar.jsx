import { useNavigate, Link } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("auth_token");
  
  // If not logged in, do not render navbar
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

  return (
    <header className="glass-panel" style={{
      margin: "1rem 1.5rem 0 1.5rem",
      padding: "0.75rem 1.5rem",
      borderRadius: "var(--radius-md)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderWidth: "1px",
      zIndex: 100
    }}>
      {/* Brand Logo */}
      <Link to="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{
          width: "2.25rem",
          height: "2.25rem",
          borderRadius: "var(--radius-sm)",
          background: "var(--gradient-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--shadow-glow)"
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#fff" }}>
            <path d="m12 3-1.912 5.886a1 1 0 0 1-.95.688H3l4.9 3.56a1 1 0 0 1 .36 1.11L6.35 20 12 16.36 17.65 20l-1.91-5.756a1 1 0 0 1 .36-1.11L21 9.574h-6.138a1 1 0 0 1-.95-.688L12 3Z" />
          </svg>
        </div>
        <span style={{
          fontSize: "1.25rem",
          fontWeight: 800,
          fontFamily: "var(--font-heading)",
          background: "linear-gradient(135deg, #fff 0%, #a78bfa 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-0.01em"
        }}>
          Apex Portal
        </span>
      </Link>

      {/* Nav Links & Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <Link to="/dashboard" className="btn btn-secondary" style={{
          padding: "0.45rem 1rem",
          fontSize: "0.875rem",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          gap: "0.35rem",
          textDecoration: "none"
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="7" height="9" x="3" y="3" rx="1" />
            <rect width="7" height="5" x="14" y="3" rx="1" />
            <rect width="7" height="9" x="14" y="12" rx="1" />
            <rect width="7" height="5" x="3" y="16" rx="1" />
          </svg>
          Dashboard
        </Link>
        
        {/* User Card */}
        {user && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            paddingLeft: "1.25rem",
            borderLeft: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            <img 
              src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"} 
              alt={user.name} 
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "var(--radius-full)",
                objectFit: "cover",
                border: "1px solid rgba(255, 255, 255, 0.2)"
              }} 
            />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>{user.name}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1 }}>Administrator</span>
            </div>
            
            <button 
              onClick={handleLogout} 
              className="btn btn-danger" 
              title="Sign Out"
              style={{
                padding: "0.4rem",
                borderRadius: "var(--radius-md)",
                background: "rgba(244, 63, 94, 0.08)",
                border: "1px solid rgba(244, 63, 94, 0.15)",
                cursor: "pointer"
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#f43f5e" }}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
