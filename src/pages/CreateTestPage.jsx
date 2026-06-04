import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api";

export default function CreateTestPage() {
  const navigate = useNavigate();
  const { testId } = useParams();
  const isEdit = Boolean(testId);

  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subTopics, setSubTopics] = useState([]);

  // Form states
  const [form, setForm] = useState({
    name: "",
    type: "practice",
    difficulty: "medium",
    correctMarks: 4,
    wrongMarks: -1,
    unattemptMarks: 0,
    totalTime: 60,
    totalMarks: 200,
    totalQuestions: 50,
  });
  
  const [subject, setSubject] = useState("");
  const [selTopics, setSelTopics] = useState([]);
  const [selSubs, setSelSubs] = useState([]);
  
  // Temporary states to preserve edit-mode lists during cascading loads
  const [tempTopics, setTempTopics] = useState([]);
  const [tempSubs, setTempSubs] = useState([]);

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load subjects on mount
  useEffect(() => {
    setLoading(true);
    api.get("/subjects")
      .then(r => setSubjects(r.data.data))
      .catch(err => setErrors(p => ({ ...p, api: "Failed to load subjects." })))
      .finally(() => setLoading(false));
  }, []);

  // Load edit mode test data
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    api.get(`/tests/${testId}`)
      .then(r => {
        const t = r.data.data;
        setForm({
          name: t.name || "",
          type: t.type || "practice",
          difficulty: t.difficulty || "medium",
          correctMarks: t.correct_marks ?? 4,
          wrongMarks: t.wrong_marks ?? -1,
          unattemptMarks: t.unattempt_marks ?? 0,
          totalTime: t.total_time ?? 60,
          totalMarks: t.total_marks ?? 200,
          totalQuestions: t.total_questions ?? 50,
        });
        setSubject(t.subject_id || "");
        setTempTopics(t.topic_ids || []);
        setTempSubs(t.sub_topic_ids || []);
      })
      .catch(err => setErrors(p => ({ ...p, api: "Failed to load test parameters." })))
      .finally(() => setLoading(false));
  }, [testId, isEdit]);

  // Load topics when subject changes
  useEffect(() => {
    if (!subject) {
      setTopics([]);
      setSelTopics([]);
      return;
    }
    // Clear only if this is a fresh user interaction
    if (!tempTopics.length) {
      setSelTopics([]);
      setSelSubs([]);
    }
    
    api.get(`/topics/subject/${subject}`)
      .then(r => {
        setTopics(r.data.data);
        if (tempTopics.length) {
          setSelTopics(tempTopics);
          setTempTopics([]); // Consumed
        }
      });
  }, [subject]);

  // Load sub-topics when topics change
  useEffect(() => {
    if (!selTopics.length) {
      setSubTopics([]);
      setSelSubs([]);
      return;
    }
    if (!tempSubs.length) {
      setSelSubs([]);
    }
    
    api.post("/sub-topics/multi-topics", { topicIds: selTopics })
      .then(r => {
        setSubTopics(r.data.data);
        if (tempSubs.length) {
          setSelSubs(tempSubs);
          setTempSubs([]); // Consumed
        }
      });
  }, [selTopics]);

  // Multi-select management helper
  const addPill = (id, currentList, setter) => {
    if (id && !currentList.includes(id)) {
      setter(prev => [...prev, id]);
    }
  };

  const removePill = (id, setter) => {
    setter(prev => prev.filter(x => x !== id));
  };

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Test name is required";
    if (!subject) e.subject = "Subject selection is required";
    if (!selTopics.length) e.topics = "Select at least one topic";
    if (isNaN(Number(form.correctMarks)) || form.correctMarks === "") e.correctMarks = "Required";
    if (isNaN(Number(form.wrongMarks)) || form.wrongMarks === "") e.wrongMarks = "Required";
    if (isNaN(Number(form.unattemptMarks)) || form.unattemptMarks === "") e.unattemptMarks = "Required";
    if (!form.totalTime || form.totalTime <= 0) e.totalTime = "Must be positive";
    if (!form.totalMarks || form.totalMarks <= 0) e.totalMarks = "Must be positive";
    if (!form.totalQuestions || form.totalQuestions <= 0) e.totalQuestions = "Must be positive";
    return e;
  }

  async function handleSubmit(goNext) {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        subject_id: subject,
        topic_ids: selTopics,
        sub_topic_ids: selSubs,
        correct_marks: Number(form.correctMarks),
        wrong_marks: Number(form.wrongMarks),
        unattempt_marks: Number(form.unattemptMarks),
        difficulty: form.difficulty,
        total_time: Number(form.totalTime),
        total_marks: Number(form.totalMarks),
        total_questions: Number(form.totalQuestions),
        status: isEdit ? undefined : null // null denotes draft, live is published
      };

      let activeId = testId;
      if (isEdit) {
        await api.put(`/tests/${testId}`, payload);
      } else {
        const res = await api.post("/tests", payload);
        activeId = res.data.data.id;
      }

      if (goNext) {
        navigate(`/tests/${activeId}/questions`);
      } else {
        alert(isEdit ? "Test updated successfully!" : "Draft test saved successfully!");
        navigate("/dashboard");
      }
    } catch (err) {
      setErrors(p => ({ ...p, api: "Failed to save test parameters. Check input values." }));
    } finally {
      setSaving(false);
    }
  }

  // Lookups for readable text on tags
  const getTopicName = (id) => topics.find(t => t.id === id)?.name || id;
  const getSubName = (id) => subTopics.find(s => s.id === id)?.name || id;

  return (
    <div className="container animate-fade-in" style={{ maxWidth: "800px" }}>
      {/* Navigation Header */}
      <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Link to="/dashboard" style={{ color: "var(--text-secondary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.9rem" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" x2="5" y1="12" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ margin: 0 }}>{isEdit ? "Edit Assessment Parameters" : "Configure New Test"}</h1>
        <p>Set up the metadata, syllabus contents, and scoring details for this test</p>
      </div>

      {errors.api && (
        <div className="alert-error animate-fade-in">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          <span>{errors.api}</span>
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
          <p>Loading configurations...</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: "2.5rem 2rem" }}>
          {/* Section 1: Basic Information */}
          <h3 style={{ fontFamily: "var(--font-heading)", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>
            1. Core Parameters
          </h3>
          
          <div className="form-group">
            <label className="form-label">Test Name *</label>
            <input
              type="text"
              className={`form-input ${errors.name ? "input-error" : ""}`}
              placeholder="e.g. Calculus Midterm Examination"
              value={form.name}
              onChange={e => {
                setForm(p => ({ ...p, name: e.target.value }));
                if (errors.name) setErrors(p => ({ ...p, name: "" }));
              }}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Test Type</label>
              <select
                className="form-select"
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              >
                <option value="practice">Practice Mode</option>
                <option value="mock">Mock Test</option>
                <option value="live">Live Examination</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Difficulty Level</label>
              <select
                className="form-select"
                value={form.difficulty}
                onChange={e => setForm(p => ({ ...p, difficulty: e.target.value }))}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Section 2: Syllabus Scope (Cascading Dropdowns) */}
          <h3 style={{ fontFamily: "var(--font-heading)", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", marginTop: "2.5rem", marginBottom: "1.5rem" }}>
            2. Scope & Syllabus
          </h3>

          <div className="form-group">
            <label className="form-label">Subject *</label>
            <select
              className={`form-select ${errors.subject ? "input-error" : ""}`}
              value={subject}
              onChange={e => {
                setSubject(e.target.value);
                if (errors.subject) setErrors(p => ({ ...p, subject: "" }));
              }}
            >
              <option value="">Select subject...</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.subject && <span className="field-error">{errors.subject}</span>}
          </div>

          {/* Topics Multi-Select */}
          <div className="form-group" style={{ opacity: subject ? 1 : 0.5, pointerEvents: subject ? "auto" : "none" }}>
            <label className="form-label">Add Topics *</label>
            <select
              className={`form-select ${errors.topics ? "input-error" : ""}`}
              value=""
              onChange={e => {
                addPill(e.target.value, selTopics, setSelTopics);
                if (errors.topics) setErrors(p => ({ ...p, topics: "" }));
              }}
            >
              <option value="">Choose topics to add...</option>
              {topics.map(t => (
                <option key={t.id} value={t.id} disabled={selTopics.includes(t.id)}>
                  {t.name}
                </option>
              ))}
            </select>
            {errors.topics && <span className="field-error">{errors.topics}</span>}
            
            {/* Topic Pills */}
            <div className="pills-container">
              {selTopics.map(id => (
                <span className="pill animate-fade-in" key={id}>
                  {getTopicName(id)}
                  <button type="button" className="pill-delete" onClick={() => removePill(id, setSelTopics)}>×</button>
                </span>
              ))}
              {selTopics.length === 0 && <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>No topics selected</span>}
            </div>
          </div>

          {/* Sub-Topics Multi-Select */}
          <div className="form-group" style={{ opacity: selTopics.length ? 1 : 0.5, pointerEvents: selTopics.length ? "auto" : "none" }}>
            <label className="form-label">Add Sub-Topics (Optional)</label>
            <select
              className="form-select"
              value=""
              onChange={e => addPill(e.target.value, selSubs, setSelSubs)}
            >
              <option value="">Choose sub-topics to add...</option>
              {subTopics.map(s => (
                <option key={s.id} value={s.id} disabled={selSubs.includes(s.id)}>
                  {s.name} ({getTopicName(s.topic_id)})
                </option>
              ))}
            </select>

            {/* Sub-Topic Pills */}
            <div className="pills-container">
              {selSubs.map(id => (
                <span className="pill animate-fade-in" key={id} style={{ background: "rgba(6, 182, 212, 0.12)", borderColor: "rgba(6, 182, 212, 0.3)", color: "#cffafe" }}>
                  {getSubName(id)}
                  <button type="button" className="pill-delete" style={{ color: "#22d3ee" }} onClick={() => removePill(id, setSelSubs)}>×</button>
                </span>
              ))}
              {selSubs.length === 0 && <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>No sub-topics selected</span>}
            </div>
          </div>

          {/* Section 3: Scoring Schema & Performance parameters */}
          <h3 style={{ fontFamily: "var(--font-heading)", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", marginTop: "2.5rem", marginBottom: "1.5rem" }}>
            3. Scoring & Time Bounds
          </h3>

          <div className="grid-cols-3">
            <div className="form-group">
              <label className="form-label">Correct Option Marks *</label>
              <input
                type="number"
                className={`form-input ${errors.correctMarks ? "input-error" : ""}`}
                value={form.correctMarks}
                onChange={e => setForm(p => ({ ...p, correctMarks: e.target.value === "" ? "" : Number(e.target.value) }))}
              />
              {errors.correctMarks && <span className="field-error">{errors.correctMarks}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Negative Marks *</label>
              <input
                type="number"
                className={`form-input ${errors.wrongMarks ? "input-error" : ""}`}
                value={form.wrongMarks}
                onChange={e => setForm(p => ({ ...p, wrongMarks: e.target.value === "" ? "" : Number(e.target.value) }))}
              />
              {errors.wrongMarks && <span className="field-error">{errors.wrongMarks}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Unattempted Penalty *</label>
              <input
                type="number"
                className={`form-input ${errors.unattemptMarks ? "input-error" : ""}`}
                value={form.unattemptMarks}
                onChange={e => setForm(p => ({ ...p, unattemptMarks: e.target.value === "" ? "" : Number(e.target.value) }))}
              />
              {errors.unattemptMarks && <span className="field-error">{errors.unattemptMarks}</span>}
            </div>
          </div>

          <div className="grid-cols-3">
            <div className="form-group">
              <label className="form-label">Total Time (Minutes) *</label>
              <input
                type="number"
                min="1"
                className={`form-input ${errors.totalTime ? "input-error" : ""}`}
                value={form.totalTime}
                onChange={e => setForm(p => ({ ...p, totalTime: e.target.value === "" ? "" : Number(e.target.value) }))}
              />
              {errors.totalTime && <span className="field-error">{errors.totalTime}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Maximum Marks *</label>
              <input
                type="number"
                min="1"
                className={`form-input ${errors.totalMarks ? "input-error" : ""}`}
                value={form.totalMarks}
                onChange={e => setForm(p => ({ ...p, totalMarks: e.target.value === "" ? "" : Number(e.target.value) }))}
              />
              {errors.totalMarks && <span className="field-error">{errors.totalMarks}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Allocated Questions *</label>
              <input
                type="number"
                min="1"
                className={`form-input ${errors.totalQuestions ? "input-error" : ""}`}
                value={form.totalQuestions}
                onChange={e => setForm(p => ({ ...p, totalQuestions: e.target.value === "" ? "" : Number(e.target.value) }))}
              />
              {errors.totalQuestions && <span className="field-error">{errors.totalQuestions}</span>}
            </div>
          </div>

          {/* Action Row */}
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "1rem",
            marginTop: "3rem",
            borderTop: "1px solid var(--border-color)",
            paddingTop: "2rem"
          }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleSubmit(false)}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save as Draft"}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleSubmit(true)}
              disabled={saving}
            >
              {saving ? "Processing..." : "Next: Add Questions →"}
            </button>
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
