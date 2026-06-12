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
  Code2,
  Bookmark,
  Copy,
  Check
} from "lucide-react";
import dynamic from "next/dynamic";
import { FAQSection } from "@/components/ui/FAQSection";
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
import { VideoPlayer } from "./VideoPlayer";
import { PDFViewer } from "./PDFViewer";
import { QuizEngine } from "./QuizEngine";

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
  pdf_url?: string;
  lesson_type?: string;
  content_type?: string;
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
  baseUrl?: string;
  ad?: {
    id: string;
    title: string;
    image_url: string;
    link_url: string;
    status: string;
  } | null;
}

export function LessonContent({ course, lesson, allLessons, ad, baseUrl }: LessonContentProps) {
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
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [xpToast, setXpToast] = useState<{ xp: number; coins: number } | null>(null);
  const hasAiAccess = user?.role === "admin" || user?.role === "instructor";

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
        const { error } = await supabase.from("user_progress").insert({ 
          user_id: user.id, 
          lesson_id: lesson.id, 
          course_id: course.id,
          completed_at: new Date().toISOString()
        });

        if (error) throw error;
        
        // Show XP reward popup
        setXpToast({ xp: 50, coins: 10 });
        setTimeout(() => setXpToast(null), 3500);
        
        showToast("Lesson complete! +50 XP earned! 🎉", "success");
        broadcastAnnouncement(`${user.email?.split('@')[0]} just completed "${lesson.title}"!`, 'success');
        
        if (nextLesson) {
           setTimeout(() => router.push(baseUrl ? `${baseUrl}/${nextLesson.slug}` : `/tutorials/${course.slug}/${nextLesson.slug}`), 2000);
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
    if (!user) {
      showToast("Please log in to translate this lesson.", "error");
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!hasAiAccess) {
      showToast("AI features are not available on the free tier.", "error");
      return;
    }
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
      if (data.error) throw new Error(data.error);
      if (data.translated) setHinglishContent(data.translated);
    } catch (err: any) {
      console.warn("AI Translation Error:", err);
      showToast(err.message || "Translation failed", "error");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!user) {
      showToast("Please login to save tutorials", "error");
      return;
    }
    
    const newStatus = !isBookmarked;
    setIsBookmarked(newStatus);
    
    try {
      // Assuming a saved_tutorials table exists. If not, it will fail gracefully.
      if (newStatus) {
        await supabase.from("saved_tutorials").insert({ user_id: user.id, lesson_id: lesson.id });
        showToast("Tutorial saved to bookmarks!", "success");
      } else {
        await supabase.from("saved_tutorials").delete().eq("user_id", user.id).eq("lesson_id", lesson.id);
        showToast("Removed from bookmarks", "info");
      }
    } catch (err) {
      console.warn("Bookmark failed (table might not exist yet):", err);
    }
  };

  const handleGenerateAIQuiz = async () => {
    if (!user) {
      showToast("Please log in to generate an AI quiz.", "error");
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!hasAiAccess) {
      showToast("AI features are not available on the free tier.", "error");
      return;
    }
    if (isGeneratingQuiz) return;
    setIsGeneratingQuiz(true);
    
    try {
      const res = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          lessonTitle: lesson.title, 
          lessonContent: lesson.content 
        })
      });
      
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      
      // Inject AI Quiz into state and open modal
      setQuiz(data);
      setQuizOpen(true);
      showToast("AI Quiz generated successfully!", "success");
    } catch (err: any) {
      console.warn("AI Quiz Error:", err);
      showToast(err.message || "Failed to generate AI quiz", "error");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("Please log in to ask the AI Tutor.", "error");
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!hasAiAccess) {
      showToast("AI features are not available on the free tier.", "error");
      return;
    }
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
      if (data.error) throw new Error(data.error);
      if (data.answer) setAiHistory(prev => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err: any) {
      console.warn("AI Ask Error:", err);
      showToast(err.message || "Failed to ask AI Tutor", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!user) {
      showToast("Please log in to summarize this lesson.", "error");
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!hasAiAccess) {
      showToast("AI features are not available on the free tier.", "error");
      return;
    }
    if (aiSummary) return;
    
    setIsSummarizing(true);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonContent: lesson.content })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.summary) setAiSummary(data.summary);
    } catch (err: any) {
      console.warn("AI Summary Error:", err);
      showToast(err.message || "Failed to generate summary", "error");
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
                    href={baseUrl ? `${baseUrl}/${l.slug}` : `/tutorials/${course.slug}/${l.slug}`}
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
                  href={baseUrl ? `${baseUrl}/exam` : `/tutorials/${course.slug}/exam`}
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
                  <Link href={baseUrl ? baseUrl.split('/').slice(0,3).join('/') : '/tutorials'} style={{ color: "inherit", textDecoration: "none" }}>Learn</Link>
                  <ChevronRight size={14} />
                  <Link href={baseUrl || `/tutorials/${course.slug}`} style={{ color: "inherit", textDecoration: "none" }} className="breadcrumb-truncate">{course.title}</Link>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
                  <h1 className="lesson-title" style={{ fontSize: "var(--h1-size)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1.5px", lineHeight: 1.1, margin: 0 }}>
                    {lesson.title}
                  </h1>
                  <button 
                    onClick={handleToggleBookmark}
                    title={isBookmarked ? "Remove Bookmark" : "Save Tutorial"}
                    style={{
                      background: isBookmarked ? "rgba(15, 110, 86, 0.1)" : "transparent",
                      border: isBookmarked ? "1px solid rgba(15, 110, 86, 0.3)" : "1px solid var(--border-primary)",
                      color: isBookmarked ? "var(--brand-primary)" : "var(--text-secondary)",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
                  </button>
                </div>

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

              {hasAiAccess && (
                <div style={{ display: "flex", gap: "12px", width: "100%" }} className="lesson-header-actions">
                  <style>{`
                    @media (max-width: 640px) {
                      .lesson-header-actions { flex-direction: column !important; }
                      .lesson-header-actions button { width: 100% !important; justify-content: center !important; }
                      .lesson-title { font-size: 1.75rem !important; }
                    }
                  `}</style>
                  <button
                    onClick={handleGenerateAIQuiz}
                    disabled={isGeneratingQuiz}
                    className="btn-secondary"
                    style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, justifyContent: "center" }}
                  >
                    {isGeneratingQuiz ? <Loader2 size={16} className="animate-spin" /> : <HelpCircle size={16} />} 
                    {isGeneratingQuiz ? "Generating..." : "Generate AI Quiz"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content Body */}
          <div className="prose-enhanced" style={{ marginBottom: "80px" }}>
             <LessonRenderer 
               content={hinglishMode && hinglishContent ? hinglishContent : lesson.content} 
               lessonType={lesson.content_type || lesson.lesson_type} 
               videoUrl={lesson.video_url} 
               pdfUrl={lesson.pdf_url}
               codeTemplate={lesson.code_template}
               onVideoProgress={(progressPercent: number) => {
                 if (progressPercent >= 90 && !isCompleted(lesson.id)) {
                   handleToggleComplete();
                 }
               }}
             />
          </div>

           {hasAiAccess && aiSummary && (
             <div style={{ marginTop: "40px", padding: "24px", background: "var(--bg-secondary)", borderRadius: "16px", border: "1px solid var(--border-primary)", marginBottom: "40px" }}>
               <h3 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                 <FileText size={18} color="var(--brand-primary)" /> AI Key Takeaways
               </h3>
               <div className="prose-enhanced">
                 <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiSummary}</ReactMarkdown>
               </div>
             </div>
           )}

          {/* Prominent Footer Navigation (W3Schools Style) */}
          <div className="lesson-nav-buttons" style={{ 
            marginTop: "60px", 
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            width: "100%"
          }}>
            <style>{`
              @media (max-width: 640px) {
                .lesson-nav-buttons { flex-direction: column !important; }
              }
            `}</style>
            
            {prevLesson ? (
              <Link
                href={baseUrl ? `${baseUrl}/${prevLesson.slug}` : `/tutorials/${course.slug}/${prevLesson.slug}`}
                style={{ 
                  flex: 1, 
                  display: "flex", 
                  alignItems: "center", 
                  padding: "24px", 
                  background: "var(--bg-secondary)", 
                  border: "1px solid var(--border-primary)", 
                  borderRadius: "16px",
                  textDecoration: "none",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--brand-primary)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-primary)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ background: "var(--bg-tertiary)", padding: "10px", borderRadius: "12px", marginRight: "16px" }}>
                  <ChevronLeft size={24} color="var(--text-primary)" />
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Previous</div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>{prevLesson.title}</div>
                </div>
              </Link>
            ) : <div style={{ flex: 1 }} />}

            {nextLesson ? (
              <Link
                href={baseUrl ? `${baseUrl}/${nextLesson.slug}` : `/tutorials/${course.slug}/${nextLesson.slug}`}
                style={{ 
                  flex: 1, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "flex-end",
                  textAlign: "right",
                  padding: "24px", 
                  background: "rgba(15, 110, 86, 0.05)", 
                  border: "1px solid rgba(15, 110, 86, 0.2)", 
                  borderRadius: "16px",
                  textDecoration: "none",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(15, 110, 86, 0.1)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(15, 110, 86, 0.05)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Next Topic</div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>{nextLesson.title}</div>
                </div>
                <div style={{ background: "var(--brand-primary)", padding: "10px", borderRadius: "12px", marginLeft: "16px" }}>
                  <ChevronRight size={24} color="white" />
                </div>
              </Link>
            ) : (
              <Link
                href={baseUrl ? `${baseUrl}/exam` : `/tutorials/${course.slug}/exam`}
                style={{ 
                  flex: 1, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "flex-end",
                  textAlign: "right",
                  padding: "24px", 
                  background: "var(--brand-primary)", 
                  borderRadius: "16px",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  boxShadow: "0 10px 25px -5px rgba(15, 110, 86, 0.4)"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Course Completed</div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "white" }}>Take Final Exam</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "12px", marginLeft: "16px" }}>
                  <ChevronRight size={24} color="white" />
                </div>
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

          {/* FAQ Section */}
          <div style={{ marginTop: "40px" }}>
            <FAQSection 
              title={`Frequently Asked Questions`}
              faqs={[
                {
                  question: `What is the best way to learn ${course.title}?`,
                  answer: `The best way to learn ${course.title} is through hands-on practice. Ensure you use our Sandpack code editor provided in the lessons to write your own code, break it, and fix it.`
                },
                {
                  question: `Is this ${course.title} tutorial for beginners?`,
                  answer: `Yes, this Pandaschool tutorial is designed to take you from a complete beginner to an advanced developer. We recommend going through the modules sequentially.`
                },
                {
                  question: `How do I get a certificate for ${course.title}?`,
                  answer: `Once you complete all lessons in this track, you will unlock the Final Certification Exam. Pass the exam to earn a verified Pandaschool certificate that you can share on your resume and LinkedIn.`
                }
              ]}
            />
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "60px", paddingTop: "40px", borderTop: "1px solid var(--border-primary)" }}>
            {(() => {
              const currentIndex = allLessons.findIndex(l => l.id === lesson.id);
              const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
              const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
              
              return (
                <>
                  {prevLesson ? (
                    <Link href={baseUrl ? `${baseUrl}/${prevLesson.slug}` : `/tutorials/${course.slug}/${prevLesson.slug}`} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", fontSize: "15px", fontWeight: 700, textDecoration: "none", color: "var(--text-primary)", border: "2px solid var(--border-primary)", borderRadius: "12px", background: "var(--bg-card)", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand-primary)"; e.currentTarget.style.color = "var(--brand-primary)"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-primary)"; e.currentTarget.style.color = "var(--text-primary)"; }}>
                      <ChevronLeft size={20} /> <span className="hide-on-mobile">Previous: </span> {prevLesson.title}
                    </Link>
                  ) : <div />}
                  {nextLesson ? (
                    <Link href={baseUrl ? `${baseUrl}/${nextLesson.slug}` : `/tutorials/${course.slug}/${nextLesson.slug}`} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", fontSize: "15px", fontWeight: 700, textDecoration: "none", color: "white", background: "var(--brand-primary)", borderRadius: "12px", border: "none", transition: "transform 0.2s, box-shadow 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 20px rgba(16, 185, 129, 0.2)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                      <span className="hide-on-mobile">Next: </span> {nextLesson.title} <ChevronRight size={20} />
                    </Link>
                  ) : <div />}
                </>
              );
            })()}
          </div>

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
            <h4 style={{ fontSize: "16px", fontWeight: 900, marginBottom: "8px" }}>Pandaschool Pro</h4>
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.9)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(16px)" }}>
           <div style={{ position: "relative", width: "100%", maxWidth: "800px", maxHeight: "90vh", overflowY: "auto", background: "var(--bg-card)", padding: "32px", borderRadius: "32px", border: "1px solid var(--border-primary)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
             <button onClick={() => setQuizOpen(false)} style={{ position: "absolute", top: "24px", right: "24px", zIndex: 10, background: "var(--bg-tertiary)", border: "none", width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}>
               <X size={20} />
             </button>
             <QuizEngine 
                quizId={quiz.id}
                title={quiz.title}
                questions={quiz.questions.map((q: any) => ({
                   id: q.id || Math.random().toString(),
                   question_text: q.question || q.question_text,
                   options: q.options.map((o: any) => typeof o === 'object' ? o.text : o),
                   correct_option_index: q.options.findIndex((o: any) => o.isCorrect) >= 0 ? q.options.findIndex((o: any) => o.isCorrect) : 0,
                   explanation: q.explanation
                }))}
                passingScore={quiz.passing_score || 70}
                onComplete={(score, passed) => {
                   setQuizResults({ score, passed });
                   if (passed) {
                      showToast(`Quiz Passed! Score: ${score}%`, "success", "Excellent Job!");
                      if (!isCompleted(lesson.id)) {
                        handleToggleComplete();
                      }
                   } else {
                      showToast(`Quiz failed (${score}%). Try again to complete the lesson.`, "error", "Keep Trying!");
                   }
                }}
             />
           </div>
        </div>
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

      {/* XP Reward Popup */}
      <AnimatePresence>
        {xpToast && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              position: "fixed",
              bottom: "100px",
              right: "24px",
              zIndex: 9999,
              background: "linear-gradient(135deg, #0F6E56, #10b981)",
              color: "white",
              padding: "20px 28px",
              borderRadius: "24px",
              boxShadow: "0 20px 60px rgba(16,185,129,0.4)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              minWidth: "200px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "40px", lineHeight: 1 }}>🎉</div>
            <div style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-0.5px" }}>Lesson Complete!</div>
            <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "4px" }}>
              <span style={{ background: "rgba(255,255,255,0.2)", padding: "6px 14px", borderRadius: "20px", fontWeight: 800, fontSize: "15px" }}>
                ⚡ +{xpToast.xp} XP
              </span>
              <span style={{ background: "rgba(255,255,255,0.2)", padding: "6px 14px", borderRadius: "20px", fontWeight: 800, fontSize: "15px" }}>
                🪙 +{xpToast.coins}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

function CodeBlock({ children }: any) {
  const [copied, setCopied] = useState(false);
  
  // Extract text content from the children
  const getText = (node: any): string => {
    if (typeof node === "string") return node;
    if (Array.isArray(node)) return node.map(getText).join("");
    if (node && node.props && node.props.children) return getText(node.props.children);
    return "";
  };

  const handleCopy = () => {
    const text = getText(children);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: "relative" }}>
      <button 
        onClick={handleCopy}
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          background: "rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: copied ? "#10B981" : "#94a3b8",
          padding: "6px",
          borderRadius: "6px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s"
        }}
        onMouseEnter={(e) => {
          if (!copied) e.currentTarget.style.color = "white";
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
        }}
        onMouseLeave={(e) => {
          if (!copied) e.currentTarget.style.color = "#94a3b8";
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
        }}
        title="Copy code"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
      <pre>{children}</pre>
    </div>
  );
}

function LessonRenderer({ content, lessonType, videoUrl, pdfUrl, codeTemplate, onVideoProgress }: any) {
  // Unescape literal \n strings if they exist
  const formattedContent = content ? content.replace(/\\n/g, "\n") : "";

  if (lessonType === 'video' && videoUrl) {
    return (
      <div style={{ marginBottom: "48px" }}>
        <VideoPlayer url={videoUrl} onProgress={onVideoProgress} />
      </div>
    );
  }

  if (lessonType === 'pdf' && pdfUrl) {
    return (
      <div style={{ marginBottom: "48px", height: "800px" }}>
        <PDFViewer url={pdfUrl} title="Course Document" />
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
          },
          pre: ({node, ...props}) => {
            return <CodeBlock {...props} />;
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
            <h3 style={{ fontWeight: 800 }}>Pandaschool AI Tutor</h3>
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
