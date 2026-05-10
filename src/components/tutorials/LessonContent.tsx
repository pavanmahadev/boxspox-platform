"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Clock,
  CheckCircle2,
  Circle,
  Loader2,
  Globe,
  Zap,
  HelpCircle,
  Video,
  FileCode,
  FileText,
  Menu,
  X,
  Mail,
  User,
  Code2
} from "lucide-react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { fetchQuizAction, fetchUserProgressAction } from "@/app/tutorials/actions";
import { useToast } from "@/components/ui/ToastProvider";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Skeleton, LessonItemSkeleton } from "@/components/ui/Skeleton";
import { broadcastAnnouncement } from "@/utils/realtime";

const Discussion = dynamic(() => import("./Discussion"), { ssr: false, loading: () => null });
const LessonNotes = dynamic(() => import("./LessonNotes"), { ssr: false, loading: () => null });
import { PresenceIndicator } from "./PresenceIndicator";

const SandpackEditor = dynamic<any>(() => import("@/components/editor/SandpackEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-900 animate-pulse rounded-xl flex items-center justify-center border border-gray-800 mt-6 mb-8">
      <div className="text-gray-500 font-medium">Loading interactive editor...</div>
    </div>
  ),
});

interface Lesson {
  id: string;
  title: string;
  slug: string;
  content: string;
  code_template: string;
  order_index: number;
  video_url?: string;
  lesson_type?: string;
  duration_minutes?: number;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  image_url: string;
  modules?: any[];
}

interface LessonContentProps {
  course: Course;
  lesson: Lesson;
  allLessons: Lesson[];
  gradient: string;
  currentUserId?: string;
  ad?: {
    id: string;
    title: string;
    image_url: string;
    link_url: string;
    status: string;
  } | null;
}

export function LessonContent({ course, lesson, allLessons, ad }: LessonContentProps) {
  const [user, setUser] = useState<any>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const { showToast } = useToast();
  const supabase = createClient();
  const router = useRouter();

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiHistory, setAiHistory] = useState<{ role: string; content: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const [hinglishMode, setHinglishMode] = useState(false);
  const [hinglishContent, setHinglishContent] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const [quiz, setQuiz] = useState<any>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await fetchQuizAction(lesson.id);
        if (data) {
          setQuiz({
            ...data,
            questions: data.questions.sort((a: any, b: any) => a.order_index - b.order_index)
          });
        }
      } catch (err) {
        console.error("Error fetching quiz:", err);
      }
    };
    fetchQuiz();

    const loadData = async () => {
      try {
        const { user, completedIds } = await fetchUserProgressAction();
        if (user) {
          setUser(user);
          setCompletedIds(completedIds);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    loadData();
  }, [lesson.id, supabase]);

  const isCompleted = (id: string) => completedIds.includes(id);

  const handleToggleComplete = async () => {
    if (!user) {
      showToast("Please login to save progress", "error");
      router.push("/login");
      return;
    }

    if (quiz && !isCompleted(lesson.id) && !quizResults?.passed) {
      setQuizOpen(true);
      return;
    }

    setActionLoading(true);
    const completed = isCompleted(lesson.id);
    const prevIds = [...completedIds];

    // Optimistic Update
    if (completed) {
      setCompletedIds(prev => prev.filter(id => id !== lesson.id));
    } else {
      setCompletedIds(prev => [...prev, lesson.id]);
    }

    try {
      if (completed) {
        const { error } = await supabase.from("user_progress").delete().eq("user_id", user.id).eq("lesson_id", lesson.id);
        if (error) throw error;
        showToast("Progress removed", "info");
      } else {
        const { error } = await supabase.from("user_progress").upsert({ 
          user_id: user.id, 
          lesson_id: lesson.id, 
          course_id: course.id,
          completed_at: new Date().toISOString()
        }, { onConflict: 'user_id,lesson_id' });

        if (error) throw error;
        
        showToast("Lesson marked as complete!", "success");
        broadcastAnnouncement(`${user.email?.split('@')[0]} just completed "${lesson.title}"!`, 'success');
        
        if (nextLesson) {
           setTimeout(() => router.push(`/tutorials/${course.slug}/${nextLesson.slug}`), 1500);
        }
      }
    } catch (err: any) {
      const errorMsg = err.message || JSON.stringify(err);
      console.error(`Progress error detailed: ${errorMsg}`, err);
      setCompletedIds(prevIds); // Rollback
      showToast("Failed to sync progress. Please check your connection.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // 9. Progress Tracking Autosave
  useEffect(() => {
    if (!user || completedIds.includes(lesson.id)) return;

    const autosaveTimer = setTimeout(async () => {
      try {
        console.log("[Autosave] Syncing progress for lesson:", lesson.title);
        // We could track time spent here
        await supabase.from("user_progress").upsert({ 
          user_id: user.id, 
          lesson_id: lesson.id, 
          course_id: course.id,
          last_accessed: new Date().toISOString()
        }, { onConflict: 'user_id,lesson_id' });
      } catch (err) {
        console.error("Autosave failed:", err);
      }
    }, 30000); // Autosave after 30 seconds of engagement

    return () => clearTimeout(autosaveTimer);
  }, [lesson.id, user, completedIds, supabase, course.id]);

  const handleQuizSubmit = (answers: any[]) => {
    let correctCount = 0;
    quiz.questions.forEach((q: any, i: number) => {
      const selectedIdx = answers[i];
      if (selectedIdx !== null && q.options[selectedIdx]?.isCorrect) {
        correctCount++;
      }
    });
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= (quiz.passing_score || 70);
    setQuizResults({ score, passed, correctCount, total: quiz.questions.length });
    
    // Save attempt to DB
    if (user) {
      supabase.from("quiz_attempts").insert({
        user_id: user.id,
        quiz_id: quiz.id,
        score,
        passed,
        metadata: { answers }
      }).then(({ error }: { error: any }) => {
        if (error) {
          console.error("Failed to save quiz attempt detailed:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
        }
      });
    }

    if (passed) {
      showToast(`Quiz Passed! Score: ${score}%`, "success", "Excellent Job!");
      if (!isCompleted(lesson.id)) {
        handleToggleComplete();
      }
    } else {
      showToast(`Quiz failed (${score}%). Try again to complete the lesson.`, "error", "Keep Trying!");
    }
  };

  const handleToggleHinglish = async () => {
    if (hinglishMode) {
      setHinglishMode(false);
      return;
    }
    setHinglishMode(true);
    if (hinglishContent) return;

    setIsTranslating(true);
    try {
      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: lesson.content })
      });
      const data = await res.json();
      if (data.translated) setHinglishContent(data.translated);
    } catch (err) {
      showToast("Translation failed", "error");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || aiLoading) return;

    const userMessage = { role: "user", content: aiQuestion };
    setAiHistory(prev => [...prev, userMessage]);
    setAiQuestion("");
    setAiLoading(true);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: aiQuestion,
          lessonTitle: lesson.title,
          lessonContent: lesson.content,
          history: aiHistory
        })
      });
      const data = await res.json();
      if (data.answer) setAiHistory(prev => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (aiSummary) return;
    
    setIsSummarizing(true);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonContent: lesson.content })
      });
      const data = await res.json();
      if (data.summary) setAiSummary(data.summary);
    } catch (err) {
      showToast("Failed to generate summary", "error");
    } finally {
      setIsSummarizing(false);
    }
  };

  const lessonIdx = allLessons.findIndex(l => l.id === lesson.id);
  const prevLesson = lessonIdx > 0 ? allLessons[lessonIdx - 1] : null;
  const nextLesson = lessonIdx < allLessons.length - 1 ? allLessons[lessonIdx + 1] : null;

  return (
    <div className="lesson-page-container" style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Mobile Top Bar */}
      <div className="mobile-lesson-nav" style={{
        position: "sticky",
        top: "108px",
        zIndex: 500,
        background: "#FFFFFF",
        borderBottom: "1px solid var(--border-primary)",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        width: "100%",
        left: 0,
        boxSizing: "border-box"
      }}>
        <style>{`
          @media (min-width: 901px) {
            .mobile-lesson-nav { display: none !important; }
          }
          @media (max-width: 900px) {
            .mobile-lesson-nav { display: flex !important; }
          }
        `}</style>
        <button 
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--brand-primary)", border: "none", color: "white", padding: "8px 16px", borderRadius: "8px", fontWeight: 700, fontSize: "13px" }}
        >
          <Menu size={16} /> Menu
        </button>
        <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
          {lessonIdx + 1} / {allLessons.length}
        </div>
      </div>

      {/* Content Spacer for Fixed Nav */}
      <div style={{ height: "108px" }} />

      <div className="lesson-page-grid" style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr 300px",
        minHeight: "calc(100vh - 108px)",
        position: "relative"
      }}>
        <style>{`
          .lesson-page-grid {
            display: grid;
            grid-template-columns: 280px 1fr 320px;
            position: relative;
          }
          
          @media (max-width: 1200px) {
            .lesson-page-grid { grid-template-columns: 280px 1fr !important; }
            .right-sidebar { display: none !important; }
          }
          
          @media (max-width: 900px) {
            .lesson-page-grid { grid-template-columns: 1fr !important; }
            .left-sidebar { 
              position: fixed !important; 
              left: 0; 
              top: 108px !important; 
              width: 280px; 
              height: calc(100vh - 108px) !important;
              transform: translateX(-100%);
              transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              z-index: 1000 !important;
            }
            .left-sidebar.mobile-open { transform: translateX(0); }
          }
        `}</style>
        {/* Left Sidebar */}
        <aside 
          className={`left-sidebar ${mobileNavOpen ? 'mobile-open' : ''}`}
          style={{
            borderRight: "1px solid var(--border-primary)",
            background: "#F8FAFC",
            overflowY: "auto",
            position: "sticky",
            top: "108px",
            height: "calc(100vh - 108px)",
            zIndex: 600
          }}
        >
          {/* User Profile Section (Matching User's Screenshot) */}
          <div style={{ padding: "20px", borderBottom: "1px solid #E2E8F0", background: "white" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                🦊
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "#0F172A", fontSize: "14px" }}>Pavan m MCA OMBR</div>
                <Link href="/dashboard" style={{ fontSize: "12px", color: "var(--brand-primary)", textDecoration: "none", fontWeight: 600 }}>Open profile &gt;</Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: "flex", gap: "6px" }}>
              <div style={{ flex: 1, background: "white", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "8px", textAlign: "center" }}>
                <span style={{ fontSize: "9px", fontWeight: 700, color: "#64748B", display: "block", textTransform: "uppercase" }}>XP</span>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A" }}>70</span>
              </div>
              <div style={{ flex: 1, background: "white", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "10px", textAlign: "center" }}>
                <span style={{ fontSize: "9px", fontWeight: 700, color: "#64748B", display: "block", textTransform: "uppercase" }}>Coins</span>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A" }}>1000</span>
              </div>
              <div style={{ flex: 1, background: "white", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "10px", textAlign: "center" }}>
                <span style={{ fontSize: "9px", fontWeight: 700, color: "#64748B", display: "block", textTransform: "uppercase" }}>⚡</span>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A" }}>1</span>
              </div>
            </div>
          </div>

          <div style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: "1.5px", marginBottom: "16px" }}>
              CURRICULUM
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {allLessons.length === 0 ? (
                Array(5).fill(0).map((_, i) => <LessonItemSkeleton key={i} />)
              ) : (
                allLessons.map((l, idx) => (
                  <Link
                    key={l.id}
                    href={`/tutorials/${course.slug}/${l.slug}`}
                    onClick={() => setMobileNavOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: l.id === lesson.id ? 700 : 500,
                      color: l.id === lesson.id ? "var(--brand-primary)" : "var(--text-secondary)",
                      background: l.id === lesson.id ? "rgba(15, 110, 86, 0.08)" : "transparent",
                      border: l.id === lesson.id ? "1px solid rgba(15, 110, 86, 0.2)" : "1px solid transparent"
                    }}
                  >
                    <span style={{ fontSize: "11px", opacity: 0.5, width: "16px" }}>{idx + 1}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title}</span>
                    {isCompleted(l.id) && <CheckCircle2 size={14} style={{ marginLeft: "auto", color: "#10B981" }} />}
                  </Link>
                ))
              )}

              {/* Final Exam Module */}
              <div style={{ marginTop: "16px", borderTop: "1px solid #E2E8F0", paddingTop: "16px" }}>
                <Link
                  href={`/tutorials/${course.slug}/exam`}
                  onClick={() => setMobileNavOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    textDecoration: "none",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "white",
                    background: "var(--brand-primary)",
                    boxShadow: "0 4px 12px rgba(15, 110, 86, 0.2)",
                    transition: "transform 0.2s"
                  }}
                >
                  <span style={{ fontSize: "16px" }}>🏆</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Final Certification Exam</span>
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Backdrop */}
        {mobileNavOpen && (
          <div 
            onClick={() => setMobileNavOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 550, backdropFilter: "blur(4px)" }}
          />
        )}

        {/* Main Content Area */}
        <main style={{ padding: "clamp(32px, 8vw, 60px) var(--container-padding)", maxWidth: "1000px", margin: "0 auto", width: "100%", minWidth: 0 }}>
          {/* Presence and Header */}
          <div style={{ marginBottom: "32px" }}>
            <PresenceIndicator lessonId={lesson.id} user={user} />
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "24px" }}>
              <div style={{ flex: "1 1 300px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", color: "var(--text-tertiary)", fontSize: "13px", fontWeight: 600 }}>
                  <Link href="/tutorials" style={{ color: "inherit", textDecoration: "none" }}>Learn</Link>
                  <ChevronRight size={14} />
                  <Link href={`/tutorials/${course.slug}`} style={{ color: "inherit", textDecoration: "none" }} className="breadcrumb-truncate">{course.title}</Link>
                </div>
                <h1 className="lesson-title" style={{ fontSize: "var(--h1-size)", fontWeight: 900, color: "var(--text-primary)", marginBottom: "16px", letterSpacing: "-1.5px", lineHeight: 1.1 }}>
                  {lesson.title}
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "var(--text-secondary)", fontSize: "14px", fontWeight: 600, flexWrap: "wrap" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {lesson.lesson_type === 'video' ? <Video size={16} /> : <BookOpen size={16} />} 
                    {lesson.lesson_type === 'video' ? 'Video Lesson' : 'Text Lesson'}
                  </span>
                  <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--border-primary)" }} className="hide-on-mobile" />
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Clock size={16} /> {lesson.duration_minutes || 5} min read
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", width: "100%" }} className="lesson-header-actions">
                <style>{`
                  @media (max-width: 640px) {
                    .lesson-header-actions { flex-direction: column !important; }
                    .lesson-header-actions button { width: 100% !important; justify-content: center !important; }
                    .lesson-title { font-size: 1.75rem !important; }
                  }
                `}</style>


              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="prose-enhanced" style={{ marginBottom: "80px" }}>
             <LessonRenderer 
               content={hinglishMode && hinglishContent ? hinglishContent : lesson.content} 
               lessonType={lesson.lesson_type} 
               videoUrl={lesson.video_url} 
               codeTemplate={lesson.code_template}
             />
          </div>

          {aiSummary && (
            <div style={{ marginTop: "40px", padding: "24px", background: "var(--bg-secondary)", borderRadius: "16px", border: "1px solid var(--border-primary)", marginBottom: "40px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={18} color="var(--brand-primary)" /> AI Key Takeaways
              </h3>
              <div className="prose-enhanced">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiSummary}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="lesson-nav-buttons" style={{ 
            marginTop: "80px", 
            padding: "48px 0", 
            borderTop: "1px solid var(--border-primary)",
            display: "flex",
            gap: "16px",
            flexWrap: "wrap"
          }}>
            <style>{`
              @media (max-width: 640px) {
                .lesson-nav-buttons { flex-direction: column !important; }
                .lesson-nav-buttons > * { width: 100% !important; }
              }
            `}</style>
            <div style={{ display: "flex", gap: "12px", flex: 1 }}>
              {prevLesson && (
                <Link
                  href={`/tutorials/${course.slug}/${prevLesson.slug}`}
                  className="btn-secondary"
                  style={{ padding: "14px 16px", borderRadius: "14px", flex: 1, justifyContent: "center", fontSize: "14px", whiteSpace: "nowrap" }}
                >
                  <ChevronLeft size={18} /> Previous
                </Link>
              )}
              
              {/* Completed button removed. Certificates require exams. */}
            </div>

            {nextLesson && (
              <Link
                href={`/tutorials/${course.slug}/${nextLesson.slug}`}
                className="btn-primary"
                style={{ 
                  padding: "14px 24px", 
                  borderRadius: "14px", 
                  background: "var(--brand-primary)", 
                  justifyContent: "center",
                  boxShadow: "0 10px 20px -5px rgba(15, 110, 86, 0.4)",
                  border: "none",
                  color: "white",
                  fontWeight: 800,
                  flex: 1,
                  whiteSpace: "nowrap"
                }}
              >
                Next <ChevronRight size={20} />
              </Link>
            )}
          </div>

          {user && (
            <div style={{ marginTop: "100px" }}>
              <div className="mobile-only-toc" style={{ marginBottom: "60px", padding: "32px", background: "var(--bg-secondary)", borderRadius: "24px", border: "1px solid var(--border-primary)" }}>
                <h3 style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: "1.5px", marginBottom: "20px", textTransform: "uppercase" }}>
                  ON THIS PAGE
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {lesson.content?.split("\n")
                    .filter(line => line.startsWith("## ") || line.startsWith("### ") || line.startsWith("#### "))
                    .map((line, i) => {
                      const level = line.startsWith("#### ") ? 4 : line.startsWith("### ") ? 3 : 2;
                      const text = line.replace(/^#{2,4} /, "");
                      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                      return (
                        <a key={i} href={`#${id}`} style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", textDecoration: "none", paddingLeft: level === 4 ? "32px" : level === 3 ? "16px" : "0" }}>{text}</a>
                      );
                    })}
                </div>
              </div>
              <style>{`
                .mobile-only-toc { display: none; }
                @media (max-width: 1200px) {
                  .mobile-only-toc { display: block !important; }
                }
              `}</style>
              <LessonNotes lessonId={lesson.id} currentUserId={user.id} />
              <Discussion lessonId={lesson.id} currentUserId={user.id} />
            </div>
          )}
        </main>

        <aside className="right-sidebar" style={{ borderLeft: "1px solid var(--border-primary)", padding: "40px 24px", background: "var(--bg-secondary)", overflowY: "auto", position: "sticky", top: "108px", height: "calc(100vh - 108px)" }}>
          {/* Table of Contents */}
          <div style={{ marginBottom: "40px" }}>
             <h3 style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: "1.5px", marginBottom: "20px", textTransform: "uppercase" }}>
               ON THIS PAGE
             </h3>
             <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
               {lesson.content?.split("\n")
                 .filter(line => line.startsWith("## ") || line.startsWith("### ") || line.startsWith("#### "))
                 .map((line, i) => {
                   const level = line.startsWith("#### ") ? 4 : line.startsWith("### ") ? 3 : 2;
                   const text = line.replace(/^#{2,4} /, "");
                   const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                   return (
                     <a 
                       key={i} 
                       href={`#${id}`} 
                       style={{ 
                         fontSize: "13px", 
                         fontWeight: 600, 
                         color: "var(--text-secondary)", 
                         textDecoration: "none",
                         paddingLeft: level === 4 ? "32px" : level === 3 ? "16px" : "0",
                         lineHeight: 1.4,
                         transition: "color 0.2s"
                       }}
                       onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-primary)")}
                       onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                     >
                       {text}
                     </a>
                   );
                 })}
               {(!lesson.content || !lesson.content.includes("##")) && (
                 <p style={{ fontSize: "13px", color: "var(--text-tertiary)", fontStyle: "italic" }}>No sub-sections in this lesson.</p>
               )}
             </div>
          </div>

          {/* Advertisement Slot */}
          <div style={{ 
            background: "var(--bg-card)", 
            padding: "20px", 
            borderRadius: "16px", 
            border: "1px solid var(--border-primary)",
            marginBottom: "30px",
            textAlign: "center"
          }}>
            <span style={{ fontSize: "10px", color: "var(--text-tertiary)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "12px" }}>ADVERTISEMENT</span>
            <div style={{ 
              width: "100%", 
              height: "250px", 
              background: "var(--bg-secondary)", 
              borderRadius: "12px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              color: "var(--text-secondary)",
              fontSize: "13px",
              overflow: "hidden"
            }}>
              {ad ? (
                <a href={ad.link_url} target="_blank" rel="noopener noreferrer" style={{ width: "100%", height: "100%", display: "block" }}>
                  <img src={ad.image_url} alt={ad.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </a>
              ) : (
                /* This is where Google Ads will load if no custom ad */
                <span>Space for Google Ads or Admin Posted Ads</span>
              )}
            </div>
          </div>

          <div style={{ 
            background: "linear-gradient(135deg, #111827, #1f2937)", 
            padding: "24px", 
            borderRadius: "24px", 
            color: "white", 
            marginBottom: "40px",
            boxShadow: "0 12px 24px rgba(0,0,0,0.1)"
          }}>
            <h4 style={{ fontSize: "16px", fontWeight: 900, marginBottom: "8px" }}>Boxspox Pro</h4>
            <p style={{ fontSize: "12px", opacity: 0.8, marginBottom: "20px", lineHeight: 1.5 }}>Unlock certificates, offline mode, and 1-on-1 mentor support.</p>
            <Link href="/checkout" style={{ display: "block", textAlign: "center", background: "var(--brand-primary)", color: "white", padding: "10px", borderRadius: "12px", textDecoration: "none", fontWeight: 800, fontSize: "13px" }}>Upgrade</Link>
          </div>

          {/* Widgets */}
          <div style={{ textAlign: "center", padding: "32px 0", borderTop: "1px solid var(--border-primary)" }}>
             <h4 style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: "1.5px", marginBottom: "24px" }}>TOOLS</h4>
             <div style={{ width: "140px", height: "140px", margin: "0 auto", background: "conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #FFFF00 60deg, #00FF00 120deg, #00FFFF 180deg, #0000FF 240deg, #FF00FF 300deg, #FF0000 360deg)", borderRadius: "24px", border: "6px solid white", boxShadow: "0 15px 35px rgba(0,0,0,0.1)" }}></div>
          </div>
        </aside>
      </div>

      {/* Modals */}
      {quizOpen && quiz && (
        <QuizPlayer quiz={quiz} onClose={() => setQuizOpen(false)} results={quizResults} onSubmit={handleQuizSubmit} onReset={() => setQuizResults(null)} />
      )}

      {aiModalOpen && (
        <AIModal 
          isOpen={aiModalOpen} 
          onClose={() => setAiModalOpen(false)} 
          history={aiHistory} 
          onSubmit={handleAskAI} 
          question={aiQuestion} 
          setQuestion={setAiQuestion} 
          loading={aiLoading} 
        />
      )}

      <style>{`
        .prose-enhanced h1 { font-size: 2.5rem; font-weight: 900; color: var(--text-primary); margin: 3rem 0 1.5rem; letter-spacing: -1px; }
        .prose-enhanced h2 { font-size: 1.8rem; font-weight: 800; color: var(--text-primary); margin: 2.5rem 0 1.25rem; border-bottom: 2px solid var(--border-primary); padding-bottom: 0.5rem; }
        .prose-enhanced h3 { font-size: 1.4rem; font-weight: 700; color: var(--text-primary); margin: 2rem 0 1rem; }
        .prose-enhanced p { margin-bottom: 1.5rem; line-height: 1.8; color: var(--text-secondary); font-size: 1.05rem; }
        .prose-enhanced ul, .prose-enhanced ol { margin-bottom: 2rem; padding-left: 1.5rem; }
        .prose-enhanced li { margin-bottom: 0.75rem; color: var(--text-secondary); }
        .prose-enhanced pre { background: #1e293b; color: #f8fafc; padding: 1.5rem; border-radius: 16px; overflow-x: auto; margin: 2rem 0; font-family: var(--font-mono); font-size: 0.9rem; border: 1px solid #334155; max-width: 100%; white-space: pre; -webkit-overflow-scrolling: touch; }
        .prose-enhanced code:not(pre code) { background: var(--bg-tertiary); color: var(--brand-primary); padding: 2px 6px; border-radius: 6px; font-weight: 600; font-size: 0.9em; word-break: break-word; }
        
        .hidden-mobile { display: inline-block; }
        .show-mobile-only { display: none; }
        .breadcrumb-truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }

        @media (max-width: 600px) {
          .hidden-mobile { display: none !important; }
          .show-mobile-only { display: inline-block !important; }
          .breadcrumb-truncate { max-width: 100px !important; }
          .hide-on-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function LessonRenderer({ content, lessonType, videoUrl, codeTemplate }: any) {
  // Unescape literal \n strings if they exist
  const formattedContent = content ? content.replace(/\\n/g, "\n") : "";

  if (lessonType === 'video' && videoUrl) {
    const videoId = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)?.[1];
    return (
      <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: "24px", overflow: "hidden", background: "black", marginBottom: "48px", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
        <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${videoId}`} frameBorder="0" allowFullScreen></iframe>
      </div>
    );
  }

  return (
    <div className="prose-enhanced-content">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({node, ...props}) => {
            const id = props.children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, "-");
            return <h2 id={id} {...props} style={{ ...props.style, scrollMarginTop: "100px" }} />;
          },
          h3: ({node, ...props}) => {
            const id = props.children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, "-");
            return <h3 id={id} {...props} style={{ ...props.style, scrollMarginTop: "100px" }} />;
          },
          h4: ({node, ...props}) => {
            const id = props.children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, "-");
            return <h4 id={id} {...props} style={{ ...props.style, scrollMarginTop: "100px" }} />;
          },
          img: ({node, ...props}) => {
            return <img {...props} style={{ ...props.style, maxWidth: "100%", height: "auto", borderRadius: "12px", margin: "1.5rem 0" }} alt={props.alt || "Lesson image"} />;
          }
        }}
      >
        {formattedContent || "No content available for this lesson."}
      </ReactMarkdown>
      {lessonType === 'coding' && codeTemplate && (
        <div style={{ marginTop: "48px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "20px" }}>Try It Yourself</h3>
          <SandpackEditor 
            template="vanilla"
            files={{ "/index.html": codeTemplate, "/style.css": "", "/index.js": "" }}
          />
        </div>
      )}
    </div>
  );
}

function AIModal({ isOpen, onClose, history, onSubmit, question, setQuestion, loading }: any) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(12px)" }}>
      <div style={{ background: "var(--bg-card)", padding: "0", borderRadius: "32px", width: "600px", maxWidth: "90%", maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
        <div style={{ padding: "24px", borderBottom: "1px solid var(--border-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "#111827", padding: "8px", borderRadius: "12px" }}><Zap size={18} color="#10B981" /></div>
            <h3 style={{ fontWeight: 800 }}>Boxspox AI Tutor</h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)" }}><X size={24} /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {history.length === 0 && <p style={{ textAlign: "center", color: "var(--text-tertiary)", marginTop: "40px" }}>Ask me anything about this lesson!</p>}
          {history.map((msg: any, i: number) => (
            <div key={i} style={{ alignSelf: msg.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%", background: msg.role === "user" ? "var(--brand-primary)" : "var(--bg-tertiary)", color: msg.role === "user" ? "white" : "var(--text-primary)", padding: "12px 18px", borderRadius: "18px", fontSize: "14px", lineHeight: 1.6 }}>{msg.content}</div>
          ))}
          {loading && <div style={{ alignSelf: "flex-start", background: "var(--bg-tertiary)", padding: "12px 20px", borderRadius: "18px", display: "flex", gap: "8px", alignItems: "center" }}><Loader2 size={16} className="animate-spin" /> Thinking...</div>}
        </div>
        <form onSubmit={onSubmit} style={{ padding: "20px", borderTop: "1px solid var(--border-primary)", background: "var(--bg-secondary)" }}>
          <div style={{ position: "relative" }}>
            <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Type your question..." style={{ width: "100%", padding: "14px 20px", borderRadius: "16px", border: "1px solid var(--border-primary)", outline: "none" }} />
            <button type="submit" disabled={loading} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "var(--brand-primary)", color: "white", border: "none", padding: "8px 16px", borderRadius: "10px", fontWeight: 800, cursor: "pointer" }}>Send</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function QuizPlayer({ quiz, onClose, onSubmit, results, onReset }: any) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<any[]>(new Array(quiz.questions.length).fill(null));
  const progress = ((currentIdx) / quiz.questions.length) * 100;

  const handleSelect = (optionIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIdx] = optionIdx;
    setAnswers(newAnswers);
  };

  if (results) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.9)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(16px)" }}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          style={{ background: "var(--bg-card)", padding: "60px 48px", borderRadius: "32px", width: "480px", textAlign: "center", border: "1px solid var(--border-primary)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}
        >
          <div style={{ fontSize: "72px", marginBottom: "24px" }}>{results.passed ? "🎊" : "💡"}</div>
          <h3 style={{ fontSize: "32px", fontWeight: 900, marginBottom: "8px", color: "var(--text-primary)" }}>{results.passed ? "Brilliant Work!" : "Keep Pushing!"}</h3>
          <p style={{ color: "var(--text-tertiary)", fontSize: "1.1rem", marginBottom: "40px" }}>
            You scored <strong>{results.score}%</strong>. {results.passed ? "You've mastered this lesson!" : "Review the material and try again."}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <button onClick={onClose} className="btn-primary" style={{ width: "100%", padding: "18px", fontSize: "1.05rem" }}>
              {results.passed ? "Unlock Next Lesson" : "Return to Lesson"}
            </button>
            {!results.passed && (
              <button 
                onClick={() => { onReset(); setCurrentIdx(0); setAnswers(new Array(quiz.questions.length).fill(null)); }} 
                style={{ background: "none", border: "none", color: "var(--text-tertiary)", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" }}
              >
                Try Again
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  const q = quiz.questions[currentIdx];
  const isLast = currentIdx === quiz.questions.length - 1;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.9)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(16px)" }}
    >
      <motion.div 
        layout
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ background: "var(--bg-card)", padding: "48px", borderRadius: "32px", width: "720px", maxWidth: "90%", border: "1px solid var(--border-primary)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}
      >
         {/* Progress Bar */}
         <div style={{ width: "100%", height: "6px", background: "var(--bg-tertiary)", borderRadius: "3px", marginBottom: "48px", overflow: "hidden" }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}
              style={{ height: "100%", background: "var(--brand-primary)" }} 
            />
         </div>

         <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
            <div>
               <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                 Question {currentIdx + 1} of {quiz.questions.length}
               </div>
               <h3 style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--text-primary)" }}>{quiz.title}</h3>
            </div>
            <button onClick={onClose} style={{ background: "var(--bg-tertiary)", border: "none", width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}>
              <X size={20} />
            </button>
         </div>

         <AnimatePresence mode="wait">
           <motion.div
             key={currentIdx}
             initial={{ x: 20, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             exit={{ x: -20, opacity: 0 }}
             transition={{ duration: 0.2 }}
           >
             <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "40px", color: "var(--text-primary)", lineHeight: 1.4 }}>{q.question}</h2>
             
             <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "60px" }}>
                {q.options.map((opt: any, idx: number) => (
                  <motion.button 
                    key={idx} 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelect(idx)} 
                    style={{ 
                      padding: "24px", 
                      borderRadius: "20px", 
                      border: "2px solid", 
                      borderColor: answers[currentIdx] === idx ? "var(--brand-primary)" : "var(--border-primary)", 
                      background: answers[currentIdx] === idx ? "rgba(15, 110, 86, 0.05)" : "var(--bg-card)", 
                      textAlign: "left", 
                      fontWeight: 700, 
                      cursor: "pointer",
                      fontSize: "16px",
                      color: answers[currentIdx] === idx ? "var(--brand-primary)" : "var(--text-secondary)",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px"
                    }}
                  >
                    <div style={{ 
                      width: "28px", height: "28px", borderRadius: "50%", border: "2px solid", 
                      borderColor: answers[currentIdx] === idx ? "var(--brand-primary)" : "var(--border-secondary)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px"
                    }}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    {typeof opt === 'object' ? opt.text : opt}
                  </motion.button>
                ))}
             </div>
           </motion.div>
         </AnimatePresence>

         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button 
              disabled={currentIdx === 0} 
              onClick={() => setCurrentIdx(currentIdx - 1)} 
              style={{ background: "none", border: "none", color: "var(--text-tertiary)", fontWeight: 700, cursor: currentIdx === 0 ? "not-allowed" : "pointer", opacity: currentIdx === 0 ? 0.3 : 1, fontSize: "1rem" }}
            >
              Previous Question
            </button>
            <button 
              onClick={() => isLast ? onSubmit(answers) : setCurrentIdx(currentIdx + 1)} 
              disabled={answers[currentIdx] === null} 
              className="btn-primary" 
              style={{ padding: "16px 40px", fontSize: "1rem", borderRadius: "16px" }}
            >
              {isLast ? "Finish Test" : "Next Question"}
            </button>
         </div>
      </motion.div>
    </motion.div>
  );
}
