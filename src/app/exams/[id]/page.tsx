"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Clock, AlertTriangle, CheckCircle, ShieldAlert, FileText, ChevronRight, ChevronLeft, Flag, Send } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";

export default function ExamSession({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { showToast } = useToast();
  const supabase = createClient();
  const resolvedParams = use(params);
  const examId = resolvedParams.id;

  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [testResults, setTestResults] = useState<Record<string, Record<number, boolean>>>({});
  
  // New State variables
  const [currentIndex, setCurrentIndex] = useState(0);
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Load Autosave Data
  useEffect(() => {
    if (isStarted && examId) {
      const savedAnswers = localStorage.getItem(`exam_answers_${examId}`);
      if (savedAnswers) {
        try {
          const parsed = JSON.parse(savedAnswers);
          // Only overwrite if we actually have data, else keep init data
          if (Object.keys(parsed).length > 0) setAnswers(parsed);
        } catch(e) {}
      }
      const savedReview = localStorage.getItem(`exam_review_${examId}`);
      if (savedReview) {
        try {
          setMarkedForReview(new Set(JSON.parse(savedReview)));
        } catch(e) {}
      }
    }
  }, [isStarted, examId]);

  // Save on change
  useEffect(() => {
    if (isStarted && Object.keys(answers).length > 0) {
      localStorage.setItem(`exam_answers_${examId}`, JSON.stringify(answers));
    }
  }, [answers, isStarted, examId]);

  useEffect(() => {
    if (isStarted) {
      localStorage.setItem(`exam_review_${examId}`, JSON.stringify(Array.from(markedForReview)));
    }
  }, [markedForReview, isStarted, examId]);

  // Security features
  useEffect(() => {
    if (!isStarted) return;

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      showToast("Copy/Paste is disabled during the exam", "error");
      setWarnings(w => w + 1);
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showToast("Right-click is disabled", "error");
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        showToast("Warning: Do not switch tabs during the exam!", "error");
        setWarnings(w => w + 1);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12, Ctrl+Shift+I, Ctrl+U
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && e.key === "u") ||
        (e.ctrlKey && (e.key === "c" || e.key === "v" || e.key === "x")) ||
        (e.metaKey && (e.key === "c" || e.key === "v" || e.key === "x"))
      ) {
        e.preventDefault();
        showToast("Developer shortcuts and copy/paste are disabled", "error");
        setWarnings(w => w + 1);
      }
    };

    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);
    document.addEventListener("cut", handleCopyPaste);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
      document.removeEventListener("cut", handleCopyPaste);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isStarted, showToast]);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const { data: eData, error: eErr } = await supabase.from("exams").select("*").eq("id", examId).single();
        if (eErr) throw eErr;
        setExam(eData);

        const { data: qData, error: qErr } = await supabase.from("exam_questions").select("*").eq("exam_id", examId).order("order_index");
        if (qErr) throw qErr;
        
        // Randomize questions for anti-cheating
        let randomizedQuestions = [];
        if (qData) {
          randomizedQuestions = [...qData].sort(() => Math.random() - 0.5);
        }

        // Initialize starter code
        const initialAnswers: Record<string, string> = {};
        randomizedQuestions.forEach(q => {
          if (q.question_type === "coding" && q.options && q.options.length > 0) {
            initialAnswers[q.id] = q.options[0]?.starter_code || q.options[0]; 
          } else if (q.question_type === "match_the_following") {
            initialAnswers[q.id] = "{}"; 
          }
        });
        setAnswers(initialAnswers);
        setQuestions(randomizedQuestions);
      } catch (err) {
        console.error(err);
        showToast("Failed to load exam.", "error");
      } finally {
        setLoading(false);
      }
    };

    if (examId) fetchExam();
  }, [examId, supabase, showToast]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isStarted && timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (isStarted && timeLeft === 0) {
      handleFinalSubmit();
    }
    return () => clearInterval(timer);
  }, [isStarted, timeLeft]);

  const startExam = async () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen().catch(() => console.log("Fullscreen denied"));
      }
      setTimeLeft(exam.time_limit_minutes * 60);
      setIsStarted(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Attempt to log start time, ignore duplicate errors
        await supabase.from("exam_submissions").insert({
          exam_id: exam.id,
          user_id: user.id,
          started_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinalSubmit = async () => {
    setShowConfirmModal(false);
    if (submitting) return;
    setSubmitting(true);
    
    try {
      let score = 0;
      let totalPoints = 0;
      
      questions.forEach(q => {
        totalPoints += q.points || 1;
        
        let isCorrect = false;
        const userAnswer = answers[q.id] || "";
        
        if (q.question_type === "multiple_choice") {
          isCorrect = userAnswer === q.correct_answer;
        } else if (q.question_type === "fill_in_the_blank") {
          const normalize = (s: string) => (s || "").replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
          isCorrect = normalize(userAnswer) === normalize(q.correct_answer);
        } else if (q.question_type === "coding") {
          const codingOpt = q.options[0];
          if (codingOpt && typeof codingOpt === "object" && codingOpt.test_cases) {
            let passedCount = 0;
            const totalTests = codingOpt.test_cases.length;
            try {
              for (const tc of codingOpt.test_cases) {
                const execCode = `
                  ${userAnswer}
                  return ${codingOpt.function_name}(${tc.input});
                `;
                const result = new Function(execCode)();
                if (String(result) === String(tc.expected_output)) passedCount++;
              }
              isCorrect = passedCount === totalTests; 
            } catch (e) {
              isCorrect = false;
            }
          } else {
            isCorrect = userAnswer.trim() === (q.correct_answer || "").trim();
          }
        } else if (q.question_type === "match_the_following") {
          try {
            const correctMap = JSON.parse(q.correct_answer);
            const userMap = JSON.parse(userAnswer || "{}");
            let allMatch = true;
            for (const key of Object.keys(correctMap)) {
              if (userMap[key] !== correctMap[key]) {
                allMatch = false;
                break;
              }
            }
            if (Object.keys(userMap).length !== Object.keys(correctMap).length) allMatch = false;
            isCorrect = allMatch;
          } catch(e) {
            console.error("Error evaluating match", e);
          }
        }

        if (isCorrect) score += q.points || 1;
      });

      const percentage = (score / totalPoints) * 100;
      const passed = percentage >= exam.passing_score;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("exam_submissions")
          .update({
            completed_at: new Date().toISOString(),
            score: percentage,
            passed: passed,
            answers: answers,
            warnings_count: warnings
          })
          .eq("exam_id", exam.id)
          .eq("user_id", user.id)
          .is("completed_at", null);
      }

      // Clear autosave
      localStorage.removeItem(`exam_answers_${examId}`);
      localStorage.removeItem(`exam_review_${examId}`);

      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {});
      }

      router.push(`/exams/${exam.id}/results`);
    } catch (err) {
      console.error(err);
      showToast("Failed to submit exam", "error");
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleMatchChange = (qId: string, leftItem: string, rightSelected: string) => {
    try {
      const currentMap = JSON.parse(answers[qId] || "{}");
      if (rightSelected === "") {
        delete currentMap[leftItem];
      } else {
        currentMap[leftItem] = rightSelected;
      }
      setAnswers({ ...answers, [qId]: JSON.stringify(currentMap) });
    } catch(e) {}
  };

  const toggleReview = (qId: string) => {
    const newSet = new Set(markedForReview);
    if (newSet.has(qId)) newSet.delete(qId);
    else newSet.add(qId);
    setMarkedForReview(newSet);
  };

  const isAnswered = (qId: string, type: string) => {
    const ans = answers[qId];
    if (!ans) return false;
    if (type === "match_the_following") return ans !== "{}" && Object.keys(JSON.parse(ans || "{}")).length > 0;
    return ans.trim().length > 0;
  };

  const runTests = (qId: string, codingOpt: any) => {
    if (!codingOpt || !codingOpt.test_cases) return;
    const userAnswer = answers[qId] || "";
    const newResults: Record<number, boolean> = {};
    
    codingOpt.test_cases.forEach((tc: any, tIndex: number) => {
      if (tc.is_hidden) return; 
      try {
        const execCode = `
          ${userAnswer}
          return ${codingOpt.function_name}(${tc.input});
        `;
        const result = new Function(execCode)();
        newResults[tIndex] = String(result) === String(tc.expected_output);
      } catch (e) {
        newResults[tIndex] = false;
      }
    });
    setTestResults({ ...testResults, [qId]: newResults });
  };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "var(--bg-primary)" }}>Loading...</div>;
  if (!exam) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "var(--bg-primary)" }}>Exam not found.</div>;

  if (!isStarted) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "24px", padding: "40px", maxWidth: "600px", width: "100%", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.05)" }}>
          <div style={{ width: "80px", height: "80px", background: "rgba(15,110,86,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "var(--brand-primary)" }}>
            <ShieldAlert size={40} />
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "16px", fontFamily: "var(--font-heading)" }}>
            {exam.title}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px", lineHeight: 1.6, marginBottom: "32px" }}>
            {exam.description}
          </p>
          
          <div style={{ display: "flex", gap: "24px", justifyContent: "center", marginBottom: "40px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-primary)" }}>
                <Clock size={20} color="var(--text-primary)" />
              </div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>{exam.time_limit_minutes} Mins</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-primary)" }}>
                <FileText size={20} color="var(--text-primary)" />
              </div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>{questions.length} Questions</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-primary)" }}>
                <CheckCircle size={20} color="var(--text-primary)" />
              </div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>{exam.passing_score}% to Pass</span>
            </div>
          </div>

          <div style={{ padding: "20px", background: "rgba(239, 68, 68, 0.05)", borderRadius: "12px", border: "1px solid rgba(239, 68, 68, 0.2)", marginBottom: "32px", textAlign: "left", display: "flex", gap: "16px", alignItems: "flex-start" }}>
            <AlertTriangle size={24} color="#EF4444" style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#EF4444", margin: "0 0 4px" }}>Secure Exam Mode</h4>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                Do not refresh the page, switch tabs, or exit fullscreen. Copying, pasting, and developer shortcuts are completely disabled. Violations will be recorded.
              </p>
            </div>
          </div>

          <button onClick={startExam} style={{
            width: "100%", padding: "18px", background: "var(--brand-primary)", color: "white", borderRadius: "16px", border: "none", fontSize: "16px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", boxShadow: "0 8px 24px rgba(15, 110, 86, 0.25)"
          }}>
            I understand, Start Exam <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  const isTimeCritical = timeLeft !== null && timeLeft < 300; 
  const answeredCount = questions.filter(q => isAnswered(q.id, q.question_type)).length;
  const unansweredCount = questions.length - answeredCount;
  
  const currentQ = questions[currentIndex];
  if (!currentQ) return null;
  const type = currentQ.question_type || "multiple_choice";

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-secondary)", userSelect: "none" }}>
      
      {/* Question Navigator Sidebar */}
      <div style={{ width: "320px", background: "var(--bg-card)", borderRight: "1px solid var(--border-primary)", display: "flex", flexDirection: "column", flexShrink: 0, zIndex: 10 }}>
        <div style={{ padding: "24px", borderBottom: "1px solid var(--border-primary)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 8px", fontFamily: "var(--font-heading)" }}>{exam.title}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: isTimeCritical ? "#EF4444" : "var(--text-primary)", fontWeight: 800, fontSize: "24px", background: isTimeCritical ? "rgba(239,68,68,0.1)" : "var(--bg-secondary)", padding: "12px", borderRadius: "12px", justifyContent: "center" }}>
            <Clock size={24} /> {timeLeft !== null ? formatTime(timeLeft) : "00:00:00"}
          </div>
        </div>
        
        <div style={{ padding: "24px", flex: 1, overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "14px", fontWeight: 600 }}>
            <span style={{ color: "var(--text-secondary)" }}>Progress</span>
            <span style={{ color: "var(--text-primary)" }}>{answeredCount} / {questions.length} Answered</span>
          </div>
          
          <div style={{ height: "6px", background: "var(--bg-secondary)", borderRadius: "4px", marginBottom: "24px", overflow: "hidden" }}>
            <div style={{ height: "100%", background: "var(--brand-primary)", width: `${(answeredCount / questions.length) * 100}%`, transition: "width 0.3s" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
            {questions.map((q, i) => {
              const answered = isAnswered(q.id, q.question_type);
              const reviewed = markedForReview.has(q.id);
              const active = currentIndex === i;
              
              let bg = "var(--bg-secondary)";
              let color = "var(--text-primary)";
              let border = "1px solid var(--border-primary)";
              
              if (reviewed) {
                bg = "rgba(245, 158, 11, 0.1)";
                color = "#F59E0B";
                border = "1px solid #F59E0B";
              } else if (answered) {
                bg = "rgba(16, 185, 129, 0.1)";
                color = "#10B981";
                border = "1px solid #10B981";
              }
              
              if (active) {
                border = `2px solid var(--brand-primary)`;
                if (!answered && !reviewed) {
                  bg = "var(--bg-primary)";
                }
              }

              return (
                <button 
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  style={{ 
                    height: "44px", borderRadius: "10px", background: bg, color: color, border: border, 
                    fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative"
                  }}
                >
                  {i + 1}
                  {reviewed && <div style={{ position: "absolute", top: "-4px", right: "-4px", width: "12px", height: "12px", background: "#F59E0B", borderRadius: "50%", border: "2px solid var(--bg-card)" }} />}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><div style={{ width: "16px", height: "16px", borderRadius: "4px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10B981" }}/> Answered</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><div style={{ width: "16px", height: "16px", borderRadius: "4px", background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}/> Unanswered</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><div style={{ width: "16px", height: "16px", borderRadius: "4px", background: "rgba(245, 158, 11, 0.1)", border: "1px solid #F59E0B" }}/> Marked for Review</div>
          </div>
        </div>
        
        <div style={{ padding: "24px", borderTop: "1px solid var(--border-primary)" }}>
          <button onClick={() => setShowConfirmModal(true)} style={{
            width: "100%", padding: "16px", background: "var(--text-primary)", color: "var(--bg-primary)", borderRadius: "12px", border: "none", fontWeight: 800, fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
          }}>
            Submit Exam <Send size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
        
        {warnings > 0 && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", borderBottom: "1px solid #EF4444", padding: "12px 24px", color: "#EF4444", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px", zIndex: 5 }}>
            <AlertTriangle size={18} /> {warnings} warning(s): Suspicious activity detected.
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", padding: "40px 60px", display: "flex", flexDirection: "column" }}>
          <div style={{ maxWidth: "800px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", flex: 1 }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
              <div style={{ background: "rgba(15,110,86,0.1)", color: "var(--brand-primary)", padding: "6px 14px", borderRadius: "20px", fontWeight: 800, fontSize: "14px" }}>
                Question {currentIndex + 1} of {questions.length}
              </div>
              <button 
                onClick={() => toggleReview(currentQ.id)}
                style={{ 
                  display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", 
                  border: `1px solid ${markedForReview.has(currentQ.id) ? "#F59E0B" : "var(--border-primary)"}`,
                  background: markedForReview.has(currentQ.id) ? "rgba(245, 158, 11, 0.1)" : "var(--bg-secondary)",
                  color: markedForReview.has(currentQ.id) ? "#F59E0B" : "var(--text-secondary)",
                  fontWeight: 600, fontSize: "14px", cursor: "pointer"
                }}
              >
                <Flag size={16} /> {markedForReview.has(currentQ.id) ? "Marked for Review" : "Mark for Review"}
              </button>
            </div>

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "20px", padding: "40px", boxShadow: "0 10px 40px rgba(0,0,0,0.02)", marginBottom: "40px" }}>
              <h3 style={{ fontSize: "22px", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.5, margin: "0 0 32px 0" }}>
                {currentQ.question_text}
                <span style={{ display: "block", fontSize: "14px", color: "var(--text-tertiary)", fontWeight: 500, marginTop: "8px" }}>
                  {type === "multiple_choice" && "Select one option."}
                  {type === "fill_in_the_blank" && "Type your exact answer."}
                  {type === "match_the_following" && "Match each item correctly."}
                  {type === "coding" && "Write your code below."}
                </span>
              </h3>

              <div style={{ padding: "0" }}>
                {/* MULTIPLE CHOICE */}
                {type === "multiple_choice" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {(currentQ.options || []).map((opt: string, oIndex: number) => {
                      const isSelected = answers[currentQ.id] === opt;
                      return (
                        <label key={oIndex} style={{
                          display: "flex", alignItems: "center", gap: "16px", padding: "20px",
                          border: `2px solid ${isSelected ? "var(--brand-primary)" : "var(--border-primary)"}`,
                          borderRadius: "16px", cursor: "pointer",
                          background: isSelected ? "rgba(15,110,86,0.05)" : "var(--bg-secondary)",
                          transition: "all 0.2s"
                        }}>
                          <div style={{
                            width: "24px", height: "24px", borderRadius: "50%",
                            border: `2px solid ${isSelected ? "var(--brand-primary)" : "var(--text-tertiary)"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: "var(--bg-card)", flexShrink: 0
                          }}>
                            {isSelected && <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "var(--brand-primary)" }} />}
                          </div>
                          <span style={{ fontSize: "16px", fontWeight: 500, color: "var(--text-primary)" }}>{opt}</span>
                          <input 
                            type="radio" name={currentQ.id} style={{ display: "none" }}
                            onChange={() => setAnswers({...answers, [currentQ.id]: opt})}
                          />
                        </label>
                      );
                    })}
                    {/* Clear selection button */}
                    {answers[currentQ.id] && (
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                         <button onClick={() => {
                           const newAns = {...answers};
                           delete newAns[currentQ.id];
                           setAnswers(newAns);
                         }} style={{ background: "none", border: "none", color: "var(--text-tertiary)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                           Clear Selection
                         </button>
                      </div>
                    )}
                  </div>
                )}

                {/* FILL IN THE BLANK */}
                {type === "fill_in_the_blank" && (
                  <input 
                    type="text" 
                    value={answers[currentQ.id] || ""}
                    onChange={e => setAnswers({...answers, [currentQ.id]: e.target.value})}
                    placeholder="Type your answer here..."
                    style={{ width: "100%", padding: "20px", borderRadius: "16px", border: "2px solid var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "18px", outline: "none", transition: "border-color 0.2s" }}
                    onFocus={e => e.currentTarget.style.borderColor = "var(--brand-primary)"}
                    onBlur={e => e.currentTarget.style.borderColor = "var(--border-primary)"}
                  />
                )}

                {/* MATCH THE FOLLOWING */}
                {type === "match_the_following" && currentQ.options && currentQ.options.left && currentQ.options.right && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {currentQ.options.left.map((leftItem: string, lIndex: number) => {
                      let selectedVal = "";
                      try {
                        selectedVal = JSON.parse(answers[currentQ.id] || "{}")[leftItem] || "";
                      } catch(e) {}
                      const rightItems = [...currentQ.options.right].sort((a, b) => a.localeCompare(b));

                      return (
                        <div key={lIndex} style={{ display: "flex", alignItems: "center", gap: "20px", background: "var(--bg-secondary)", padding: "16px 20px", borderRadius: "16px", border: "1px solid var(--border-primary)" }}>
                          <div style={{ flex: 1, fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>
                            {leftItem}
                          </div>
                          <div style={{ color: "var(--text-tertiary)", fontWeight: 800 }}>=</div>
                          <select 
                            value={selectedVal}
                            onChange={(e) => handleMatchChange(currentQ.id, leftItem, e.target.value)}
                            style={{ flex: 1, padding: "14px", borderRadius: "12px", border: `2px solid ${selectedVal ? "var(--brand-primary)" : "var(--border-primary)"}`, background: "var(--bg-card)", color: "var(--text-primary)", outline: "none", cursor: "pointer", fontSize: "15px", fontWeight: 500 }}
                          >
                            <option value="">Select match...</option>
                            {rightItems.map((rightItem: string, rIndex: number) => (
                              <option key={rIndex} value={rightItem}>{rightItem}</option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* CODING */}
                {type === "coding" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #374151" }}>
                      <div style={{ background: "#111827", padding: "12px 20px", color: "#9CA3AF", fontSize: "13px", fontWeight: 600, borderBottom: "1px solid #374151", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                         <span>Code Editor</span>
                         {currentQ.options[0] && typeof currentQ.options[0] === "object" && currentQ.options[0].test_cases && (
                            <button onClick={() => runTests(currentQ.id, currentQ.options[0])} style={{ padding: "6px 14px", background: "rgba(16, 185, 129, 0.2)", border: "1px solid #10B981", borderRadius: "6px", color: "#10B981", fontWeight: 700, cursor: "pointer", fontSize: "12px" }}>
                              Run Public Tests
                            </button>
                          )}
                      </div>
                      <textarea 
                        value={answers[currentQ.id] || ""}
                        onChange={e => setAnswers({...answers, [currentQ.id]: e.target.value})}
                        placeholder="// Write your code here..."
                        rows={10}
                        style={{ 
                          width: "100%", padding: "20px", border: "none", 
                          background: "#1f2937", color: "#f3f4f6", fontSize: "15px", fontFamily: "monospace", 
                          outline: "none", resize: "vertical", tabSize: 2, lineHeight: 1.6 
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Tab') {
                            e.preventDefault();
                            const start = e.currentTarget.selectionStart;
                            const end = e.currentTarget.selectionEnd;
                            const value = e.currentTarget.value;
                            setAnswers({...answers, [currentQ.id]: value.substring(0, start) + "  " + value.substring(end)});
                            // Move cursor asynchronously
                            setTimeout(() => { e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2; }, 0);
                          }
                        }}
                      />
                    </div>

                    {currentQ.options[0] && typeof currentQ.options[0] === "object" && currentQ.options[0].test_cases && (
                      <div style={{ background: "var(--bg-secondary)", borderRadius: "16px", border: "1px solid var(--border-primary)", padding: "24px" }}>
                        <h4 style={{ fontSize: "15px", fontWeight: 800, margin: "0 0 16px" }}>Test Results</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          {currentQ.options[0].test_cases.filter((tc: any) => !tc.is_hidden).map((tc: any, tIndex: number) => {
                            const result = testResults[currentQ.id]?.[tIndex];
                            return (
                              <div key={tIndex} style={{ background: "var(--bg-card)", padding: "16px", borderRadius: "12px", border: `2px solid ${result === true ? "rgba(16,185,129,0.5)" : result === false ? "rgba(239,68,68,0.5)" : "var(--border-primary)"}` }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                  <div>
                                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 700, marginBottom: "6px" }}>Input</div>
                                    <div style={{ fontFamily: "monospace", fontSize: "14px", color: "var(--text-primary)", background: "var(--bg-secondary)", padding: "8px", borderRadius: "6px" }}>{tc.input}</div>
                                  </div>
                                  <div>
                                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 700, marginBottom: "6px" }}>Expected</div>
                                    <div style={{ fontFamily: "monospace", fontSize: "14px", color: "var(--text-primary)", background: "var(--bg-secondary)", padding: "8px", borderRadius: "6px" }}>{tc.expected_output}</div>
                                  </div>
                                </div>
                                {result !== undefined && (
                                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border-primary)", fontSize: "14px", fontWeight: 800, color: result ? "#10B981" : "#EF4444", display: "flex", alignItems: "center", gap: "6px" }}>
                                    {result ? <><CheckCircle size={16}/> Test Passed</> : <><AlertTriangle size={16}/> Test Failed</>}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto" }}>
              <button 
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                style={{ padding: "14px 24px", background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "12px", color: "var(--text-primary)", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", cursor: currentIndex === 0 ? "not-allowed" : "pointer", opacity: currentIndex === 0 ? 0.5 : 1 }}
              >
                <ChevronLeft size={20} /> Previous
              </button>
              
              {currentIndex < questions.length - 1 ? (
                <button 
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  style={{ padding: "14px 24px", background: "var(--brand-primary)", border: "none", borderRadius: "12px", color: "white", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", boxShadow: "0 4px 12px rgba(15,110,86,0.2)" }}
                >
                  Next <ChevronRight size={20} />
                </button>
              ) : (
                <button 
                  onClick={() => setShowConfirmModal(true)}
                  style={{ padding: "14px 32px", background: "var(--text-primary)", border: "none", borderRadius: "12px", color: "var(--bg-primary)", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                >
                  Finish Exam <Send size={20} />
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "var(--bg-card)", width: "100%", maxWidth: "480px", borderRadius: "24px", padding: "40px", boxShadow: "0 24px 48px rgba(0,0,0,0.2)", position: "relative" }}>
            <div style={{ width: "64px", height: "64px", background: unansweredCount > 0 ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: unansweredCount > 0 ? "#F59E0B" : "#10B981" }}>
              {unansweredCount > 0 ? <AlertTriangle size={32} /> : <CheckCircle size={32} />}
            </div>
            
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", textAlign: "center", marginBottom: "16px" }}>
              Ready to submit?
            </h2>
            
            <p style={{ color: "var(--text-secondary)", textAlign: "center", fontSize: "16px", lineHeight: 1.5, marginBottom: "32px" }}>
              {unansweredCount > 0 
                ? `You still have ${unansweredCount} unanswered question(s). Are you absolutely sure you want to submit your exam right now?`
                : "You have answered all questions. Your exam is ready to be graded."}
            </p>
            
            <div style={{ display: "flex", gap: "16px" }}>
              <button onClick={() => setShowConfirmModal(false)} style={{ flex: 1, padding: "16px", background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", borderRadius: "12px", color: "var(--text-primary)", fontWeight: 700, cursor: "pointer" }}>
                Keep Working
              </button>
              <button onClick={handleFinalSubmit} disabled={submitting} style={{ flex: 1, padding: "16px", background: "var(--brand-primary)", border: "none", borderRadius: "12px", color: "white", fontWeight: 800, cursor: submitting ? "not-allowed" : "pointer" }}>
                {submitting ? "Submitting..." : "Yes, Submit Exam"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
