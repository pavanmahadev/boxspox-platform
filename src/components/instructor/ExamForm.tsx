"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Clock, Settings2, GripVertical, Sparkles, X, Save } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

interface ExamFormProps {
  initialData?: {
    exam: any;
    questions: any[];
  };
  onSubmit: (exam: any, questions: any[]) => Promise<void>;
  submitLabel?: string;
}

export default function ExamForm({ initialData, onSubmit, submitLabel = "Save Exam" }: ExamFormProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [exam, setExam] = useState({
    title: "",
    description: "",
    passing_score: 70,
    time_limit_minutes: 60,
    is_published: false
  });

  const [questions, setQuestions] = useState<any[]>([
    { question_type: "multiple_choice", question_text: "", options: ["", "", "", ""], correct_answer: "", points: 1 }
  ]);

  useEffect(() => {
    if (initialData?.exam) {
      setExam({
        title: initialData.exam.title || "",
        description: initialData.exam.description || "",
        passing_score: initialData.exam.passing_score || 70,
        time_limit_minutes: initialData.exam.time_limit_minutes || 60,
        is_published: initialData.exam.is_published || false
      });
    }

    if (initialData?.questions && initialData.questions.length > 0) {
      const formattedQs = initialData.questions.map((q: any) => {
        let parsedOptions = q.options;
        let parsedAnswer = q.correct_answer;

        if (q.question_type === "match_the_following") {
          // Convert from DB format {left: [], right: []} to UI format [{left, right}]
          const uiOptions = [];
          if (parsedOptions?.left && parsedOptions?.right) {
            for (let i = 0; i < parsedOptions.left.length; i++) {
              uiOptions.push({ left: parsedOptions.left[i], right: parsedOptions.right[i] });
            }
          }
          parsedOptions = uiOptions.length > 0 ? uiOptions : [{ left: "", right: "" }, { left: "", right: "" }];
        } else if (q.question_type === "coding") {
          // Ensure structure
          if (!parsedOptions || !parsedOptions[0]) {
            parsedOptions = [{ function_name: "myFunc", starter_code: "// Write your code here", test_cases: [] }];
          }
        }

        return {
          id: q.id, // preserve ID if needed
          question_type: q.question_type,
          question_text: q.question_text,
          options: parsedOptions,
          correct_answer: parsedAnswer,
          points: q.points
        };
      });
      setQuestions(formattedQs);
    }
  }, [initialData]);

  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPrompt, setAIPrompt] = useState("");
  const [aiCount, setAiCount] = useState(3);
  const [generatingAI, setGeneratingAI] = useState(false);

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return showToast("Please enter a topic or text", "error");
    setGeneratingAI(true);
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, count: aiCount })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate questions");
      
      if (data.questions && Array.isArray(data.questions)) {
        setQuestions([...questions, ...data.questions]);
        showToast(`Successfully generated ${data.questions.length} questions!`, "success");
        setShowAIPanel(false);
        setAIPrompt("");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message, "error");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { question_type: "multiple_choice", question_text: "", options: ["", "", "", ""], correct_answer: "", points: 1 }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    const newQ = [...questions];
    newQ.splice(index, 1);
    setQuestions(newQ);
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQ = [...questions];
    newQ[index][field] = value;
    
    // Reset state based on type change
    if (field === "question_type") {
      if (value === "multiple_choice") {
        newQ[index].options = ["", "", "", ""];
        newQ[index].correct_answer = "";
      } else if (value === "fill_in_the_blank") {
        newQ[index].options = [];
        newQ[index].correct_answer = "";
      } else if (value === "match_the_following") {
        newQ[index].options = [{ left: "", right: "" }, { left: "", right: "" }];
        newQ[index].correct_answer = "";
      } else if (value === "coding") {
        newQ[index].options = [{ 
          function_name: "myFunc", 
          starter_code: "// Write your code here", 
          test_cases: [{ input: "", expected_output: "", is_hidden: false }] 
        }];
        newQ[index].correct_answer = "";
      }
    }
    
    setQuestions(newQ);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: any, field?: string) => {
    const newQ = [...questions];
    if (newQ[qIndex].question_type === "match_the_following" && field) {
      newQ[qIndex].options[oIndex][field] = value;
    } else {
      newQ[qIndex].options[oIndex] = value;
    }
    setQuestions(newQ);
  };

  const handleAddMatchPair = (qIndex: number) => {
    const newQ = [...questions];
    newQ[qIndex].options.push({ left: "", right: "" });
    setQuestions(newQ);
  };

  const handleRemoveMatchPair = (qIndex: number, oIndex: number) => {
    const newQ = [...questions];
    newQ[qIndex].options.splice(oIndex, 1);
    setQuestions(newQ);
  };

  const handleCodingOptionChange = (qIndex: number, field: string, value: any) => {
    const newQ = [...questions];
    newQ[qIndex].options[0][field] = value;
    setQuestions(newQ);
  };
  
  const handleCodingTestCaseChange = (qIndex: number, tIndex: number, field: string, value: any) => {
    const newQ = [...questions];
    newQ[qIndex].options[0].test_cases[tIndex][field] = value;
    setQuestions(newQ);
  };

  const handleAddTestCase = (qIndex: number) => {
    const newQ = [...questions];
    newQ[qIndex].options[0].test_cases.push({ input: "", expected_output: "", is_hidden: false });
    setQuestions(newQ);
  };

  const handleRemoveTestCase = (qIndex: number, tIndex: number) => {
    const newQ = [...questions];
    newQ[qIndex].options[0].test_cases.splice(tIndex, 1);
    setQuestions(newQ);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exam.title) return showToast("Please enter an exam title", "error");
    
    // Validate questions
    for (let i=0; i<questions.length; i++) {
      const q = questions[i];
      if (!q.question_text) return showToast(`Question ${i+1} is missing text`, "error");
      
      if (q.question_type === "multiple_choice") {
        if (!q.correct_answer) return showToast(`Question ${i+1} has no correct answer selected`, "error");
        if (q.options.some((o: string) => !o.trim())) return showToast(`Question ${i+1} has empty options`, "error");
      } else if (q.question_type === "fill_in_the_blank") {
        if (!q.correct_answer.trim()) return showToast(`Question ${i+1} needs a correct answer`, "error");
      } else if (q.question_type === "match_the_following") {
        if (q.options.length < 2) return showToast(`Question ${i+1} needs at least 2 pairs`, "error");
        if (q.options.some((o: any) => !o.left.trim() || !o.right.trim())) return showToast(`Question ${i+1} has incomplete pairs`, "error");
      } else if (q.question_type === "coding") {
        const codingOpt = q.options[0];
        if (!codingOpt || !String(codingOpt.function_name).trim()) return showToast(`Question ${i+1} needs a function name`, "error");
        if (!codingOpt.test_cases || codingOpt.test_cases.length === 0) return showToast(`Question ${i+1} needs at least 1 test case`, "error");
        if (codingOpt.test_cases.some((tc: any) => !String(tc.input || "").trim() || !String(tc.expected_output || "").trim())) return showToast(`Question ${i+1} has incomplete test cases`, "error");
      }
    }

    setLoading(true);
    try {
      await onSubmit(exam, questions);
    } catch (err: any) {
      console.error("Exam form submission error:", err);
      showToast(`❌ ${err.message || "An error occurred"}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Exam Settings */}
      <div style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "32px", border: "1px solid var(--border-primary)", marginBottom: "32px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Settings2 size={20} color="var(--brand-primary)" /> Basic Settings
        </h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>Exam Title</label>
            <input 
              value={exam.title || ""} onChange={e => setExam({...exam, title: e.target.value})}
              type="text" placeholder="e.g. React Mastery Final Exam" required
              style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "15px", outline: "none" }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>Description / Instructions</label>
            <textarea 
              value={exam.description || ""} onChange={e => setExam({...exam, description: e.target.value})}
              placeholder="Instructions for the students..." rows={3}
              style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "15px", outline: "none", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>Time Limit (minutes)</label>
              <div style={{ position: "relative" }}>
                <Clock size={18} color="var(--text-tertiary)" style={{ position: "absolute", left: "14px", top: "14px" }} />
                <input 
                  value={exam.time_limit_minutes} onChange={e => setExam({...exam, time_limit_minutes: parseInt(e.target.value) || 0})}
                  type="number" min="1" required
                  style={{ width: "100%", padding: "14px 14px 14px 44px", borderRadius: "12px", border: "1px solid var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "15px", outline: "none" }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>Passing Score (%)</label>
              <input 
                value={exam.passing_score} onChange={e => setExam({...exam, passing_score: parseInt(e.target.value) || 0})}
                type="number" min="1" max="100" required
                style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "15px", outline: "none" }}
              />
            </div>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px", padding: "16px", background: "var(--bg-secondary)", borderRadius: "12px", border: "1px solid var(--border-primary)" }}>
             <input 
               type="checkbox" 
               id="publish"
               checked={exam.is_published}
               onChange={e => setExam({...exam, is_published: e.target.checked})}
               style={{ width: "18px", height: "18px", accentColor: "var(--brand-primary)" }}
             />
             <label htmlFor="publish" style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", cursor: "pointer" }}>
               Publish Immediately (Visible to students)
             </label>
          </div>
        </div>
      </div>

      {/* Questions Builder */}
      <div style={{ display: "flex", alignItems: "center", justifyItems: "space-between", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 800, flex: 1 }}>
          Questions ({questions.length})
        </h2>
        <div style={{ display: "flex", gap: "12px" }}>
          <button type="button" onClick={() => setShowAIPanel(!showAIPanel)} style={{
            padding: "8px 16px", background: "linear-gradient(135deg, #6366f1, #a855f7)", border: "none", borderRadius: "8px",
            color: "white", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer"
          }}>
            <Sparkles size={16} /> Generate with AI
          </button>
          <button type="button" onClick={handleAddQuestion} style={{
            padding: "8px 16px", background: "var(--brand-primary)", border: "none", borderRadius: "8px",
            color: "white", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer"
          }}>
            <Plus size={16} /> Add Question
          </button>
        </div>
      </div>

      {/* AI Generation Panel */}
      {showAIPanel && (
        <div style={{ background: "rgba(99, 102, 241, 0.05)", border: "1px solid rgba(99, 102, 241, 0.2)", borderRadius: "16px", padding: "24px", marginBottom: "24px", position: "relative" }}>
          <button type="button" onClick={() => setShowAIPanel(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer" }}><X size={20} /></button>
          <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#6366f1", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Sparkles size={18} /> AI Question Generator
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>Paste your course notes, syllabus, or simply type a topic. The AI will automatically generate mixed question types for you.</p>
          
          <textarea 
            value={aiPrompt} onChange={e => setAIPrompt(e.target.value)}
            placeholder="e.g. Create questions about React Hooks, specifically useState and useEffect..." rows={4}
            style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "1px solid rgba(99, 102, 241, 0.3)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: "14px", outline: "none", resize: "vertical", marginBottom: "16px" }}
          />
          
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>Count:</label>
              <input 
                type="number" min="1" max="20" value={aiCount} onChange={e => setAiCount(parseInt(e.target.value) || 3)}
                style={{ width: "70px", padding: "8px", borderRadius: "8px", border: "1px solid var(--border-primary)", background: "var(--bg-card)", color: "var(--text-primary)", textAlign: "center" }}
              />
            </div>
            <button type="button" onClick={handleGenerateAI} disabled={generatingAI} style={{
              padding: "10px 24px", background: "#6366f1", color: "white", borderRadius: "8px", border: "none", fontWeight: 700, fontSize: "14px", cursor: generatingAI ? "not-allowed" : "pointer", opacity: generatingAI ? 0.7 : 1
            }}>
              {generatingAI ? "Generating..." : "Generate Questions"}
            </button>
          </div>
        </div>
      )}

      {questions.map((q, qIndex) => (
        <div key={qIndex} style={{ background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border-primary)", marginBottom: "24px", position: "relative", overflow: "hidden" }}>
          {/* Question Header */}
          <div style={{ background: "var(--bg-secondary)", padding: "16px 24px", borderBottom: "1px solid var(--border-primary)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--brand-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "13px" }}>
                {qIndex + 1}
              </div>
              <select 
                value={q.question_type}
                onChange={e => handleQuestionChange(qIndex, "question_type", e.target.value)}
                style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--border-primary)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: "14px", fontWeight: 700, outline: "none", cursor: "pointer" }}
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="fill_in_the_blank">Fill in the Blank</option>
                <option value="match_the_following">Match the Following</option>
                <option value="coding">Coding Exercise</option>
              </select>
            </div>
            
            {questions.length > 1 && (
              <button type="button" onClick={() => handleRemoveQuestion(qIndex)} style={{
                background: "none", border: "none", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 600
              }}>
                <Trash2 size={16} /> Remove
              </button>
            )}
          </div>

          <div style={{ padding: "24px" }}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>Question Text / Prompt</label>
              <textarea 
                value={q.question_text || ""} onChange={e => handleQuestionChange(qIndex, "question_text", e.target.value)}
                placeholder="Enter the question or problem statement here..." required rows={2}
                style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "1px solid var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "15px", outline: "none", fontWeight: 500, resize: "vertical" }}
              />
              {q.question_type === "fill_in_the_blank" && (
                <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "8px" }}>
                  Tip: Use underscores (e.g., "______") to represent the blank in your question text.
                </p>
              )}
            </div>

            {/* MULTIPLE CHOICE */}
            {q.question_type === "multiple_choice" && (
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>Options (Select the correct one)</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {q.options.map((opt: string, oIndex: number) => (
                    <div key={oIndex} style={{ display: "flex", alignItems: "center", gap: "12px", background: q.correct_answer === opt && opt !== "" ? "rgba(15,110,86,0.05)" : "var(--bg-secondary)", padding: "8px 12px", borderRadius: "10px", border: `1px solid ${q.correct_answer === opt && opt !== "" ? "var(--brand-primary)" : "var(--border-primary)"}` }}>
                      <input 
                        type="radio" name={`correct-${qIndex}`}
                        checked={q.correct_answer === opt && opt !== ""}
                        onChange={() => handleQuestionChange(qIndex, "correct_answer", opt)}
                        style={{ width: "18px", height: "18px", accentColor: "var(--brand-primary)", cursor: "pointer" }}
                      />
                      <input 
                        value={opt || ""} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                        type="text" placeholder={`Option ${oIndex + 1}`} required
                        style={{ width: "100%", background: "transparent", border: "none", color: "var(--text-primary)", fontSize: "14px", outline: "none" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FILL IN THE BLANK */}
            {q.question_type === "fill_in_the_blank" && (
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>Correct Answer</label>
                <input 
                  value={q.correct_answer || ""} onChange={e => handleQuestionChange(qIndex, "correct_answer", e.target.value)}
                  type="text" placeholder="The exact text or word expected..." required
                  style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "1px solid var(--brand-primary)", background: "rgba(15,110,86,0.02)", color: "var(--text-primary)", fontSize: "15px", outline: "none" }}
                />
                <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "8px" }}>Note: Grading will ignore case sensitivity and extra spaces.</p>
              </div>
            )}

            {/* MATCH THE FOLLOWING */}
            {q.question_type === "match_the_following" && (
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>Matching Pairs (Left = Right)</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                  {q.options.map((pair: any, oIndex: number) => (
                    <div key={oIndex} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <GripVertical size={16} color="var(--text-tertiary)" style={{ cursor: "grab" }} />
                      <input 
                        value={pair.left || ""} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value, "left")}
                        type="text" placeholder="Left item (e.g. Apple)" required
                        style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid var(--border-primary)", background: "var(--bg-secondary)", fontSize: "14px", outline: "none" }}
                      />
                      <span style={{ fontWeight: 800, color: "var(--text-tertiary)" }}>=</span>
                      <input 
                        value={pair.right || ""} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value, "right")}
                        type="text" placeholder="Right matching item (e.g. Red)" required
                        style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid var(--brand-primary)", background: "rgba(15,110,86,0.02)", fontSize: "14px", outline: "none" }}
                      />
                      <button type="button" onClick={() => handleRemoveMatchPair(qIndex, oIndex)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer" }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => handleAddMatchPair(qIndex)} style={{ padding: "8px 16px", borderRadius: "8px", background: "var(--bg-secondary)", border: "1px dashed var(--border-primary)", color: "var(--text-primary)", fontSize: "13px", fontWeight: 600, cursor: "pointer", width: "100%" }}>
                  + Add Pair
                </button>
              </div>
            )}

            {/* CODING EXERCISE */}
            {q.question_type === "coding" && q.options[0] && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--brand-primary)", marginBottom: "8px" }}>Function Name (e.g. isPalindrome)</label>
                  <input 
                    value={q.options[0].function_name || ""} onChange={e => handleCodingOptionChange(qIndex, "function_name", e.target.value)}
                    type="text" placeholder="isPalindrome" required
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "14px", outline: "none", fontFamily: "monospace" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>Starter Code (Visible to student)</label>
                  <textarea 
                    value={q.options[0].starter_code || ""} onChange={e => handleCodingOptionChange(qIndex, "starter_code", e.target.value)}
                    placeholder="function isPalindrome(s) { ... }" rows={4}
                    style={{ width: "100%", padding: "16px", borderRadius: "10px", border: "1px solid #374151", background: "#1f2937", color: "#f3f4f6", fontSize: "14px", fontFamily: "monospace", outline: "none", resize: "vertical" }}
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>Test Cases (Inputs vs Expected Output)</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                    {q.options[0].test_cases?.map((tc: any, tIndex: number) => (
                      <div key={tIndex} style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--bg-secondary)", padding: "12px", borderRadius: "12px", border: "1px solid var(--border-primary)" }}>
                        <input 
                          value={tc.input || ""} onChange={e => handleCodingTestCaseChange(qIndex, tIndex, "input", e.target.value)}
                          type="text" placeholder="Input (e.g. 'racecar', or 5, 10)" required
                          style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid var(--border-primary)", background: "var(--bg-card)", fontSize: "13px", outline: "none", fontFamily: "monospace" }}
                        />
                        <span style={{ fontWeight: 800, color: "var(--text-tertiary)" }}>{"=>"}</span>
                        <input 
                          value={tc.expected_output || ""} onChange={e => handleCodingTestCaseChange(qIndex, tIndex, "expected_output", e.target.value)}
                          type="text" placeholder="Output (e.g. true)" required
                          style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid var(--brand-primary)", background: "rgba(15,110,86,0.02)", fontSize: "13px", outline: "none", fontFamily: "monospace" }}
                        />
                        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)", cursor: "pointer" }}>
                          <input 
                            type="checkbox" checked={tc.is_hidden || false} onChange={e => handleCodingTestCaseChange(qIndex, tIndex, "is_hidden", e.target.checked)}
                            style={{ accentColor: "var(--brand-primary)" }}
                          />
                          Hidden
                        </label>
                        <button type="button" onClick={() => handleRemoveTestCase(qIndex, tIndex)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", padding: "4px" }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => handleAddTestCase(qIndex)} style={{ padding: "8px 16px", borderRadius: "8px", background: "var(--bg-secondary)", border: "1px dashed var(--border-primary)", color: "var(--text-primary)", fontSize: "13px", fontWeight: 600, cursor: "pointer", width: "100%" }}>
                    + Add Test Case
                  </button>
                </div>
              </div>
            )}
            
            <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px dashed var(--border-primary)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px" }}>
              <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Points assigned:</label>
              <input 
                type="number" min="1" value={q.points} onChange={e => handleQuestionChange(qIndex, "points", parseInt(e.target.value) || 1)}
                style={{ width: "80px", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontWeight: 700 }}
              />
            </div>
          </div>
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
        <button type="submit" disabled={loading} style={{
          padding: "18px 64px",
          background: "var(--brand-primary)",
          color: "white",
          borderRadius: "16px",
          border: "none",
          fontSize: "16px",
          fontWeight: 800,
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          boxShadow: "0 8px 24px rgba(15, 110, 86, 0.25)",
          opacity: loading ? 0.7 : 1,
          transition: "transform 0.2s"
        }}>
          {loading ? "Saving..." : <><Save size={20} /> {submitLabel}</>}
        </button>
      </div>
    </form>
  );
}
