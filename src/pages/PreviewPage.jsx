import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api";

export default function PreviewPage() {
  const navigate = useNavigate();
  const { testId } = useParams();

  const [test, setTest] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subTopics, setSubTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  // Fetch test parameters, subjects, topics, and sub-topics on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [testRes, subjectsRes, topicsRes, subsRes] = await Promise.all([
          api.get(`/tests/${testId}`),
          api.get("/subjects"),
          api.get("/topics/subject/math"), // we can fetch all reference data or just filter
          api.post("/sub-topics/multi-topics", { topicIds: [] }) // we can fetch active references
        ]);

        setTest(testRes.data.data);
        setSubjects(subjectsRes.data.data);
        
        // Fetch topics and sub-topics based on test subject to translate IDs
        const subId = testRes.data.data.subject_id;
        if (subId) {
          const tRes = await api.get(`/topics/subject/${subId}`);
          setTopics(tRes.data.data);
          
          const tIds = testRes.data.data.topic_ids || [];
          if (tIds.length) {
            const sRes = await api.post("/sub-topics/multi-topics", { topicIds: tIds });
            setSubTopics(sRes.data.data);
          }
        }
      } catch (err) {
        setApiError("Failed to fetch assessment preview data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [testId]);

  const handlePublish = async () => {
    setPublishing(true);
    setApiError("");
    try {
      await api.put(`/tests/${testId}`, { status: "live" });
      setPublishedSuccess(true);
      
      // Redirect to dashboard after showing success screen
      setTimeout(() => {
        navigate("/dashboard");
      }, 1800);
    } catch (err) {
      setApiError("Failed to publish the test. Please try again.");
      setPublishing(false);
    }
  };

  const getSubjectName = (id) => subjects.find(s => s.id === id)?.name || id;
  const getTopicNames = () => {
    if (!test?.topic_ids) return "";
    return test.topic_ids.map(id => topics.find(t => t.id === id)?.name || id).join(", ");
  };
  const getSubNames = () => {
    if (!test?.sub_topic_ids || test.sub_topic_ids.length === 0) return "None selected";
    return test.sub_topic_ids.map(id => subTopics.find(s => s.id === id)?.name || id).join(", ");
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: "900px", position: "relative" }}>
      {/* Breadcrumb navigation */}
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to={`/tests/${testId}/questions`} style={{ color: "var(--text-secondary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.9rem" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Questions Editor
        </Link>
        <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Step 3 of 3: Verification & Publish
        </span>
      </div>

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

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem" }} className="glass-panel">
          <div className="spinner" style={{
            width: "2.5rem",
            height: "2.5rem",
            border: "3px solid rgba(255,255,255,0.05)",
            borderTopColor: "var(--border-focus)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 1rem auto"
          }} />
          <p>Compiling preview packet...</p>
        </div>
      ) : test && (
        <>
          {/* Main Layout Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1.25fr 2fr", gap: "1.5rem", alignItems: "flex-start" }}>
            
            {/* LEFT COLUMN: Test Metadata Summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div className="glass-panel" style={{ padding: "1.5rem" }}>
                <h3 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", marginBottom: "1.25rem" }}>
                  Parameters Summary
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.9rem" }}>
                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block" }}>Test Name</span>
                    <strong style={{ color: "#fff", fontSize: "1.1rem" }}>{test.name}</strong>
                  </div>

                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block" }}>Subject Category</span>
                    <strong style={{ color: "#fff" }}>{getSubjectName(test.subject_id)}</strong>
                  </div>

                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block" }}>Topics Syllabus</span>
                    <span style={{ color: "#fff", fontWeight: 500 }}>{getTopicNames()}</span>
                  </div>

                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block" }}>Sub-Topics scope</span>
                    <span style={{ color: "#fff", fontWeight: 500 }}>{getSubNames()}</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.75rem" }}>
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block" }}>Test Type</span>
                      <span className="badge badge-difficulty-easy" style={{ marginTop: "0.25rem", textTransform: "uppercase" }}>{test.type}</span>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block" }}>Difficulty</span>
                      <span className={`badge badge-difficulty-${test.difficulty}`} style={{ marginTop: "0.25rem", textTransform: "uppercase" }}>{test.difficulty}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scoring schema card */}
              <div className="glass-panel" style={{ padding: "1.5rem", background: "rgba(255,255,255,0.01)" }}>
                <h3 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", marginBottom: "1.25rem" }}>
                  Scoring & Limits
                </h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem" }}>
                  <div className="flex-between">
                    <span style={{ color: "var(--text-secondary)" }}>Correct Mark allocation:</span>
                    <strong style={{ color: "var(--accent-emerald)" }}>+{test.correct_marks}</strong>
                  </div>
                  <div className="flex-between">
                    <span style={{ color: "var(--text-secondary)" }}>Wrong Answer Penalty:</span>
                    <strong style={{ color: "var(--accent-rose)" }}>{test.wrong_marks}</strong>
                  </div>
                  <div className="flex-between">
                    <span style={{ color: "var(--text-secondary)" }}>Unattempted Penalty:</span>
                    <strong style={{ color: "var(--text-muted)" }}>{test.unattempt_marks}</strong>
                  </div>
                  <div className="flex-between" style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Allocated Time:</span>
                    <strong style={{ color: "#fff" }}>{test.total_time} minutes</strong>
                  </div>
                  <div className="flex-between">
                    <span style={{ color: "var(--text-secondary)" }}>Total Marks:</span>
                    <strong style={{ color: "#fff" }}>{test.total_marks} Marks</strong>
                  </div>
                  <div className="flex-between">
                    <span style={{ color: "var(--text-secondary)" }}>Question Target:</span>
                    <strong style={{ color: "#fff" }}>{test.total_questions} Questions</strong>
                  </div>
                </div>
              </div>

              {/* Action Board */}
              <div className="glass-panel" style={{ padding: "1.25rem", border: "1px solid rgba(139, 92, 246, 0.25)", background: "rgba(139, 92, 246, 0.02)" }}>
                <button
                  onClick={handlePublish}
                  className="btn btn-primary"
                  disabled={publishing || test.questions?.length === 0}
                  style={{ width: "100%", padding: "0.85rem", marginBottom: "0.75rem" }}
                >
                  {publishing ? "Publishing..." : "Publish Assessment Portal"}
                </button>
                
                <Link to={`/tests/${testId}/edit`} className="btn btn-secondary" style={{ width: "100%", padding: "0.85rem", textDecoration: "none" }}>
                  Modify Settings
                </Link>

                {test.questions?.length === 0 && (
                  <span className="field-error" style={{ textAlign: "center", marginTop: "0.5rem" }}>
                    * You must add at least 1 question to publish.
                  </span>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Questions Sheet list */}
            <div className="glass-panel" style={{ padding: "2rem" }}>
              <h3 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>
                Active Questions Packet ({test.questions?.length || 0} of {test.total_questions} expected)
              </h3>

              {!test.questions || test.questions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-muted)" }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: "1rem", opacity: 0.6 }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" x2="12" y1="9" y2="13" />
                    <line x1="12" x2="12.01" y1="17" y2="17" />
                  </svg>
                  <p style={{ fontWeight: 600 }}>No Questions Found</p>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    Please go back to the Questions Editor step to populate the exam.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {test.questions.map((q, idx) => (
                    <div key={q.id || idx} style={{
                      paddingBottom: "1.5rem",
                      borderBottom: idx === test.questions.length - 1 ? "none" : "1px solid var(--border-color)"
                    }}>
                      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
                        <span style={{
                          display: "inline-flex",
                          width: "1.75rem",
                          height: "1.75rem",
                          borderRadius: "50%",
                          background: "rgba(139, 92, 246, 0.15)",
                          color: "#c084fc",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          flexShrink: 0
                        }}>
                          {idx + 1}
                        </span>
                        
                        <div style={{ textAlign: "left" }}>
                          <p style={{ color: "#fff", fontWeight: 600, fontSize: "1rem", lineHeight: 1.4, marginBottom: "0.75rem" }}>
                            {q.question}
                          </p>

                          {/* Options grid */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.75rem" }}>
                            {q.options.map((opt, oIdx) => {
                              const isCorrect = q.correct_options.includes(oIdx);
                              return (
                                <div key={oIdx} style={{
                                  padding: "0.5rem 0.75rem",
                                  borderRadius: "var(--radius-sm)",
                                  background: isCorrect ? "rgba(16, 185, 129, 0.08)" : "rgba(255, 255, 255, 0.01)",
                                  border: isCorrect ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(255, 255, 255, 0.03)",
                                  fontSize: "0.875rem",
                                  color: isCorrect ? "#a7f3d0" : "var(--text-secondary)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem"
                                }}>
                                  <span style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    background: isCorrect ? "var(--accent-emerald)" : "var(--text-muted)"
                                  }} />
                                  <span>{opt}</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation */}
                          {q.explanation && (
                            <div style={{
                              background: "rgba(255, 255, 255, 0.01)",
                              padding: "0.6rem 0.85rem",
                              borderRadius: "var(--radius-sm)",
                              fontSize: "0.8rem",
                              color: "var(--text-muted)",
                              borderLeft: "2.5px solid var(--accent-purple)"
                            }}>
                              <strong>Explanation: </strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </>
      )}

      {/* Published Splash Overlay Screen */}
      {publishedSuccess && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(10, 11, 16, 0.95)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          backdropFilter: "blur(20px)"
        }} className="animate-fade-in">
          <div className="glass-panel" style={{
            padding: "3rem",
            maxWidth: "460px",
            textAlign: "center",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            boxShadow: "0 0 50px rgba(16, 185, 129, 0.2)"
          }}>
            <div style={{
              width: "4.5rem",
              height: "4.5rem",
              borderRadius: "50%",
              background: "var(--gradient-emerald)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem auto",
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)"
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#fff" }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            
            <h2 style={{ fontSize: "1.75rem", marginBottom: "0.5rem", background: "linear-gradient(to right, #fff, #6ee7b7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Assessment Published!
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              The portal is now active. Students can begin taking this assessment immediately.
            </p>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "1.5rem" }}>
              Redirecting you to dashboard table...
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
