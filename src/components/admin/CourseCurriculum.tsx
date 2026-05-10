"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";
import { fetchCurriculumAction } from "@/app/instructor/courses/actions";
import { Plus, Trash2, Edit2, GripVertical, Save, X, ChevronDown, ChevronRight, Video, FileCode, HelpCircle, Loader2, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface QuizQuestion {
  id?: string;
  question: string;
  options: { text: string; isCorrect: boolean }[];
}

interface Quiz {
  id?: string;
  lesson_id: string;
  course_id: string;
  title: string;
  passing_score: number;
  questions: QuizQuestion[];
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  content: string;
  video_url: string;
  code_template: string;
  order_index: number;
  lesson_type?: "text" | "video" | "quiz" | "coding";
}

interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
}

function SortableLessonItem({ lesson, index, module, handleOpenQuiz, setEditingLesson, handleDeleteLesson, handleGenerateLessonContent }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lesson.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} className="lesson-row" style={{ ...style, padding: "12px 16px", background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "8px", marginBottom: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
        <div {...attributes} {...listeners} style={{ cursor: "grab", display: "flex", alignItems: "center" }}>
          <GripVertical size={14} color="#D1D5DB" />
        </div>
        <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", flexShrink: 0 }}>
          {index + 1}
        </div>
        <span style={{ fontSize: "14px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{lesson.title}</span>
        {lesson.lesson_type === 'video' && <Video size={14} color="#9CA3AF" />}
        {lesson.lesson_type === 'coding' && <FileCode size={14} color="#9CA3AF" />}
        {lesson.lesson_type === 'quiz' && <HelpCircle size={14} color="#9CA3AF" />}
      </div>
      <div className="lesson-actions">
        <button onClick={() => handleOpenQuiz(lesson)} onPointerDown={(e) => e.stopPropagation()} draggable={false} title="Manage Quiz" style={{ background: "none", border: "none", color: lesson.lesson_type === 'quiz' ? "var(--brand-primary)" : "var(--text-tertiary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 700 }}>
          <HelpCircle size={14} /> <span className="hide-mobile-text">{lesson.lesson_type === 'quiz' ? "Quiz" : "Add Quiz"}</span>
        </button>
        <button onClick={() => handleGenerateLessonContent(lesson, module)} onPointerDown={(e) => e.stopPropagation()} draggable={false} title="Generate Content" style={{ background: "none", border: "none", color: "var(--brand-primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 700 }}>
          <Zap size={14} /> <span className="hide-mobile-text">AI Content</span>
        </button>
        <button onClick={() => setEditingLesson(lesson)} onPointerDown={(e) => e.stopPropagation()} draggable={false} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", padding: "4px" }}><Edit2 size={14} /></button>
        <button onClick={() => handleDeleteLesson(lesson.id)} onPointerDown={(e) => e.stopPropagation()} draggable={false} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: "4px" }}><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

export function CourseCurriculum({ courseId }: { courseId: string }) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const supabase = createClient();

  // Modals / forms state
  const [editingModule, setEditingModule] = useState<Module | Partial<Module> | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | Partial<Lesson> | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [previewMarkdown, setPreviewMarkdown] = useState(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchCurriculum();
  }, [courseId]);

  const fetchCurriculum = async () => {
    setLoading(true);
    try {
      const modulesData = await fetchCurriculumAction(courseId);
      const sortedModules = modulesData?.map((m: any) => ({
        ...m,
        lessons: m.lessons.sort((a: any, b: any) => a.order_index - b.order_index)
      })) || [];
      setModules(sortedModules);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent, moduleId: string) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const moduleIdx = modules.findIndex(m => m.id === moduleId);
      const mod = modules[moduleIdx];
      const oldIndex = mod.lessons.findIndex(l => l.id === active.id);
      const newIndex = mod.lessons.findIndex(l => l.id === over.id);
      
      const newLessons = arrayMove(mod.lessons, oldIndex, newIndex).map((l, idx) => ({ ...l, order_index: idx }));
      
      const newModules = [...modules];
      newModules[moduleIdx] = { ...mod, lessons: newLessons };
      setModules(newModules);

      try {
        const updates = newLessons.map((l) => ({ id: l.id, order_index: l.order_index }));
        await supabase.from("lessons").upsert(updates);
      } catch (e) {
        showToast("Error saving order", "error");
      }
    }
  };

  const handleOpenQuiz = async (lesson: Lesson) => {
    const { data: quizData } = await supabase
      .from("quizzes")
      .select("*, questions:quiz_questions(*)")
      .eq("lesson_id", lesson.id)
      .single();

    if (quizData) {
      setEditingQuiz({
        ...quizData,
        questions: quizData.questions.sort((a: any, b: any) => a.order_index - b.order_index)
      });
    } else {
      setEditingQuiz({
        lesson_id: lesson.id,
        course_id: courseId,
        title: `Quiz: ${lesson.title}`,
        passing_score: 80,
        questions: [
          { question: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }] }
        ]
      });
    }
  };

  const handleSaveQuiz = async () => {
    if (!editingQuiz) return;

    try {
      let quizId = editingQuiz.id;

      if (quizId) {
        await supabase.from("quizzes").update({
          title: editingQuiz.title,
          passing_score: editingQuiz.passing_score
        }).eq("id", quizId);
      } else {
        const { data } = await supabase.from("quizzes").insert([{
          lesson_id: editingQuiz.lesson_id,
          course_id: editingQuiz.course_id,
          title: editingQuiz.title,
          passing_score: editingQuiz.passing_score
        }]).select().single();
        quizId = data.id;
      }

      await supabase.from("quiz_questions").delete().eq("quiz_id", quizId);
      
      const questionsToInsert = editingQuiz.questions.map((q, idx) => ({
        quiz_id: quizId,
        question: q.question,
        options: q.options,
        order_index: idx
      }));

      await supabase.from("quiz_questions").insert(questionsToInsert);
      
      // Ensure lesson type is set to quiz
      await supabase.from("lessons").update({ lesson_type: "quiz" }).eq("id", editingQuiz.lesson_id);
      
      showToast("Quiz saved successfully", "success");
      setEditingQuiz(null);
      fetchCurriculum(); // Refresh to show new lesson type icon
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleGenerateOutline = async () => {
    if (modules.length > 0) {
      if (!confirm("You already have modules in this course. Generating a new outline will ADD more modules and may create duplicates. If you want to start fresh, please delete the existing modules first.\n\nDo you still want to proceed and ADD more modules?")) return;
    } else {
      if (!confirm("This will generate a course outline with AI and insert it into the database. Continue?")) return;
    }
    
    setIsGeneratingOutline(true);
    try {
      const { data: course } = await supabase
        .from("courses")
        .select("title")
        .eq("id", courseId)
        .single();
        
      if (!course) throw new Error("Course not found");

      const res = await fetch("/api/ai/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseTitle: course.title })
      });
      const data = await res.json();
      
      if (data.outline) {
        for (let i = 0; i < data.outline.length; i++) {
          const mod = data.outline[i];
          const { data: insertedMod } = await supabase
            .from("modules")
            .insert([{ course_id: courseId, title: mod.title, order_index: i }])
            .select()
            .single();
            
          if (insertedMod && mod.lessons) {
            const lessonsToInsert = mod.lessons.map((l: any, lIdx: number) => ({
              module_id: insertedMod.id,
              title: l.title,
              slug: l.slug,
              order_index: lIdx,
              content: `# ${l.title}\n\nContent coming soon!`,
              lesson_type: "text"
            }));
            await supabase.from("lessons").insert(lessonsToInsert);
          }
        }
        showToast("Outline generated and saved!", "success");
        fetchCurriculum();
      } else if (data.error) {
        showToast(data.error, "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  const handleGenerateAllContent = async () => {
    if (!confirm("This will generate content for all lessons with 'Content coming soon!'. It may take several minutes. Do you want to proceed?")) return;
    
    setIsGeneratingContent(true);
    let successCount = 0;
    let failCount = 0;

    try {
      const { data: course } = await supabase
        .from("courses")
        .select("title")
        .eq("id", courseId)
        .single();

      for (const mod of modules) {
        for (const lesson of mod.lessons) {
          if (lesson.content && lesson.content.includes("Content coming soon!")) {
            try {
              const res = await fetch("/api/ai/generate-lesson-content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  lessonTitle: lesson.title,
                  moduleTitle: mod.title,
                  courseTitle: course?.title || "This Course"
                })
              });
              
              const data = await res.json();
              
              if (data.content) {
                await supabase
                  .from("lessons")
                  .update({ content: data.content })
                  .eq("id", lesson.id);
                successCount++;
              } else {
                failCount++;
              }
            } catch (err) {
              console.error(`Error generating content for lesson ${lesson.id}:`, err);
              failCount++;
            }
          }
        }
      }
      
      showToast(`Finished! Generated content for ${successCount} lessons. ${failCount} failed.`, "success");
      fetchCurriculum();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const toggleModule = (id: string) => {
    setExpandedModules(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const handleSaveModule = async () => {
    if (!editingModule?.title) return;

    try {
      if (editingModule.id) {
        await supabase.from("modules").update({
          title: editingModule.title,
          description: editingModule.description,
        }).eq("id", editingModule.id);
        showToast("Module updated", "success");
      } else {
        await supabase.from("modules").insert([{
          course_id: courseId,
          title: editingModule.title,
          description: editingModule.description,
          order_index: modules.length
        }]);
        showToast("Module created", "success");
      }
      setEditingModule(null);
      fetchCurriculum();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm("Are you sure? This will delete all lessons inside this module.")) return;
    try {
      await supabase.from("modules").delete().eq("id", id);
      showToast("Module deleted", "success");
      fetchCurriculum();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleSaveLesson = async () => {
    if (!editingLesson?.title || !editingLesson?.module_id) return;
    
    const slug = editingLesson.slug || editingLesson.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    try {
      if (editingLesson.id) {
        await supabase.from("lessons").update({
          title: editingLesson.title,
          slug,
          content: editingLesson.content || "",
          video_url: editingLesson.video_url || "",
          code_template: editingLesson.code_template || "",
          lesson_type: editingLesson.lesson_type || "text",
        }).eq("id", editingLesson.id);
        showToast("Lesson updated", "success");
      } else {
        const moduleLessons = modules.find(m => m.id === editingLesson.module_id)?.lessons || [];
        await supabase.from("lessons").insert([{
          module_id: editingLesson.module_id,
          title: editingLesson.title,
          slug,
          content: editingLesson.content || "",
          video_url: editingLesson.video_url || "",
          code_template: editingLesson.code_template || "",
          lesson_type: editingLesson.lesson_type || "text",
          order_index: moduleLessons.length
        }]);
        showToast("Lesson created", "success");
        if (!expandedModules.includes(editingLesson.module_id)) {
            toggleModule(editingLesson.module_id);
        }
      }
      setEditingLesson(null);
      setPreviewMarkdown(false);
      fetchCurriculum();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await supabase.from("lessons").delete().eq("id", id);
      showToast("Lesson deleted", "success");
      fetchCurriculum();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleGenerateLessonContent = async (lesson: Lesson, mod: Module) => {
    showToast("Generating content for this lesson...", "info");
    try {
      const { data: course } = await supabase
        .from("courses")
        .select("title")
        .eq("id", courseId)
        .single();

      const res = await fetch("/api/ai/generate-lesson-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonTitle: lesson.title,
          moduleTitle: mod.title,
          courseTitle: course?.title || "This Course"
        })
      });
      
      const data = await res.json();
      
      if (data.content) {
        await supabase
          .from("lessons")
          .update({ content: data.content })
          .eq("id", lesson.id);
        showToast("Content generated successfully!", "success");
        fetchCurriculum();
      } else {
        showToast(data.error || "Failed to generate content", "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading curriculum...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="curriculum-container">
      <style>{`
        .curriculum-header { display: flex; justify-content: space-between; align-items: center; }
        .curriculum-header-actions { display: flex; gap: 12px; }
        .module-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: var(--bg-secondary); border-bottom: 1px solid var(--border-primary); }
        .module-actions { display: flex; gap: 8px; }
        .lesson-row { display: flex; justify-content: space-between; align-items: center; }
        .lesson-actions { display: flex; gap: 8px; }
        .show-mobile-only { display: none; }
        
        @media (max-width: 768px) {
          .curriculum-header { flex-direction: column; align-items: flex-start; gap: 16px; }
          .curriculum-header-actions { flex-wrap: wrap; width: 100%; }
          .curriculum-header-actions button { flex: 1; justify-content: center; text-align: center; white-space: nowrap; }
          
          .module-header { flex-direction: column; align-items: flex-start; gap: 16px; }
          .module-actions { width: 100%; justify-content: flex-start; flex-wrap: wrap; }
          
          .lesson-row { flex-direction: column; align-items: flex-start; gap: 12px; }
          .lesson-actions { width: 100%; justify-content: flex-end; flex-wrap: wrap; background: var(--bg-secondary); padding: 8px; border-radius: 8px; }
          .hide-mobile-text { display: none !important; }
          .show-mobile-only { display: inline !important; }
          .modal-grid-2col { grid-template-columns: 1fr !important; gap: 16px !important; }
          .quiz-header-grid { grid-template-columns: 1fr !important; }
          .quiz-options-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
           .curriculum-header-actions button { width: 100%; flex: none; }
        }
        .modal-grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
        .quiz-header-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
        .quiz-options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      `}</style>
      <div className="curriculum-header">
        <h2 style={{ fontSize: "18px", fontWeight: 800 }}>Course Curriculum</h2>
        <div className="curriculum-header-actions">
          <button 
            onClick={handleGenerateOutline}
            disabled={isGeneratingOutline}
            style={{ padding: "8px 16px", background: "#10B981", color: "white", borderRadius: "8px", border: "none", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
          >
            {isGeneratingOutline ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />} 
            <span className="hide-mobile-text">Generate Outline with AI</span>
            <span className="show-mobile-only">AI Outline</span>
          </button>
          <button 
            onClick={handleGenerateAllContent}
            disabled={isGeneratingContent}
            style={{ padding: "8px 16px", background: "#0F6E56", color: "white", borderRadius: "8px", border: "none", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
          >
            {isGeneratingContent ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />} 
            <span className="hide-mobile-text">Generate Content for All</span>
            <span className="show-mobile-only">AI Content</span>
          </button>
          <button 
            onClick={() => setEditingModule({ title: "", description: "" })}
            style={{ padding: "8px 16px", background: "#111827", color: "white", borderRadius: "8px", border: "none", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
          >
            <Plus size={16} /> Add Module
          </button>
        </div>
      </div>

      {modules.map((mod, mIndex) => (
        <div key={mod.id} style={{ background: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--border-primary)", overflow: "hidden" }}>
          <div className="module-header">
            <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", width: "100%" }} onClick={() => toggleModule(mod.id)}>
              <GripVertical size={16} color="#9CA3AF" style={{ flexShrink: 0 }} />
              {expandedModules.includes(mod.id) ? <ChevronDown size={16} color="#6B7280" style={{ flexShrink: 0 }} /> : <ChevronRight size={16} color="#6B7280" style={{ flexShrink: 0 }} />}
              <span style={{ fontWeight: 700, fontSize: "15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Module {mIndex + 1}: {mod.title}</span>
            </div>
            <div className="module-actions">
              <button onClick={() => setEditingLesson({ module_id: mod.id, title: "", lesson_type: "text" })} style={{ background: "none", border: "none", color: "var(--brand-primary)", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px" }}>
                <Plus size={14} /> Add Lesson
              </button>
              <button onClick={() => setEditingModule(mod)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", padding: "4px 8px" }}><Edit2 size={16} /></button>
              <button onClick={() => handleDeleteModule(mod.id)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: "4px 8px" }}><Trash2 size={16} /></button>
            </div>
          </div>

          {expandedModules.includes(mod.id) && (
            <div style={{ padding: "12px", display: "flex", flexDirection: "column" }}>
              {mod.lessons.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "#9CA3AF", fontSize: "14px" }}>No lessons yet.</div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, mod.id)}>
                  <SortableContext items={mod.lessons.map((l: any) => l.id)} strategy={verticalListSortingStrategy}>
                    {mod.lessons.map((lesson: any, lIndex: number) => (
                      <SortableLessonItem 
                        key={lesson.id} 
                        lesson={lesson} 
                        index={lIndex} 
                        module={mod}
                        handleOpenQuiz={handleOpenQuiz} 
                        setEditingLesson={setEditingLesson} 
                        handleDeleteLesson={handleDeleteLesson} 
                        handleGenerateLessonContent={handleGenerateLessonContent}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Module Modal */}
      {editingModule && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--bg-card)", padding: "32px", borderRadius: "16px", width: "400px", maxWidth: "90%" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "20px" }}>{editingModule.id ? "Edit Module" : "New Module"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Module Title</label>
                <input 
                  type="text" 
                  value={editingModule.title || ""} 
                  onChange={e => setEditingModule({...editingModule, title: e.target.value})}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-primary)", outline: "none", background: "var(--bg-card)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Description (Optional)</label>
                <textarea 
                  value={editingModule.description || ""} 
                  onChange={e => setEditingModule({...editingModule, description: e.target.value})}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-primary)", outline: "none", resize: "vertical", background: "var(--bg-card)", color: "var(--text-primary)" }}
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button onClick={() => setEditingModule(null)} style={{ padding: "8px 16px", background: "var(--bg-tertiary)", color: "var(--text-primary)", borderRadius: "8px", border: "none", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSaveModule} style={{ padding: "8px 16px", background: "#111827", color: "white", borderRadius: "8px", border: "none", fontWeight: 600, cursor: "pointer" }}>Save Module</button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {editingQuiz && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--bg-card)", padding: "32px", borderRadius: "16px", width: "700px", maxWidth: "95%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800 }}>Manage Lesson Quiz</h3>
              <button onClick={() => setEditingQuiz(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} color="var(--text-primary)" /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "32px" }}>
              <div className="quiz-header-grid">
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Quiz Title</label>
                  <input 
                    type="text" 
                    value={editingQuiz.title} 
                    onChange={e => setEditingQuiz({...editingQuiz, title: e.target.value})}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-primary)", outline: "none", background: "var(--bg-card)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Passing Score (%)</label>
                  <input 
                    type="number" 
                    value={editingQuiz.passing_score} 
                    onChange={e => setEditingQuiz({...editingQuiz, passing_score: parseInt(e.target.value)})}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-primary)", outline: "none", background: "var(--bg-card)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {editingQuiz.questions.map((q, qIdx) => (
                  <div key={qIdx} style={{ padding: "20px", border: "1px solid var(--border-primary)", borderRadius: "12px", background: "var(--bg-secondary)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "16px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", marginBottom: "4px", display: "block" }}>Question {qIdx + 1}</label>
                        <input 
                          type="text" 
                          value={q.question} 
                          onChange={e => {
                            const newQs = [...editingQuiz.questions];
                            newQs[qIdx].question = e.target.value;
                            setEditingQuiz({...editingQuiz, questions: newQs});
                          }}
                          placeholder="Enter your question here..."
                          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-primary)", outline: "none", fontWeight: 600, background: "var(--bg-card)", color: "var(--text-primary)" }}
                        />
                      </div>
                      <button 
                        onClick={() => {
                          const newQs = editingQuiz.questions.filter((_, idx) => idx !== qIdx);
                          setEditingQuiz({...editingQuiz, questions: newQs});
                        }}
                        style={{ marginTop: "20px", color: "#EF4444", background: "none", border: "none", cursor: "pointer" }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="quiz-options-grid">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <input 
                            type="radio" 
                            checked={opt.isCorrect} 
                            onChange={() => {
                              const newQs = [...editingQuiz.questions];
                              newQs[qIdx].options = newQs[qIdx].options.map((o, idx) => ({...o, isCorrect: idx === oIdx}));
                              setEditingQuiz({...editingQuiz, questions: newQs});
                            }}
                          />
                          <input 
                            type="text" 
                            value={opt.text} 
                            onChange={e => {
                              const newQs = [...editingQuiz.questions];
                              newQs[qIdx].options[oIdx].text = e.target.value;
                              setEditingQuiz({...editingQuiz, questions: newQs});
                            }}
                            placeholder={`Option ${oIdx + 1}`}
                            style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid var(--border-primary)", fontSize: "13px", background: "var(--bg-card)", color: "var(--text-primary)" }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <button 
                  onClick={() => {
                    const newQs = [...editingQuiz.questions, { question: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }] }];
                    setEditingQuiz({...editingQuiz, questions: newQs});
                  }}
                  style={{ padding: "12px", background: "var(--bg-card)", border: "1px dashed var(--border-primary)", borderRadius: "8px", color: "var(--text-tertiary)", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  <Plus size={16} /> Add Question
                </button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--border-primary)", paddingTop: "20px" }}>
              <button onClick={() => setEditingQuiz(null)} style={{ padding: "8px 16px", background: "var(--bg-tertiary)", color: "var(--text-primary)", borderRadius: "8px", border: "none", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSaveQuiz} style={{ padding: "8px 16px", background: "#111827", color: "white", borderRadius: "8px", border: "none", fontWeight: 600, cursor: "pointer" }}>Save Quiz</button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {editingLesson && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--bg-card)", padding: "24px", borderRadius: "16px", width: "800px", maxWidth: "95%", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "20px" }}>{editingLesson.id ? "Edit Lesson" : "New Lesson"}</h3>
            
            <div className="modal-grid-2col">
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Lesson Title</label>
                  <input 
                    type="text" 
                    value={editingLesson.title || ""} 
                    onChange={e => setEditingLesson({...editingLesson, title: e.target.value})}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-primary)", outline: "none", background: "var(--bg-card)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Slug (auto-generated if empty)</label>
                  <input 
                    type="text" 
                    value={editingLesson.slug || ""} 
                    onChange={e => setEditingLesson({...editingLesson, slug: e.target.value})}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-primary)", outline: "none", background: "var(--bg-card)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Lesson Type</label>
                  <select 
                    value={editingLesson.lesson_type || "text"} 
                    onChange={e => setEditingLesson({...editingLesson, lesson_type: e.target.value as any})}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-primary)", outline: "none", background: "var(--bg-card)", color: "var(--text-primary)" }}
                  >
                    <option value="text">Text / Article</option>
                    <option value="video">Video Lesson</option>
                    <option value="coding">Coding Challenge</option>
                    <option value="quiz">Interactive Quiz</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Video URL (YouTube/Vimeo)</label>
                  <input 
                    type="text" 
                    value={editingLesson.video_url || ""} 
                    onChange={e => setEditingLesson({...editingLesson, video_url: e.target.value})}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-primary)", outline: "none", background: "var(--bg-card)", color: "var(--text-primary)" }}
                    placeholder="e.g. https://www.youtube.com/watch?v=..."
                  />
                  {editingLesson.video_url && editingLesson.video_url.includes('youtube.com/watch') && (
                    <div style={{ marginTop: "12px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-primary)" }}>
                      <iframe 
                        width="100%" 
                        height="180" 
                        src={editingLesson.video_url.replace("watch?v=", "embed/")} 
                        frameBorder="0" 
                        allowFullScreen
                        style={{ display: "block" }}
                      ></iframe>
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Content (Markdown / HTML)</label>
                    <button 
                      onClick={() => setPreviewMarkdown(!previewMarkdown)} 
                      style={{ background: "none", border: "none", color: "var(--brand-primary)", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                    >
                      {previewMarkdown ? "Edit Content" : "Preview Markdown"}
                    </button>
                  </div>
                  {previewMarkdown ? (
                    <div style={{ flex: 1, minHeight: "150px", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-primary)", overflowY: "auto", background: "var(--bg-secondary)", fontSize: "14px" }}>
                      <ReactMarkdown>{editingLesson.content || "*No content*"}</ReactMarkdown>
                    </div>
                  ) : (
                    <textarea 
                      value={editingLesson.content || ""} 
                      onChange={e => setEditingLesson({...editingLesson, content: e.target.value})}
                      style={{ width: "100%", flex: 1, minHeight: "150px", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-primary)", outline: "none", resize: "vertical", fontFamily: "monospace", fontSize: "13px", background: "var(--bg-card)", color: "var(--text-primary)" }}
                    />
                  )}
                </div>
                {editingLesson.lesson_type === 'coding' && (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Starter Code Template</label>
                    <textarea 
                      value={editingLesson.code_template || ""} 
                      onChange={e => setEditingLesson({...editingLesson, code_template: e.target.value})}
                      style={{ width: "100%", flex: 1, minHeight: "150px", padding: "10px", borderRadius: "8px", border: "none", outline: "none", resize: "vertical", fontFamily: "monospace", fontSize: "13px", background: "#1F2937", color: "#E5E7EB" }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--border-primary)", paddingTop: "20px" }}>
              <button onClick={() => { setEditingLesson(null); setPreviewMarkdown(false); }} style={{ padding: "8px 16px", background: "var(--bg-tertiary)", color: "var(--text-primary)", borderRadius: "8px", border: "none", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSaveLesson} style={{ padding: "8px 16px", background: "#111827", color: "white", borderRadius: "8px", border: "none", fontWeight: 600, cursor: "pointer" }}>Save Lesson</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
