import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function TakeExamPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // Keep track of active question, selected answers, marked reviews, and countdowns
  const [activeIdx, setActiveIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // maps { questionIndex: selectedIndex(es) }
  const [markedForReview, setMarkedForReview] = useState([]); 
  const [timeLeft, setTimeLeft] = useState(0); // seconds remaining
  const [examSubmitted, setExamSubmitted] = useState(false);

  // Score statistics
  const [results, setResults] = useState(null);

  const timerRef = useRef(null);

  // Load the test parameter details and verify questions exist
  useEffect(() => {
    async function fetchTest() {
      try {
        setLoading(true);
        const res = await api.get(`/tests/${testId}`);
        const testData = res.data.data;
        
        if (!testData.questions || testData.questions.length === 0) {
          setApiError("This test has no questions added yet. You cannot take a demo exam.");
          setLoading(false);
          return;
        }

        setTest(testData);
        setTimeLeft(testData.total_time * 60); // minutes to seconds
      } catch (err) {
        setApiError("Failed to load test details for the simulation.");
      } finally {
        setLoading(false);
      }
    }
    fetchTest();
  }, [testId]);

  // Setup the countdown timer interval
  useEffect(() => {
    if (loading || examSubmitted || timeLeft <= 0 || !test) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, examSubmitted, timeLeft, test]);

  // Auto-submit when the countdown hits zero
  const handleAutoSubmit = () => {
    alert("Time has expired! Your responses will be submitted automatically.");
    submitExam();
  };

  // Option select handler: updates local answer choices map
  const handleSelectOption = (optionIdx) => {
    const question = test.questions[activeIdx];
    
    if (question.type === "single") {
      setUserAnswers(prev => ({
        ...prev,
        [activeIdx]: optionIdx
      }));
    } else {
      // Toggle indices list for checkboxes
      setUserAnswers(prev => {
        const currentAnswers = prev[activeIdx] || [];
        if (currentAnswers.includes(optionIdx)) {
          return {
            ...prev,
            [activeIdx]: currentAnswers.filter(idx => idx !== optionIdx)
          };
        } else {
          return {
            ...prev,
            [activeIdx]: [...currentAnswers, optionIdx]
          };
        }
      });
    }
  };

  // Reset selected options for the active question
  const clearResponse = () => {
    setUserAnswers(prev => {
      const copy = { ...prev };
      delete copy[activeIdx];
      return copy;
    });
  };

  // Add/remove active question to marked list
  const toggleMarkForReview = () => {
    setMarkedForReview(prev => {
      if (prev.includes(activeIdx)) {
        return prev.filter(idx => idx !== activeIdx);
      } else {
        return [...prev, activeIdx];
      }
    });
  };

  // Grade the exam choices and calculate scores
  const submitExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const totalQuestions = test.questions.length;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;
    let score = 0;

    // Loop through questions and compare selections with correct keys
    const reviewData = test.questions.map((q, idx) => {
      const studentAns = userAnswers[idx];
      const correctAns = q.correct_options || [];
      
      const isAnswered = studentAns !== undefined && (Array.isArray(studentAns) ? studentAns.length > 0 : studentAns !== null);
      let isCorrect = false;

      // Unattempted: apply skipped penalty if set
      if (!isAnswered) {
        skippedCount++;
        score += Number(test.unattempt_marks || 0);
      } 
      // Answered: check correctness and add marks / apply penalty
      else {
        if (q.type === "single") {
          isCorrect = studentAns === correctAns[0];
        } else {
          const sortedStudent = [...studentAns].sort((a,b)=>a-b);
          const sortedCorrect = [...correctAns].sort((a,b)=>a-b);
          isCorrect = JSON.stringify(sortedStudent) === JSON.stringify(sortedCorrect);
        }

        if (isCorrect) {
          correctCount++;
          score += Number(test.correct_marks || 0);
        } else {
          wrongCount++;
          score += Number(test.wrong_marks || 0);
        }
      }

      return {
        question: q.question,
        options: q.options,
        studentAns,
        correctAns,
        isAnswered,
        isCorrect,
        explanation: q.explanation,
        type: q.type
      };
    });

    setResults({
      score,
      correctCount,
      wrongCount,
      skippedCount,
      totalQuestions,
      reviewData
    });
    setExamSubmitted(true);
  };

  // Convert raw seconds into a readable MM:SS layout
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Render loading screen during initial boot
  if (loading) {
    return (
      <div className="container animate-fade-in" style={{ maxWidth: "800px", padding: "4rem 0" }}>
        <div className="glass-panel" style={{ padding: "4rem", textAlign: "center" }}>
          <div className="spinner" style={{
            width: "2.5rem",
            height: "2.5rem",
            border: "3px solid rgba(255,255,255,0.05)",
            borderTopColor: "var(--border-focus)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 1rem auto"
          }} />
          <p>Booting exam client environment...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Display errors if test fetch failed or contains no questions
  if (apiError) {
    return (
      <div className="container animate-fade-in" style={{ maxWidth: "600px", padding: "4rem 0" }}>
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--accent-rose)", marginBottom: "1rem" }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          <h3>Demo Simulation Blocked</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem", fontSize: "0.95rem" }}>{apiError}</p>
          <button onClick={() => navigate("/dashboard")} className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Render exam results scoreboard
  if (examSubmitted && results) {
    const totalPossibleMarks = results.totalQuestions * Number(test.correct_marks);
    const accuracy = results.correctCount + results.wrongCount > 0 
      ? Math.round((results.correctCount / (results.correctCount + results.wrongCount)) * 100) 
      : 0;

    return (
      <div className="container animate-fade-in" style={{ maxWidth: "800px" }}>
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <h1 style={{ margin: 0 }}>Exam Simulation Results</h1>
          <p>Mock score sheet for the assessment: {test.name}</p>
        </div>

        {/* Results summary stats boxes */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2.5rem"
        }}>
          {/* Total score box */}
          <div className="glass-panel" style={{ padding: "1.5rem", textAlign: "center", borderTop: "4px solid var(--accent-purple)" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>
              Total Score
            </span>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", margin: "0.5rem 0", fontFamily: "var(--font-heading)" }}>
              {results.score}
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              out of {totalPossibleMarks}
            </span>
          </div>

          {/* Correct count box */}
          <div className="glass-panel" style={{
            padding: "1.5rem",
            textAlign: "center",
            borderTop: "4px solid var(--accent-emerald)",
            boxShadow: "0 0 15px rgba(16, 185, 129, 0.1)"
          }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>
              Total Right
            </span>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#6ee7b7", margin: "0.5rem 0", fontFamily: "var(--font-heading)" }}>
              {results.correctCount}
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Correct Answers
            </span>
          </div>

          {/* Incorrect count box */}
          <div className="glass-panel" style={{
            padding: "1.5rem",
            textAlign: "center",
            borderTop: "4px solid var(--accent-rose)",
            boxShadow: "0 0 15px rgba(244, 63, 94, 0.1)"
          }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>
              Total Wrong
            </span>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#fca5a5", margin: "0.5rem 0", fontFamily: "var(--font-heading)" }}>
              {results.wrongCount}
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Incorrect Answers
            </span>
          </div>

          {/* Correct selection ratio */}
          <div className="glass-panel" style={{ padding: "1.5rem", textAlign: "center", borderTop: "4px solid var(--accent-cyan)" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>
              Accuracy
            </span>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#67e8f9", margin: "0.5rem 0", fontFamily: "var(--font-heading)" }}>
              {accuracy}%
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Correct ratio
            </span>
          </div>
        </div>

        {/* Breakdown details per question */}
        <div className="glass-panel" style={{ padding: "2rem", marginBottom: "2rem" }}>
          <h3 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>
            Questions Solution Sheet & Review
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {results.reviewData.map((q, idx) => (
              <div key={idx} style={{
                paddingBottom: "1.5rem",
                borderBottom: idx === results.reviewData.length - 1 ? "none" : "1px solid var(--border-color)",
                textAlign: "left"
              }}>
                <div className="flex-between" style={{ marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-purple)" }}>
                    QUESTION {idx + 1}
                  </span>
                  
                  {/* Mark tags depending on correctness */}
                  {q.isAnswered ? (
                    q.isCorrect ? (
                      <span className="badge badge-live">Correct (+{test.correct_marks})</span>
                    ) : (
                      <span className="badge badge-difficulty-hard">Wrong ({test.wrong_marks})</span>
                    )
                  ) : (
                    <span className="badge badge-difficulty-medium">Unattempted ({test.unattempt_marks})</span>
                  )}
                </div>

                <p style={{ color: "#fff", fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.75rem" }}>
                  {q.question}
                </p>

                {/* Option blocks with color coding showing right vs wrong */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  {q.options.map((opt, oIdx) => {
                    const isCorrect = q.correctAns.includes(oIdx);
                    const isSelected = Array.isArray(q.studentAns) ? q.studentAns.includes(oIdx) : q.studentAns === oIdx;
                    
                    let bg = "rgba(255, 255, 255, 0.01)";
                    let border = "1px solid rgba(255, 255, 255, 0.03)";
                    let color = "var(--text-secondary)";

                    if (isCorrect) {
                      bg = "rgba(16, 185, 129, 0.08)";
                      border = "1px solid rgba(16, 185, 129, 0.3)";
                      color = "#a7f3d0";
                    } else if (isSelected && !isCorrect) {
                      bg = "rgba(244, 63, 94, 0.08)";
                      border = "1px solid rgba(244, 63, 94, 0.3)";
                      color = "#fda4af";
                    }

                    return (
                      <div key={oIdx} style={{
                        padding: "0.5rem 0.75rem",
                        borderRadius: "var(--radius-sm)",
                        background: bg,
                        border: border,
                        fontSize: "0.85rem",
                        color: color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "between",
                        gap: "0.5rem"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
                          <span style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: isCorrect ? "var(--accent-emerald)" : isSelected ? "var(--accent-rose)" : "var(--text-muted)"
                          }} />
                          <span>{opt}</span>
                        </div>
                        {isSelected && <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>[Chosen]</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Question explanation text */}
                {q.explanation && (
                  <div style={{
                    background: "rgba(255, 255, 255, 0.01)",
                    padding: "0.6rem 0.85rem",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    borderLeft: "2.5px solid var(--accent-purple)"
                  }}>
                    <strong>Solution:</strong> {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Return buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", paddingBottom: "2rem" }}>
          <button onClick={() => navigate("/dashboard")} className="btn btn-primary">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- RUNNING EXAM VIEWS ---
  const activeQuestion = test.questions[activeIdx];
  const selectedOption = userAnswers[activeIdx];
  const isMarked = markedForReview.includes(activeIdx);
  const isTimeLow = timeLeft < 300; // Warning color if under 5 minutes

  return (
    <div className="container animate-fade-in" style={{ padding: "1.5rem" }}>
      {/* Simulation top layout headers */}
      <div className="glass-panel" style={{
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.5rem",
        borderWidth: "1px"
      }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", margin: 0 }}>{test.name}</h2>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Subject: {getSubjectName(test.subject_id)} ({test.type} test demo)
          </span>
        </div>

        {/* Live timer countdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            background: isTimeLow ? "rgba(244, 63, 94, 0.1)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${isTimeLow ? "rgba(244, 63, 94, 0.3)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: "var(--radius-md)",
            color: isTimeLow ? "var(--accent-rose)" : "var(--accent-cyan)",
            fontWeight: 700,
            fontFamily: "var(--font-mono)"
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button onClick={submitExam} className="btn btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.9rem" }}>
            Submit Exam
          </button>
        </div>
      </div>

      {/* Main CBT Grid: Active question details and Circle Navigator matrix */}
      <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr", gap: "1.5rem", alignItems: "flex-start" }}>
        
        {/* Active question layout */}
        <div className="glass-panel" style={{ padding: "2rem", minHeight: "400px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          
          <div style={{ textAlign: "left" }}>
            {/* Header counters */}
            <div className="flex-between" style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-purple)" }}>
                Question {activeIdx + 1} of {test.questions.length}
              </span>
              <span className="badge badge-difficulty-easy">
                {activeQuestion.type === "single" ? "Single Correct" : "Multiple Correct"}
              </span>
            </div>

            {/* Prompt text */}
            <p style={{ color: "#fff", fontWeight: 500, fontSize: "1.1rem", lineHeight: 1.5, marginBottom: "1.5rem" }}>
              {activeQuestion.question}
            </p>

            {/* Render choices list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {activeQuestion.options.map((opt, oIdx) => {
                const isSelected = activeQuestion.type === "single"
                  ? selectedOption === oIdx
                  : selectedOption?.includes(oIdx);

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    style={{
                      background: isSelected ? "rgba(168, 85, 247, 0.08)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isSelected ? "var(--border-focus)" : "rgba(255,255,255,0.08)"}`,
                      padding: "1rem 1.25rem",
                      borderRadius: "var(--radius-md)",
                      color: isSelected ? "#fff" : "var(--text-secondary)",
                      fontSize: "0.95rem",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      transition: "var(--transition)",
                      outline: "none"
                    }}
                  >
                    {/* Selector icon circles/checkboxes */}
                    <div style={{
                      width: "1.1rem",
                      height: "1.1rem",
                      borderRadius: activeQuestion.type === "single" ? "50%" : "3px",
                      border: `1.5px solid ${isSelected ? "var(--border-focus)" : "var(--text-muted)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      {isSelected && (
                        <div style={{
                          width: "0.5rem",
                          height: "0.5rem",
                          borderRadius: activeQuestion.type === "single" ? "50%" : "1px",
                          background: "var(--border-focus)"
                        }} />
                      )}
                    </div>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons footer */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "2.5rem",
            borderTop: "1px solid var(--border-color)",
            paddingTop: "1.5rem"
          }}>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={clearResponse} className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                Clear Response
              </button>
              <button 
                onClick={toggleMarkForReview} 
                className="btn btn-secondary" 
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "0.85rem",
                  borderColor: isMarked ? "rgba(245, 158, 11, 0.4)" : "rgba(255,255,255,0.1)",
                  color: isMarked ? "var(--accent-amber)" : "var(--text-primary)",
                  background: isMarked ? "rgba(245, 158, 11, 0.05)" : "transparent"
                }}
              >
                {isMarked ? "Marked for Review" : "Mark for Review"}
              </button>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setActiveIdx(prev => Math.max(0, prev - 1))}
                disabled={activeIdx === 0}
                className="btn btn-secondary"
                style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
              >
                ← Previous
              </button>
              <button
                onClick={() => setActiveIdx(prev => Math.min(test.questions.length - 1, prev + 1))}
                disabled={activeIdx === test.questions.length - 1}
                className="btn btn-secondary"
                style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
              >
                Next →
              </button>
            </div>
          </div>

        </div>

        {/* Sidebar circle matrix navigator */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", marginBottom: "1.25rem", textAlign: "left" }}>
            Question Navigator
          </h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "0.75rem",
            marginBottom: "1.5rem"
          }}>
            {test.questions.map((_, idx) => {
              const isCurrent = idx === activeIdx;
              const isAns = userAnswers[idx] !== undefined && (Array.isArray(userAnswers[idx]) ? userAnswers[idx].length > 0 : userAnswers[idx] !== null);
              const isMark = markedForReview.includes(idx);
              
              let bg = "rgba(255, 255, 255, 0.02)";
              let border = "1px solid rgba(255, 255, 255, 0.08)";
              let color = "var(--text-secondary)";

              if (isCurrent) {
                border = "2px solid var(--border-focus)";
                color = "#fff";
              }
              
              if (isAns) {
                bg = "rgba(16, 185, 129, 0.15)";
                border = `1px solid ${isCurrent ? "var(--border-focus)" : "rgba(16, 185, 129, 0.4)"}`;
                color = "#a7f3d0";
              } else if (isMark) {
                bg = "rgba(245, 158, 11, 0.15)";
                border = `1px solid ${isCurrent ? "var(--border-focus)" : "rgba(245, 158, 11, 0.4)"}`;
                color = "#fef3c7";
              }

              return (
                <button
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  style={{
                    width: "2.25rem",
                    height: "2.25rem",
                    borderRadius: "50%",
                    background: bg,
                    border: border,
                    color: color,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "var(--transition)",
                    fontSize: "0.85rem",
                    outline: "none"
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Color legends */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem",
            fontSize: "0.8rem",
            textAlign: "left",
            borderTop: "1px solid var(--border-color)",
            paddingTop: "1rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.25)", border: "1px solid rgba(16, 185, 129, 0.5)" }} />
              <span>Answered</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "rgba(245, 158, 11, 0.25)", border: "1px solid rgba(245, 158, 11, 0.5)" }} />
              <span>Marked for Review</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.08)" }} />
              <span>Not Visited / Skipped</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "transparent", border: "2px solid var(--border-focus)" }} />
              <span>Current Question</span>
            </div>
          </div>

        </div>
      </div>
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
