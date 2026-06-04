import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [apiError, setApiError] = useState("");

  // Fetch tests and subjects on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [testsRes, subjectsRes] = await Promise.all([
          api.get("/tests"),
          api.get("/subjects")
        ]);
        setTests(testsRes.data.data);
        setSubjects(subjectsRes.data.data);
      } catch (err) {
        setApiError("Failed to fetch dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the test "${name}"?`)) {
      return;
    }
    try {
      await api.delete(`/tests/${id}`);
      setTests(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert("Failed to delete the test. Please try again.");
    }
  };

  // Compute stats
  const totalTests = tests.length;
  const liveTests = tests.filter(t => t.status === "live").length;
  const draftTests = tests.filter(t => t.status !== "live").length;
  const totalQuestionsCount = tests.reduce((sum, t) => sum + (Number(t.total_questions) || 0), 0);

  // Filter tests
  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = subjectFilter === "" || test.subject_id === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : subjectId;
  };

  return (
    <div className="container animate-fade-in">
      <div className="flex-between" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 style={{ margin: 0 }}>Management Dashboard</h1>
          <p>Create, manage, and publish academic assessments</p>
        </div>
        <Link to="/tests/create" className="btn btn-primary" style={{ textDecoration: "none" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" x2="12" y1="5" y2="19" />
            <line x1="5" x2="19" y1="12" y2="12" />
          </svg>
          Create New Test
        </Link>
      </div>

      {apiError && (
        <div className="alert-error animate-fade-in" style={{ marginBottom: "1.5rem" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          <span>{apiError}</span>
        </div>
      )}

      {/* Stats Section */}
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <span className="stat-title">Total Tests</span>
          <span className="stat-value">{loading ? "..." : totalTests}</span>
        </div>
        <div className="glass-panel stat-card stat-card-emerald">
          <span className="stat-title">Live & Published</span>
          <span className="stat-value">{loading ? "..." : liveTests}</span>
        </div>
        <div className="glass-panel stat-card stat-card-cyan">
          <span className="stat-title">Draft Mode</span>
          <span className="stat-value">{loading ? "..." : draftTests}</span>
        </div>
        <div className="glass-panel stat-card">
          <span className="stat-title">Total Questions</span>
          <span className="stat-value">{loading ? "..." : totalQuestionsCount}</span>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="glass-panel" style={{ padding: "1.5rem", border: "1px solid var(--border-color)" }}>
        
        {/* Filters Header */}
        <div style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap"
        }}>
          <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search tests by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: "2.5rem" }}
            />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)"
            }}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          
          <div style={{ width: "200px" }}>
            <select
              className="form-select"
              value={subjectFilter}
              onChange={e => setSubjectFilter(e.target.value)}
            >
              <option value="">All Subjects</option>
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table representation */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div className="spinner" style={{
              width: "2.5rem",
              height: "2.5rem",
              border: "3px solid rgba(255,255,255,0.05)",
              borderTopColor: "var(--border-focus)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 1rem auto"
            }} />
            <p>Loading assessments database...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="9" x2="15" y1="15" y2="15" />
              <line x1="9" x2="13" y1="11" y2="11" />
            </svg>
            <p style={{ fontWeight: 500 }}>No tests found</p>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Try adjusting your search query or subject filters.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Subject</th>
                  <th>Details</th>
                  <th>Difficulty</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTests.map(test => {
                  const isLive = test.status === "live";
                  return (
                    <tr key={test.id}>
                      <td style={{ fontWeight: 600, color: "#fff" }}>{test.name}</td>
                      <td>{getSubjectName(test.subject_id)}</td>
                      <td>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                          <span>{test.total_questions} Questions</span>
                          <span style={{ margin: "0 0.5rem", color: "var(--text-muted)" }}>•</span>
                          <span>{test.total_time} Mins</span>
                          <span style={{ margin: "0 0.5rem", color: "var(--text-muted)" }}>•</span>
                          <span>{test.total_marks} Marks</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-difficulty-${test.difficulty || "medium"}`}>
                          {test.difficulty || "medium"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isLive ? "badge-live" : "badge-draft"}`}>
                          {isLive ? "Live" : "Draft"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          {/* View/Preview Button */}
                          <button
                            onClick={() => navigate(`/tests/${test.id}/preview`)}
                            className="btn btn-secondary"
                            title="Preview Test"
                            style={{ padding: "0.45rem", borderRadius: "var(--radius-sm)" }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>

                           {/* Take Demo Exam Link (Opens in New Tab) */}
                          <Link
                            to={`/tests/${test.id}/demo`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                            title="Take Demo Exam"
                            style={{
                              padding: "0.45rem",
                              borderRadius: "var(--radius-sm)",
                              color: "var(--accent-cyan)",
                              borderColor: "rgba(6, 182, 212, 0.3)",
                              background: "rgba(6, 182, 212, 0.05)",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          </Link>

                          {/* Edit Details Button */}
                          <button
                            onClick={() => navigate(`/tests/${test.id}/edit`)}
                            className="btn btn-secondary"
                            title="Edit Test Settings"
                            style={{ padding: "0.45rem", borderRadius: "var(--radius-sm)" }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                          </button>

                          {/* Add Questions Link Button */}
                          <button
                            onClick={() => navigate(`/tests/${test.id}/questions`)}
                            className="btn btn-secondary"
                            title="Manage Questions"
                            style={{
                              padding: "0.45rem",
                              borderRadius: "var(--radius-sm)",
                              color: "var(--accent-purple)",
                              borderColor: "rgba(139, 92, 246, 0.3)",
                              background: "rgba(139, 92, 246, 0.05)"
                            }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12h14" />
                              <path d="M12 5v14" />
                            </svg>
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(test.id, test.name)}
                            className="btn btn-danger"
                            title="Delete Test"
                            style={{ padding: "0.45rem", borderRadius: "var(--radius-sm)" }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
