import { useState, useEffect } from "react";
import api from "../api";

export default function SettingsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ userId: "", name: "", email: "", password: "", role: "teacher" });
  const [formError, setFormError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Grab the current user from localStorage so we know who's logged in
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Load all users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Open the modal for creating a brand new user
  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ userId: "", name: "", email: "", password: "", role: "teacher" });
    setFormError("");
    setShowModal(true);
  };

  // Open the modal pre-filled with existing user data for editing
  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      userId: user.id,
      name: user.name,
      email: user.email || "",
      password: "",  // leave blank — only fill if they want to reset it
      role: user.role
    });
    setFormError("");
    setShowModal(true);
  };

  // Handle the form submission for both create and edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Some basic validation
    if (!formData.name.trim()) {
      setFormError("Name is required.");
      return;
    }

    try {
      if (editingUser) {
        // Editing an existing user — only send fields that actually changed
        const updates = { name: formData.name, email: formData.email, role: formData.role };
        if (formData.password.trim()) {
          updates.password = formData.password; // they typed a new password
        }
        await api.put(`/users/${editingUser.id}`, updates);
      } else {
        // Creating a new user
        if (!formData.userId.trim()) {
          setFormError("User ID is required.");
          return;
        }
        if (!formData.password.trim()) {
          setFormError("Password is required for new users.");
          return;
        }
        await api.post("/users", formData);
      }

      setShowModal(false);
      fetchUsers(); // refresh the list
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";
      setFormError(msg);
    }
  };

  // Delete a user after confirmation
  const handleDelete = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      setDeleteConfirm(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user.");
      setDeleteConfirm(null);
    }
  };

  return (
    <div style={{ padding: "2rem 2.5rem", maxWidth: "1100px", margin: "0 auto", width: "100%" }}>

      {/* Page Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem"
      }}>
        <div>
          <h1 style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            fontFamily: "var(--font-heading)",
            background: "linear-gradient(135deg, #fff 0%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "0.35rem"
          }}>
            ⚙️ Settings
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Manage users, roles, and access to the portal
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal} style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          padding: "0.65rem 1.25rem", fontSize: "0.9rem"
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" x2="19" y1="8" y2="14" />
            <line x1="22" x2="16" y1="11" y2="11" />
          </svg>
          Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="glass-panel" style={{
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        borderWidth: "1px"
      }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            No users found. Click "Add User" to create one.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)"
              }}>
                {["User", "Email", "Role", "Created", "Actions"].map(h => (
                  <th key={h} style={{
                    padding: "0.85rem 1.25rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--text-muted)"
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={user.id} style={{
                  borderBottom: idx < users.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  transition: "background 0.15s ease"
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {/* Avatar + Name + ID */}
                  <td style={{ padding: "0.85rem 1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6c63ff&color=fff&size=100`}
                        alt={user.name}
                        style={{
                          width: "2.25rem", height: "2.25rem",
                          borderRadius: "var(--radius-full)",
                          objectFit: "cover",
                          border: "2px solid rgba(255,255,255,0.1)"
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.9rem" }}>{user.name}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>@{user.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td style={{ padding: "0.85rem 1.25rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    {user.email || "—"}
                  </td>

                  {/* Role Badge */}
                  <td style={{ padding: "0.85rem 1.25rem" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      background: user.role === "admin"
                        ? "rgba(167, 139, 250, 0.15)"
                        : "rgba(56, 189, 248, 0.12)",
                      color: user.role === "admin" ? "#a78bfa" : "#38bdf8",
                      border: `1px solid ${user.role === "admin" ? "rgba(167,139,250,0.25)" : "rgba(56,189,248,0.2)"}`
                    }}>
                      {user.role}
                    </span>
                  </td>

                  {/* Created Date */}
                  <td style={{ padding: "0.85rem 1.25rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    }) : "—"}
                  </td>

                  {/* Action Buttons */}
                  <td style={{ padding: "0.85rem 1.25rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {/* Edit */}
                      <button
                        onClick={() => openEditModal(user)}
                        title="Edit user"
                        style={{
                          background: "rgba(56, 189, 248, 0.08)",
                          border: "1px solid rgba(56, 189, 248, 0.15)",
                          borderRadius: "var(--radius-sm)",
                          padding: "0.4rem",
                          cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          <path d="m15 5 4 4" />
                        </svg>
                      </button>

                      {/* Delete — don't show for the currently logged-in user */}
                      {user.id !== currentUser.id && (
                        deleteConfirm === user.id ? (
                          <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                            <button
                              onClick={() => handleDelete(user.id)}
                              style={{
                                background: "rgba(244, 63, 94, 0.15)",
                                border: "1px solid rgba(244, 63, 94, 0.3)",
                                borderRadius: "var(--radius-sm)",
                                padding: "0.3rem 0.6rem",
                                cursor: "pointer",
                                color: "#f43f5e",
                                fontSize: "0.75rem",
                                fontWeight: 600
                              }}
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              style={{
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "var(--radius-sm)",
                                padding: "0.3rem 0.6rem",
                                cursor: "pointer",
                                color: "var(--text-muted)",
                                fontSize: "0.75rem"
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(user.id)}
                            title="Delete user"
                            style={{
                              background: "rgba(244, 63, 94, 0.08)",
                              border: "1px solid rgba(244, 63, 94, 0.15)",
                              borderRadius: "var(--radius-sm)",
                              padding: "0.4rem",
                              cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.15s ease"
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit User Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000,
          animation: "fadeIn 0.2s ease"
        }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="glass-panel"
            style={{
              width: "100%", maxWidth: "480px",
              borderRadius: "var(--radius-lg)",
              padding: "2rem",
              borderWidth: "1px",
              animation: "slideUp 0.25s cubic-bezier(0.19, 1, 0.22, 1)"
            }}
            onClick={e => e.stopPropagation()} // don't close when clicking inside
          >
            <h2 style={{
              fontSize: "1.25rem", fontWeight: 700,
              fontFamily: "var(--font-heading)",
              color: "#fff", marginBottom: "1.5rem"
            }}>
              {editingUser ? `Edit User — @${editingUser.id}` : "Create New User"}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

              {/* User ID — only for new users */}
              {!editingUser && (
                <div>
                  <label style={labelStyle}>User ID</label>
                  <input
                    type="text"
                    value={formData.userId}
                    onChange={e => setFormData({ ...formData, userId: e.target.value })}
                    placeholder="e.g. john_doe"
                    style={inputStyle}
                  />
                </div>
              )}

              {/* Name */}
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  style={inputStyle}
                />
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  style={inputStyle}
                />
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>
                  {editingUser ? "New Password (leave blank to keep current)" : "Password"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? "••••••••" : "Enter a strong password"}
                  style={inputStyle}
                />
              </div>

              {/* Role Selector */}
              <div>
                <label style={labelStyle}>Role</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  style={inputStyle}
                >
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Error message */}
              {formError && (
                <div style={{
                  padding: "0.65rem 1rem",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(244, 63, 94, 0.1)",
                  border: "1px solid rgba(244, 63, 94, 0.2)",
                  color: "#f43f5e",
                  fontSize: "0.85rem"
                }}>
                  {formError}
                </div>
              )}

              {/* Submit / Cancel */}
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="submit" className="btn btn-primary" style={{
                  flex: 1, padding: "0.65rem", fontSize: "0.9rem"
                }}>
                  {editingUser ? "Save Changes" : "Create User"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  style={{ padding: "0.65rem 1.25rem", fontSize: "0.9rem" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Shared styles for form fields — keeps things consistent and DRY
const labelStyle = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "var(--text-muted)",
  marginBottom: "0.35rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const inputStyle = {
  width: "100%",
  padding: "0.65rem 0.85rem",
  borderRadius: "var(--radius-sm)",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  fontSize: "0.9rem",
  outline: "none",
  transition: "border-color 0.15s ease",
  boxSizing: "border-box"
};
