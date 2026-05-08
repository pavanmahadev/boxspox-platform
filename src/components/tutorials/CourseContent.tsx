"use client";

import Link from "next/link";
import { BookOpen, Clock, ArrowRight, ChevronRight, Code2, ExternalLink, Send, Loader2, Video, FileCode, HelpCircle, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { getCurrentUserAction } from "@/app/tutorials/actions";

const Discussion = dynamic(() => import("./Discussion"), { ssr: false, loading: () => null });
const CourseReview = dynamic(() => import("./CourseReview"), { ssr: false, loading: () => null });
const WishlistButton = dynamic(() => import("./WishlistButton"), { ssr: false, loading: () => null });
const LessonNotes = dynamic(() => import("./LessonNotes"), { ssr: false, loading: () => null });

interface CourseContentProps {
  course: any;
  modules: any[];
  lessons: any[];
  gradient: string;
  currentUserId?: string;
}

export function CourseContent({ course, modules, lessons, gradient, currentUserId }: CourseContentProps) {
  const [user, setUser] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [submission, setSubmission] = useState({ title: "", repo: "", demo: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);

  const supabase = createClient();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    const checkEnrollment = async () => {
      const user = await getCurrentUserAction();
      setUser(user);
      if (user) {
        const { data: enrollment } = await supabase
          .from("enrollments")
          .select("*")
          .eq("user_id", user.id)
          .eq("course_id", course.id)
          .single();
        setIsEnrolled(!!enrollment);

        const { data: sub } = await supabase
          .from("project_submissions")
          .select("*")
          .eq("user_id", user.id)
          .eq("course_id", course.id)
          .single();
        setExistingSubmission(sub);
      }
    };
    checkEnrollment();
  }, [course.id]);

  const handleEnroll = async () => {
    if (!user) {
      router.push("/login?next=/tutorials/" + course.slug);
      return;
    }
    setEnrollLoading(true);
    const { error } = await supabase.from("enrollments").insert({
      user_id: user.id,
      course_id: course.id
    });
    if (!error) {
      setIsEnrolled(true);
      showToast("Successfully enrolled in " + course.title, "success");
    }
    setEnrollLoading(false);
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("project_submissions").upsert({
      user_id: user.id,
      course_id: course.id,
      title: submission.title,
      repository_url: submission.repo,
      live_demo_url: submission.demo,
      description: submission.description,
      status: "pending"
    });

    if (!error) {
      showToast("Project submitted for review!", "success");
      setSubmissionModalOpen(false);
      router.refresh();
    } else {
      showToast(error.message, "error");
    }
    setSubmitting(false);
  };

  return (
    <>
      <div className="section-container" style={{ padding: "40px var(--container-padding) 100px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "32px", fontSize: "0.85rem", color: "var(--text-tertiary)", overflowX: "auto", whiteSpace: "nowrap", paddingBottom: "8px" }}>
          <Link href="/" style={{ color: "var(--text-tertiary)", textDecoration: "none" }}>Home</Link>
          <ChevronRight size={14} />
          <Link href="/tutorials" style={{ color: "var(--text-tertiary)", textDecoration: "none" }}>Tutorials</Link>
          <ChevronRight size={14} />
          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{course.title}</span>
        </div>

        <div
          className="course-hero animate-fade-in"
          style={{
            padding: "clamp(32px, 8vw, 60px)",
            borderRadius: "var(--radius-xl)",
            background: gradient,
            color: "white",
            marginBottom: "48px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <h1 style={{ fontSize: "var(--h1-size)", fontWeight: 800, marginBottom: "16px", lineHeight: 1.1 }}>
              {course.title}
            </h1>
            <p style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", opacity: 0.9, maxWidth: "600px", lineHeight: 1.6, marginBottom: "32px" }}>
              {course.description}
            </p>
            <div className="hero-actions" style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
              {!isEnrolled ? (
                <button 
                  onClick={handleEnroll}
                  disabled={enrollLoading}
                  className="btn-primary" 
                  style={{ background: "var(--bg-card)", color: "black", padding: "14px 32px", fontSize: "1rem" }}
                >
                  {enrollLoading ? <Loader2 className="animate-spin" /> : "Enroll in Course"}
                </button>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.2)", padding: "10px 20px", borderRadius: "var(--radius-full)", fontWeight: 700 }}>
                  Enrolled Student
                </div>
              )}
              <div style={{ display: "flex", gap: "24px", fontSize: "0.9rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><BookOpen size={20} /> {lessons.length} Lessons</span>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><Clock size={20} /> ~{lessons.length * 15}m</span>
              </div>
            </div>
          </div>
        </div>

        <div className="course-content-grid">
          <div>
            <h2 style={{ fontSize: "var(--h2-size)", fontWeight: 700, marginBottom: "24px" }}>Course Curriculum</h2>
            {modules.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                {modules.map((module: any, mIndex: number) => (
                  <div key={module.id}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ width: "28px", height: "28px", background: "var(--brand-primary)", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
                        {mIndex + 1}
                      </span>
                      {module.title}
                    </h3>
                    <div className="curriculum-list" style={{ display: "flex", flexDirection: "column", gap: "12px", paddingLeft: "40px" }}>
                      {module.lessons?.sort((a: any, b: any) => a.order_index - b.order_index).map((lesson: any) => (
                        <Link key={lesson.id} href={`/tutorials/${course.slug}/${lesson.slug}`} style={{ textDecoration: "none" }}>
                          <div className="hover-lift" style={{ padding: "16px 20px", background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", gap: "16px" }}>
                            <div style={{ width: 32, height: 32, borderRadius: "8px", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--brand-primary)" }}>
                              {lesson.lesson_type === 'video' ? <Video size={16} /> :
                               lesson.lesson_type === 'quiz' ? <HelpCircle size={16} /> :
                               lesson.lesson_type === 'coding' ? <FileCode size={16} /> :
                               <FileText size={16} />}
                            </div>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)" }}>{lesson.title}</h4>
                            </div>
                            <ArrowRight size={16} color="var(--text-tertiary)" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "48px", textAlign: "center", background: "var(--bg-secondary)", borderRadius: "var(--radius-lg)" }}>
                No modules published for this course yet.
              </div>
            )}
          </div>

          <div className="course-sidebar">
            {isEnrolled && (
              <div style={{ background: "var(--bg-card)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-primary)", position: "sticky", top: "120px" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "16px" }}>Final Project</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "24px", lineHeight: 1.5 }}>
                  Complete all lessons and build a real-world project to earn your official certificate.
                </p>

                {existingSubmission ? (
                  <div style={{ padding: "16px", background: "var(--bg-secondary)", borderRadius: "12px", border: "1px solid var(--border-primary)" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--brand-primary)", textTransform: "uppercase", marginBottom: "8px" }}>
                      Status: {existingSubmission.status.replace("_", " ")}
                    </div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "4px" }}>{existingSubmission.title}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>Submitted {new Date(existingSubmission.submitted_at).toLocaleDateString()}</div>
                    {existingSubmission.feedback && (
                      <div style={{ marginTop: "12px", padding: "10px", background: "var(--bg-card)", borderRadius: "8px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        <strong>Feedback:</strong> {existingSubmission.feedback}
                      </div>
                    )}
                    <button onClick={() => setSubmissionModalOpen(true)} style={{ width: "100%", marginTop: "16px", background: "none", border: "1px solid var(--border-primary)", padding: "10px", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>Update Submission</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setSubmissionModalOpen(true)}
                    className="btn-primary" 
                    style={{ width: "100%", padding: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  >
                    <Send size={18} /> Submit Project
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Right Sidebar (Live spaces, Ads, Widgets) */}
          <aside className="right-sidebar" style={{ borderLeft: "1px solid var(--border-primary)", padding: "24px", background: "var(--bg-card)", overflowY: "auto", borderRadius: "var(--radius-xl)" }}>
            <div style={{ marginBottom: "32px", textAlign: "center" }}>
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "16px", fontWeight: 600 }}>OR LOGIN WITH</p>
              <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "16px" }}>
                <button style={{ border: "1px solid #E5E7EB", background: "white", color: "#DB4437", fontWeight: 700, borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>G</button>
                <button style={{ border: "none", background: "#1877F2", color: "white", fontWeight: 700, borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>f</button>
                <button style={{ border: "none", background: "#111827", color: "white", fontWeight: 700, borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>gh</button>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>No account? <Link href="/register" style={{ color: "var(--brand-primary)", fontWeight: 700, textDecoration: "none" }}>Register</Link></p>
            </div>

            <div style={{ textAlign: "center", padding: "32px 0", borderTop: "1px solid var(--border-primary)", borderBottom: "1px solid var(--border-primary)", marginBottom: "32px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "24px", color: "var(--text-primary)" }}>COLOR PICKER</h4>
              <div style={{ width: "100px", height: "100px", margin: "0 auto", background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", transform: "rotate(45deg)", border: "4px solid white" }}></div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ width: 28, height: 28, background: "#111827", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "12px", fontWeight: 800 }}>in</div>
              <div style={{ width: 28, height: 28, background: "#111827", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "12px", fontWeight: 800 }}>d</div>
              <div style={{ width: 28, height: 28, background: "#111827", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "12px", fontWeight: 800 }}>fb</div>
              <div style={{ width: 28, height: 28, background: "#111827", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "12px", fontWeight: 800 }}>ig</div>
            </div>

            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <Link href="/premium" style={{ fontSize: "12px", color: "#3B82F6", fontWeight: 800, textDecoration: "none", letterSpacing: "1px" }}>REMOVE ADS</Link>
            </div>

            <div style={{ width: "100%", height: "300px", background: "var(--bg-secondary)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontSize: "14px", fontWeight: 700, position: "relative", border: "1px solid var(--border-primary)" }}>
              <span style={{ opacity: 0.5 }}>ADVERTISEMENT</span>
              <div style={{ position: "absolute", top: "8px", right: "8px", fontSize: "10px", background: "rgba(0,0,0,0.05)", color: "var(--text-tertiary)", padding: "2px 6px", borderRadius: "4px" }}>Ad</div>
            </div>
          </aside>
        </div>

        {/* Submission Modal */}
        {submissionModalOpen && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
            <div style={{ background: "var(--bg-card)", padding: "clamp(24px, 5vw, 40px)", borderRadius: "24px", width: "500px", maxWidth: "90%", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "24px" }}>Project Submission</h3>
              <form onSubmit={handleSubmitProject} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Project Title</label>
                  <input required type="text" value={submission.title} onChange={e => setSubmission({...submission, title: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-primary)" }} placeholder="e.g. My Portfolio Website" />
                </div>
                <div className="modal-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>GitHub URL</label>
                    <input required type="url" value={submission.repo} onChange={e => setSubmission({...submission, repo: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-primary)" }} placeholder="github.com/..." />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Live Demo URL</label>
                    <input type="url" value={submission.demo} onChange={e => setSubmission({...submission, demo: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-primary)" }} placeholder="mysite.vercel.app" />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Description</label>
                  <textarea value={submission.description} onChange={e => setSubmission({...submission, description: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-primary)", height: "100px", resize: "none" }} placeholder="What did you build and which tools did you use?" />
                </div>
                <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                  <button type="button" onClick={() => setSubmissionModalOpen(false)} style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid var(--border-primary)", background: "var(--bg-card)", fontWeight: 700 }}>Cancel</button>
                  <button disabled={submitting} type="submit" className="btn-primary" style={{ flex: 1, padding: "14px" }}>
                    {submitting ? <Loader2 className="animate-spin" /> : "Submit Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ─── LMS Components (authenticated users only) ─── */}
      {currentUserId && (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 var(--container-padding) 80px" }}>
          <CourseReview courseId={course.id} currentUserId={currentUserId} />
          <Discussion lessonId={lessons[0]?.id || course.id} currentUserId={currentUserId} />
        </div>
      )}

      <style>{`
        .course-content-grid {
          display: grid;
          grid-template-columns: 1fr 340px 300px;
          gap: 48px;
        }
        @media (max-width: 1200px) {
          .course-content-grid {
            grid-template-columns: 1fr 340px;
          }
          .right-sidebar {
            display: none !important;
          }
        }
        @media (max-width: 1024px) {
          .course-content-grid {
            grid-template-columns: 1fr;
          }
          .course-sidebar {
            order: -1;
          }

          .course-sidebar > div {
            position: relative !important;
            top: 0 !important;
          }
        }
        @media (max-width: 640px) {
          .curriculum-list {
            padding-left: 0 !important;
          }
          .modal-grid {
            grid-template-columns: 1fr !important;
          }
          .hero-actions {
            flex-direction: column;
            align-items: flex-start !important;
          }
          .hero-actions > button {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}

