"use client";

import React, { useState, useTransition } from "react";
import { Plus, Trash2, Edit3, Check, X, ChevronUp, ChevronDown, Code2, ListChecks, Settings, Save, AlertTriangle, CheckCircle2, Sparkles, ArrowRightLeft, ArrowRight } from "lucide-react";
import { addQuestionAction, updateQuestionAction, deleteQuestionAction, updateExamSettingsAction, generateExamWithAIAction } from "@/app/instructor/courses/[id]/exam/actions";

const CARD: React.CSSProperties = { background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: "16px", padding: "24px" };
const INPUT: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "14px", fontFamily: "inherit", outline: "none" };
const BTN_PRIMARY: React.CSSProperties = { padding: "10px 20px", borderRadius: "10px", border: "none", background: "var(--brand-primary)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" };
const BTN_GHOST: React.CSSProperties = { padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--border-primary)", background: "transparent", color: "var(--text-secondary)", fontWeight: 600, cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" };

type Option = { text: string; isCorrect: boolean; matchTarget?: string };
type Question = { id: string; question_type: string; question: string; options: Option[]; code_template?: string; expected_output?: string; order_index: number };

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999, background: type === "success" ? "#065F46" : "#7F1D1D", color: "white", padding: "14px 20px", borderRadius: "12px", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)", animation: "fadeIn 0.3s ease" }}>
      {type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
      {msg}
    </div>
  );
}

function OptionsEditor({ options, onChange }: { options: Option[]; onChange: (o: Option[]) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Answer Options</label>
      {options.map((opt, i) => (
        <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button type="button" onClick={() => onChange(options.map((o, j) => ({ ...o, isCorrect: j === i })))}
            style={{ width: "28px", height: "28px", borderRadius: "50%", border: `2px solid ${opt.isCorrect ? "var(--brand-primary)" : "#CBD5E1"}`, background: opt.isCorrect ? "var(--brand-primary)" : "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {opt.isCorrect && <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "white" }} />}
          </button>
          <input style={{ ...INPUT }} value={opt.text} placeholder={`Option ${i + 1}`}
            onChange={e => onChange(options.map((o, j) => j === i ? { ...o, text: e.target.value } : o))} />
          {options.length > 2 && (
            <button type="button" onClick={() => onChange(options.filter((_, j) => j !== i))}
              style={{ ...BTN_GHOST, padding: "8px", color: "#DC2626" }}><X size={14} /></button>
          )}
        </div>
      ))}
      {options.length < 6 && (
        <button type="button" onClick={() => onChange([...options, { text: "", isCorrect: false }])}
          style={{ ...BTN_GHOST, alignSelf: "flex-start" }}><Plus size={14} /> Add Option</button>
      )}
    </div>
  );
}

function QuestionForm({ courseId, courseTitle, quizId, initial, onDone }: {
  courseId: string; courseTitle: string; quizId: string | null;
  initial?: Question; onDone: (msg: string) => void;
}) {
  const [type, setType] = useState(initial?.question_type || "multiple_choice");
  const [question, setQuestion] = useState(initial?.question || "");
  const [options, setOptions] = useState<Option[]>(
    initial?.options?.length ? initial.options : [{ text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }]
  );
  const [codeTemplate, setCodeTemplate] = useState(initial?.code_template || "");
  const [expectedOutput, setExpectedOutput] = useState(initial?.expected_output || "");
  const [blankAnswers, setBlankAnswers] = useState<string[]>(() => {
    try { return JSON.parse(initial?.expected_output || "[]"); } catch { return []; }
  });
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const fd = new FormData();
    fd.set("courseId", courseId);
    fd.set("courseTitle", courseTitle);
    fd.set("quizId", quizId || "");
    fd.set("questionType", type);
    fd.set("question", question);
    fd.set("codeTemplate", codeTemplate);
    fd.set("expectedOutput", type === "fill_in_the_blank" ? JSON.stringify(blankAnswers) : expectedOutput);
    fd.set("optionCount", options.length.toString());
    options.forEach((o, i) => { 
      fd.set(`option_${i}`, o.text); 
      fd.set(`correct_${i}`, o.isCorrect.toString()); 
      if (o.matchTarget) fd.set(`matchTarget_${i}`, o.matchTarget);
    });
    if (initial) { fd.set("questionId", initial.id); }

    startTransition(async () => {
      const res = initial ? await updateQuestionAction(fd) : await addQuestionAction(fd);
      if ((res as any)?.error) { setErr((res as any).error); return; }
      onDone(initial ? "Question updated!" : "Question added!");
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {[
          { id: "multiple_choice", label: "Multiple Choice", icon: <ListChecks size={14} /> },
          { id: "true_false", label: "True / False", icon: <CheckCircle2 size={14} /> },
          { id: "fill_in_the_blank", label: "Fill in Blanks", icon: <Edit3 size={14} /> },
          { id: "short_answer", label: "Short Answer", icon: <Edit3 size={14} /> },
          { id: "match_the_following", label: "Matching", icon: <ArrowRightLeft size={14} /> },
          { id: "coding", label: "Coding", icon: <Code2 size={14} /> }
        ].map(t => (
          <button key={t.id} type="button" onClick={() => {
            setType(t.id);
            if (t.id === "true_false" && (!initial || initial.question_type !== "true_false")) {
              setOptions([{ text: "True", isCorrect: true }, { text: "False", isCorrect: false }]);
            }
          }}
            style={{ ...BTN_GHOST, background: type === t.id ? "rgba(15,110,86,0.1)" : "transparent", color: type === t.id ? "var(--brand-primary)" : "var(--text-secondary)", borderColor: type === t.id ? "var(--brand-primary)" : "var(--border-primary)" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div>
        <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
          Question Text * {type === "fill_in_the_blank" && <span style={{ color: "var(--brand-primary)" }}>(Use `___` for blanks)</span>}
        </label>
        <textarea required value={question} onChange={e => setQuestion(e.target.value)}
          rows={3} style={{ ...INPUT, resize: "vertical" }} placeholder={type === "fill_in_the_blank" ? "The ___ tag is used for paragraphs in ___." : "Enter the question..."} />
      </div>

      {type === "multiple_choice" && (
        <OptionsEditor options={options} onChange={setOptions} />
      )}
      
      {type === "true_false" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Correct Answer</label>
          <div style={{ display: "flex", gap: "12px" }}>
            {options.map((opt, i) => (
              <button key={i} type="button" onClick={() => setOptions(options.map((o, j) => ({ ...o, isCorrect: j === i })))}
                style={{ ...BTN_GHOST, padding: "10px 16px", flex: 1, justifyContent: "center", background: opt.isCorrect ? "var(--brand-primary)" : "var(--bg-secondary)", color: opt.isCorrect ? "white" : "var(--text-primary)", borderColor: opt.isCorrect ? "var(--brand-primary)" : "var(--border-primary)" }}>
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {type === "short_answer" && (
        <div>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Expected Answer (Exact match, case-insensitive)</label>
          <input required style={INPUT} value={expectedOutput} onChange={e => setExpectedOutput(e.target.value)} placeholder='e.g. "HyperText Markup Language"' />
        </div>
      )}

      {type === "fill_in_the_blank" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Blank Answers (In order)</label>
          {Array.from({ length: (question.match(/___/g) || []).length }).map((_, i) => (
            <input 
              key={i} 
              required 
              style={INPUT} 
              value={blankAnswers[i] || ""} 
              onChange={e => {
                const newA = [...blankAnswers];
                newA[i] = e.target.value;
                setBlankAnswers(newA);
              }} 
              placeholder={`Answer for blank ${i + 1}`} 
            />
          ))}
          {(question.match(/___/g) || []).length === 0 && (
            <p style={{ color: "#DC2626", fontSize: "12px", fontWeight: 600 }}>Please add `___` (three underscores) in the question text to create a blank.</p>
          )}
        </div>
      )}

      {type === "match_the_following" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Matching Pairs</label>
          {options.map((opt, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input style={INPUT} value={opt.text} placeholder="Left Side (e.g. HTML)" required
                onChange={e => setOptions(options.map((o, j) => j === i ? { ...o, text: e.target.value } : o))} />
              <ArrowRight size={14} color="var(--text-tertiary)" />
              <input style={INPUT} value={opt.matchTarget || ""} placeholder="Right Side (e.g. Markup)" required
                onChange={e => setOptions(options.map((o, j) => j === i ? { ...o, matchTarget: e.target.value } : o))} />
              {options.length > 2 && (
                <button type="button" onClick={() => setOptions(options.filter((_, j) => j !== i))}
                  style={{ ...BTN_GHOST, padding: "8px", color: "#DC2626" }}><X size={14} /></button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setOptions([...options, { text: "", isCorrect: true, matchTarget: "" }])}
            style={{ ...BTN_GHOST, alignSelf: "flex-start" }}><Plus size={14} /> Add Pair</button>
        </div>
      )}

      {type === "coding" && (
        <>
          <div>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Starter Code Template</label>
            <textarea value={codeTemplate} onChange={e => setCodeTemplate(e.target.value)}
              rows={5} style={{ ...INPUT, fontFamily: "monospace", fontSize: "13px", resize: "vertical" }} placeholder="// starter code here..." />
          </div>
          <div>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Expected Output / Keyword (for grading)</label>
            <input style={INPUT} value={expectedOutput} onChange={e => setExpectedOutput(e.target.value)} placeholder='e.g. "Hello World"' />
          </div>
        </>
      )}

      {err && <p style={{ color: "#DC2626", fontSize: "13px", fontWeight: 600 }}>⚠ {err}</p>}
      <button type="submit" disabled={pending} style={{ ...BTN_PRIMARY, opacity: pending ? 0.7 : 1, alignSelf: "flex-start" }}>
        <Save size={16} /> {pending ? "Saving..." : initial ? "Save Changes" : "Add Question"}
      </button>
    </form>
  );
}

function QuestionCard({ q, courseId, courseTitle, quizId, onDone, onMove, isFirst, isLast }: {
  q: Question; courseId: string; courseTitle: string; quizId: string;
  onDone: (msg: string) => void; onMove: (dir: "up" | "down") => void;
  isFirst: boolean; isLast: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [deleting, startDelete] = useTransition();

  const handleDelete = () => {
    if (!confirm("Delete this question?")) return;
    startDelete(async () => {
      await deleteQuestionAction(q.id, courseId);
      onDone("Question deleted.");
    });
  };

  return (
    <div style={{ ...CARD, position: "relative", opacity: deleting ? 0.5 : 1, transition: "opacity 0.2s" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        {/* Order controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", flexShrink: 0, marginTop: "2px" }}>
          <button type="button" onClick={() => onMove("up")} disabled={isFirst}
            style={{ ...BTN_GHOST, padding: "4px", opacity: isFirst ? 0.3 : 1 }}><ChevronUp size={14} /></button>
          <button type="button" onClick={() => onMove("down")} disabled={isLast}
            style={{ ...BTN_GHOST, padding: "4px", opacity: isLast ? 0.3 : 1 }}><ChevronDown size={14} /></button>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ background: q.question_type === "coding" ? "#F3E8FF" : q.question_type === "true_false" ? "#FEF9C3" : q.question_type === "short_answer" ? "#FCE7F3" : q.question_type === "fill_in_the_blank" ? "#E0E7FF" : q.question_type === "match_the_following" ? "#D1FAE5" : "#EFF6FF", color: q.question_type === "coding" ? "#9333EA" : q.question_type === "true_false" ? "#CA8A04" : q.question_type === "short_answer" ? "#DB2777" : q.question_type === "fill_in_the_blank" ? "#4F46E5" : q.question_type === "match_the_following" ? "#059669" : "#2563EB", padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 800 }}>
              {q.question_type === "coding" ? "CODING" : q.question_type === "true_false" ? "TRUE/FALSE" : q.question_type === "short_answer" ? "SHORT ANSWER" : q.question_type === "fill_in_the_blank" ? "FILL IN BLANKS" : q.question_type === "match_the_following" ? "MATCHING" : "MCQ"}
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 600 }}>Q{q.order_index + 1}</span>
          </div>

          {!editing ? (
            <>
              <p style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px", lineHeight: 1.5 }}>{q.question}</p>
              {(q.question_type === "multiple_choice" || q.question_type === "true_false") && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  {q.options?.map((opt, i) => (
                    <div key={i} style={{ padding: "6px 12px", borderRadius: "8px", border: `1px solid ${opt.isCorrect ? "var(--brand-primary)" : "var(--border-primary)"}`, background: opt.isCorrect ? "rgba(15,110,86,0.05)" : "var(--bg-secondary)", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                      {opt.isCorrect && <Check size={12} color="var(--brand-primary)" />}
                      <span style={{ color: "var(--text-primary)", fontWeight: opt.isCorrect ? 700 : 400 }}>{opt.text}</span>
                    </div>
                  ))}
                </div>
              )}
              {q.question_type === "short_answer" && (
                <div style={{ padding: "12px", background: "var(--bg-secondary)", border: "1px dashed var(--border-primary)", borderRadius: "8px", fontSize: "13px" }}>
                  <strong>Expected Answer:</strong> {q.expected_output}
                </div>
              )}
              {q.question_type === "fill_in_the_blank" && (
                <div style={{ padding: "12px", background: "var(--bg-secondary)", border: "1px dashed var(--border-primary)", borderRadius: "8px", fontSize: "13px" }}>
                  <strong>Blank Answers:</strong> {(() => {
                    try { return JSON.parse(q.expected_output ?? "").join(", "); } catch { return q.expected_output; }
                  })()}
                </div>
              )}
              {q.question_type === "match_the_following" && (
                <div style={{ padding: "12px", background: "var(--bg-secondary)", border: "1px dashed var(--border-primary)", borderRadius: "8px", fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <strong>Pairs:</strong>
                  {q.options?.map((opt, i) => (
                    <div key={i}>{opt.text} <ArrowRight size={12} style={{ display: "inline" }} /> {opt.matchTarget}</div>
                  ))}
                </div>
              )}
              {q.question_type === "coding" && q.code_template && (
                <pre style={{ background: "#0F172A", color: "#E2E8F0", padding: "12px", borderRadius: "8px", fontSize: "12px", overflow: "auto", marginTop: "8px" }}>{q.code_template}</pre>
              )}
            </>
          ) : (
            <QuestionForm courseId={courseId} courseTitle={courseTitle} quizId={quizId} initial={q}
              onDone={(msg) => { setEditing(false); onDone(msg); }} />
          )}
        </div>

        {/* Action buttons */}
        {!editing && (
          <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
            <button type="button" onClick={() => setEditing(true)} style={{ ...BTN_GHOST, padding: "8px" }}><Edit3 size={14} /></button>
            <button type="button" onClick={handleDelete} style={{ ...BTN_GHOST, padding: "8px", color: "#DC2626", borderColor: "#FECACA" }}><Trash2 size={14} /></button>
          </div>
        )}
        {editing && (
          <button type="button" onClick={() => setEditing(false)} style={{ ...BTN_GHOST, padding: "8px" }}><X size={14} /></button>
        )}
      </div>
    </div>
  );
}

export function ExamBuilder({ courseId, courseTitle, quizId: initialQuizId, initialQuestions, timeLimitMinutes, passingScore }: {
  courseId: string; courseTitle: string; quizId: string | null;
  initialQuestions: Question[]; timeLimitMinutes: number; passingScore: number;
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [timeLimit, setTimeLimit] = useState(timeLimitMinutes);
  const [passing, setPassing] = useState(passingScore);
  const [savingSettings, startSaveSettings] = useTransition();
  const [reordering, startReorder] = useTransition();
  const [isGenerating, startGenerating] = useTransition();

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleQuestionDone = (msg: string) => {
    setShowAdd(false);
    showToast(msg);
    // Reload page data via router
    setTimeout(() => window.location.reload(), 500);
  };

  const handleMove = (idx: number, dir: "up" | "down") => {
    const newQ = [...questions];
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    [newQ[idx], newQ[swapIdx]] = [newQ[swapIdx], newQ[idx]];
    const reindexed = newQ.map((q, i) => ({ ...q, order_index: i }));
    setQuestions(reindexed);
    startReorder(async () => {
      const { reorderQuestionsAction } = await import("@/app/instructor/courses/[id]/exam/actions");
      await reorderQuestionsAction(reindexed.map(q => q.id), courseId);
    });
  };

  const handleSaveSettings = () => {
    if (!initialQuizId) return showToast("Add a question first to create the exam.", "error");
    const fd = new FormData();
    fd.set("quizId", initialQuizId);
    fd.set("courseId", courseId);
    fd.set("timeLimitMinutes", timeLimit.toString());
    fd.set("passingScore", passing.toString());
    startSaveSettings(async () => {
      const res = await updateExamSettingsAction(fd);
      if ((res as any)?.error) showToast((res as any).error, "error");
      else showToast("Settings saved!");
    });
  };

  const handleGenerateAI = () => {
    if (!confirm(`This will generate 20 questions using AI for "${courseTitle}". Proceed?`)) return;
    startGenerating(async () => {
      const res = await generateExamWithAIAction(courseId, courseTitle, 20);
      if (res.error) {
        showToast(res.error, "error");
      } else {
        showToast("Questions generated successfully!");
        setTimeout(() => window.location.reload(), 1000);
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 900, color: "var(--text-primary)" }}>Final Exam Builder</h2>
          <p style={{ color: "var(--text-tertiary)", fontSize: "14px", marginTop: "4px" }}>
            {questions.length} question{questions.length !== 1 ? "s" : ""} · {timeLimit} min · Pass at {passing}%
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={handleGenerateAI} disabled={isGenerating} style={{ ...BTN_GHOST, background: "rgba(147, 51, 234, 0.1)", color: "#9333EA", borderColor: "rgba(147, 51, 234, 0.3)" }}>
            <Sparkles size={16} /> {isGenerating ? "Generating..." : "Auto Generate AI"}
          </button>
          <button onClick={() => setShowAdd(!showAdd)} style={{ ...BTN_PRIMARY }}>
            {showAdd ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Question</>}
          </button>
        </div>
      </div>

      {/* Settings Card */}
      <div style={CARD}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <Settings size={18} color="var(--brand-primary)" />
          <h3 style={{ fontWeight: 800, fontSize: "16px" }}>Exam Settings</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Time Limit (minutes)</label>
            <input type="number" min={5} max={180} value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))}
              style={{ ...INPUT, width: "120px" }} />
          </div>
          <div>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Passing Score (%)</label>
            <input type="number" min={1} max={100} value={passing} onChange={e => setPassing(Number(e.target.value))}
              style={{ ...INPUT, width: "120px" }} />
          </div>
        </div>
        <button onClick={handleSaveSettings} disabled={savingSettings}
          style={{ ...BTN_PRIMARY, marginTop: "16px", opacity: savingSettings ? 0.7 : 1 }}>
          <Save size={16} /> {savingSettings ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* Add Question Form */}
      {showAdd && (
        <div style={{ ...CARD, border: "2px solid var(--brand-primary)" }}>
          <h3 style={{ fontWeight: 800, fontSize: "16px", marginBottom: "20px", color: "var(--brand-primary)" }}>New Question</h3>
          <QuestionForm courseId={courseId} courseTitle={courseTitle} quizId={initialQuizId}
            onDone={handleQuestionDone} />
        </div>
      )}

      {/* Questions List */}
      {questions.length === 0 ? (
        <div style={{ ...CARD, textAlign: "center", padding: "60px 40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📝</div>
          <h3 style={{ fontWeight: 800, marginBottom: "8px" }}>No questions yet</h3>
          <p style={{ color: "var(--text-tertiary)", marginBottom: "24px" }}>Click "Add Question" to create the first exam question.</p>
          <button onClick={() => setShowAdd(true)} style={BTN_PRIMARY}><Plus size={16} /> Add First Question</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {questions.map((q, i) => (
            <QuestionCard key={q.id} q={q} courseId={courseId} courseTitle={courseTitle}
              quizId={initialQuizId || ""} onDone={handleQuestionDone}
              onMove={(dir) => handleMove(i, dir)} isFirst={i === 0} isLast={i === questions.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}
