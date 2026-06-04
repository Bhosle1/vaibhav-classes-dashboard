import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api";

export default function AddQuestionsPage() {
  const navigate = useNavigate();
  const { testId } = useParams();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  // Questions state
  const [questions, setQuestions] = useState([]);
  
  // New Question Form state
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("single");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswers, setCorrectAnswers] = useState([]); // indices of correct options
  const [explanation, setExplanation] = useState("");
  const [formError, setFormError] = useState("");

  // Fetch test details on mount
  useEffect(() => {
    setLoading(true);
    api.get(`/tests/${testId}`)
      .then(res => {
        setTest(res.data.data);
        // Load pre-existing questions if any
        if (res.data.data.questions) {
          setQuestions(res.data.data.questions);
        }
      })
      .catch(err => {
        setApiError("Failed to load test details. Please verify the URL.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [testId]);

  // Adjust correct options list if type changes
  useEffect(() => {
    setCorrectAnswers([]);
  }, [questionType]);

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleCorrectToggle = (index) => {
    if (questionType === "single") {
      setCorrectAnswers([index]);
    } else {
      setCorrectAnswers(prev => {
        if (prev.includes(index)) {
          return prev.filter(i => i !== index);
        } else {
          return [...prev, index];
        }
      });
    }
  };

  const addOptionField = () => {
    if (options.length < 6) {
      setOptions(prev => [...prev, ""]);
    }
  };

  const removeOptionField = (index) => {
    if (options.length > 2) {
      setOptions(prev => prev.filter((_, i) => i !== index));
      setCorrectAnswers(prev => 
        prev
          .filter(i => i !== index)
          .map(i => (i > index ? i - 1 : i))
      );
    }
  };

  const handleAddQuestionLocal = (e) => {
    e.preventDefault();
    setFormError("");

    // Validation
    if (!questionText.trim()) {
      setFormError("Question prompt text is required.");
      return;
    }

    const filledOptions = options.map(o => o.trim()).filter(Boolean);
    if (filledOptions.length < 2) {
      setFormError("Please define at least two valid options.");
      return;
    }

    // Check if any of the filled options matches the original index of correctAnswers
    const validCorrectAnswers = correctAnswers.filter(idx => 
      idx < options.length && options[idx].trim() !== ""
    );

    if (validCorrectAnswers.length === 0) {
      setFormError("Please select at least one correct option answer.");
      return;
    }

    // Map correct answers to the indices in the filtered array
    const mappedCorrectOptions = [];
    filledOptions.forEach((val, fIdx) => {
      // Find matching index in original list
      const originalIdx = options.findIndex((opt, oIdx) => opt.trim() === val && oIdx < options.length);
      if (correctAnswers.includes(originalIdx)) {
        mappedCorrectOptions.push(fIdx);
      }
    });

    const newQuestion = {
      test_id: testId,
      question: questionText.trim(),
      type: questionType,
      options: filledOptions,
      correct_options: mappedCorrectOptions,
      explanation: explanation.trim()
    };

    setQuestions(prev => [...prev, newQuestion]);

    // Reset Form
    setQuestionText("");
    setQuestionType("single");
    setOptions(["", "", "", ""]);
    setCorrectAnswers([]);
    setExplanation("");
  };

  const removeQuestionLocal = (index) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleBulkSave = async () => {
    if (questions.length === 0) {
      alert("Please add at least one question before saving.");
      return;
    }

    setSaving(true);
    setApiError("");
    try {
      // 1. Bulk save questions
      await api.post("/questions/bulk", { questions });
      
      // 2. Link them to the test & update its question count dynamically
      await api.put(`/tests/${testId}`, {
        total_questions: questions.length
      });

      // 3. Redirect to final Preview & Publish page
      navigate(`/tests/${testId}/preview`);
    } catch (err) {
      setApiError("Failed to save questions database. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const targetCount = test?.total_questions || 0;
  const progressPercent = Math.min(100, (questions.length / (targetCount || 1)) * 100);

  return (
    <div className="container animate-fade-in">
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/dashboard" style={{ color: "var(--text-secondary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.9rem" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Dashboard
        </Link>
        <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Step 2 of 3: Question Setup
        </span>
      </div>

      {/* Header and Progress */}
      {test && (
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ margin: 0 }}>Add Questions: {test.name}</h1>
          <p style={{ marginBottom: "1rem" }}>
            Create questions for the {getSubjectName(test.subject_id)} exam. Recommended target: <strong>{targetCount} questions</strong>.
          </p>

          {/* Progress Bar container */}
          <div className="glass-panel" style={{
            padding: "1rem 1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            background: "rgba(255,255,255,0.02)",
            borderWidth: "1px"
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
                <span>Questions Created Checklist</span>
                <span style={{ color: questions.length >= targetCount ? "var(--accent-emerald)" : "var(--accent-purple)" }}>
                  {questions.length} / {targetCount} ({Math.round(progressPercent)}%)
                </span>
              </div>
              
              {/* Actual bar */}
              <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden" }}>
                <div style={{
                  width: `${progressPercent}%`,
                  height: "100%",
                  background: questions.length >= targetCount ? "var(--gradient-emerald)" : "var(--gradient-primary)",
                  borderRadius: "99px",
                  transition: "width 0.4s ease-out"
                }} />
              </div>
            </div>

            <button
              onClick={handleBulkSave}
              className="btn btn-primary"
              disabled={questions.length === 0 || saving}
              style={{ flexShrink: 0, padding: "0.6rem 1.25rem", fontSize: "0.9rem" }}
            >
              {saving ? "Saving..." : "Save & Continue →"}
            </button>
          </div>
        </div>
      )}

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
          <p>Initializing exam sheet...</p>
        </div>
      ) : (
        <div className="grid-cols-2" style={{ alignItems: "flex-start", gap: "1.5rem" }}>
          
          {/* LEFT: Add Question Form */}
          <form className="glass-panel" onSubmit={handleAddQuestionLocal} style={{ padding: "2rem" }}>
            <h3 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>
              Question Constructor
            </h3>

            {formError && (
              <div className="alert-error animate-fade-in" style={{ padding: "0.6rem 0.85rem", fontSize: "0.85rem", marginBottom: "1rem" }}>
                <span>{formError}</span>
              </div>
            )}

            {/* Question Text */}
            <div className="form-group">
              <label className="form-label">Question Prompt *</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Type question query prompt here..."
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
              />
            </div>

            {/* Question Type */}
            <div className="form-group">
              <label className="form-label">Question Type</label>
              <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.25rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="questionType"
                    value="single"
                    checked={questionType === "single"}
                    onChange={() => setQuestionType("single")}
                    style={{ accentColor: "var(--accent-purple)" }}
                  />
                  Single Correct Option
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="questionType"
                    value="multiple"
                    checked={questionType === "multiple"}
                    onChange={() => setQuestionType("multiple")}
                    style={{ accentColor: "var(--accent-purple)" }}
                  />
                  Multiple Correct Options
                </label>
              </div>
            </div>

            {/* Options Builder */}
            <div className="form-group" style={{ marginTop: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label className="form-label" style={{ margin: 0 }}>Options List & Key answers *</label>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={addOptionField}
                  disabled={options.length >= 6}
                  style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", borderRadius: "var(--radius-sm)" }}
                >
                  + Add Option
                </button>
              </div>

              {options.map((opt, index) => {
                const isCorrect = correctAnswers.includes(index);
                return (
                  <div key={index} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.75rem"
                  }}>
                    {/* Checkbox or Radio selector */}
                    <input
                      type={questionType === "single" ? "radio" : "checkbox"}
                      name="correctAnswerSelect"
                      checked={isCorrect}
                      onChange={() => handleCorrectToggle(index)}
                      title="Toggle correct state"
                      style={{
                        width: "1.1rem",
                        height: "1.1rem",
                        cursor: "pointer",
                        accentColor: isCorrect ? "var(--accent-emerald)" : "var(--accent-purple)"
                      }}
                    />

                    {/* Option Text Input */}
                    <input
                      type="text"
                      className="form-input"
                      placeholder={`Option ${index + 1}`}
                      value={opt}
                      onChange={e => handleOptionChange(index, e.target.value)}
                      style={{ flex: 1, padding: "0.6rem 0.85rem", fontSize: "0.9rem" }}
                    />

                    {/* Remove Option Button */}
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeOptionField(index)}
                      disabled={options.length <= 2}
                      style={{ padding: "0.45rem", borderRadius: "var(--radius-sm)" }}
                      title="Remove option"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Explanation */}
            <div className="form-group" style={{ marginTop: "1.5rem" }}>
              <label className="form-label">Solution Explanation (Optional)</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Describe how to arrive at the correct response..."
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
              />
            </div>

            {/* Add button */}
            <button
              type="submit"
              className="btn btn-secondary"
              style={{
                width: "100%",
                padding: "0.75rem",
                marginTop: "1.25rem",
                borderColor: "rgba(168, 85, 247, 0.4)",
                background: "rgba(168, 85, 247, 0.05)",
                color: "#ddd6fe"
              }}
            >
              + Add to Question Sheet
            </button>
          </form>

          {/* RIGHT: Live Preview list */}
          <div className="glass-panel" style={{ padding: "2rem", minHeight: "500px", maxHeight: "80vh", overflowY: "auto" }}>
            <h3 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>
              Question Sheet Preview ({questions.length})
            </h3>

            {questions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-muted)" }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: "1rem", opacity: 0.6 }}>
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
                <p style={{ fontSize: "0.9rem" }}>No questions added to this test yet.</p>
                <p style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>Use the editor on the left to start compiling.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {questions.map((q, idx) => (
                  <div key={idx} className="glass-panel" style={{
                    padding: "1rem 1.25rem",
                    background: "rgba(255, 255, 255, 0.015)",
                    borderWidth: "1px"
                  }}>
                    <div className="flex-between" style={{ marginBottom: "0.75rem", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-purple)" }}>
                        QUESTION {idx + 1} ({q.type === "single" ? "Single Answer" : "Multi Answer"})
                      </span>
                      <button
                        type="button"
                        onClick={() => removeQuestionLocal(idx)}
                        className="btn btn-danger"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", borderRadius: "var(--radius-sm)" }}
                      >
                        Remove
                      </button>
                    </div>

                    <p style={{ color: "#fff", fontWeight: 500, fontSize: "0.95rem", textAlign: "left", marginBottom: "0.75rem" }}>
                      {q.question}
                    </p>

                    <div style={{ display: "grid", gap: "0.35rem", paddingLeft: "0.5rem" }}>
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = q.correct_options.includes(oIdx);
                        return (
                          <div key={oIdx} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            fontSize: "0.85rem",
                            color: isCorrect ? "#6ee7b7" : "var(--text-secondary)",
                            fontWeight: isCorrect ? 600 : 400
                          }}>
                            <span style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: isCorrect ? "var(--accent-emerald)" : "var(--text-muted)"
                            }} />
                            <span>{opt}</span>
                            {isCorrect && <span style={{ fontSize: "0.7rem", color: "var(--accent-emerald)", opacity: 0.8 }}>✓</span>}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div style={{
                        marginTop: "0.75rem",
                        paddingTop: "0.5rem",
                        borderTop: "1px dashed rgba(255,255,255,0.06)",
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        textAlign: "left"
                      }}>
                        <strong>Explanation: </strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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

// Simple lookup helper for Navbar subject mapping
const getSubjectName = (subjectId) => {
  const subjectsMap = {
    math: "Mathematics",
    sci: "Science",
    eng: "English",
    his: "History"
  };
  return subjectsMap[subjectId] || subjectId;
};
