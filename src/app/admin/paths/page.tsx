"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, Plus, Edit2, Trash2, Save, X, GripVertical, ChevronDown, ChevronRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableCourseItem({ id, pc, index, onRemove }: { id: string, pc: any, index: number, onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={{ ...style, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--border-primary)", marginBottom: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div {...attributes} {...listeners} style={{ cursor: "grab", display: "flex", alignItems: "center" }}>
          <GripVertical size={16} color="#D1D5DB" />
        </div>
        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#EEF2FF", color: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "12px" }}>
          {index + 1}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "14px" }}>{pc.courses?.title || "Unknown Course"}</div>
          <div style={{ fontSize: "11px", color: "#9CA3AF", textTransform: "uppercase" }}>{pc.courses?.status || "Unknown"}</div>
        </div>
      </div>
      <button onClick={() => onRemove(pc.id)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: "4px" }}>
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default function AdminPathsPage() {
  const [paths, setPaths] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPath, setEditingPath] = useState<any | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<string[]>([]);
  const supabase = createClient();
  const { showToast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pathsRes, coursesRes] = await Promise.all([
        supabase.from("learning_paths").select("*, path_courses(*, courses(*))").order("created_at", { ascending: false }),
        supabase.from("courses").select("id, title, status").order("title", { ascending: true })
      ]);

      if (pathsRes.error) throw pathsRes.error;
      if (coursesRes.error) throw coursesRes.error;

      // Sort courses inside paths
      const sortedPaths = pathsRes.data?.map((p: any) => ({
        ...p,
        path_courses: p.path_courses.sort((a: any, b: any) => a.order_index - b.order_index)
      }));

      setPaths(sortedPaths || []);
      setCourses(coursesRes.data || []);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent, pathId: string) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPaths((currentPaths: any[]) => {
        const pathIndex = currentPaths.findIndex(p => p.id === pathId);
        if (pathIndex === -1) return currentPaths;
        
        const path = currentPaths[pathIndex];
        const oldIndex = path.path_courses.findIndex((pc: any) => pc.id === active.id);
        const newIndex = path.path_courses.findIndex((pc: any) => pc.id === over.id);

        const newPathCourses = arrayMove(path.path_courses, oldIndex, newIndex);
        
        // Update local state immediately
        const newPaths = [...currentPaths];
        newPaths[pathIndex] = { ...path, path_courses: newPathCourses };
        
        // Persist to Supabase
        const updates = newPathCourses.map((pc: any, index: number) => ({
          id: pc.id,
          path_id: pc.path_id,
          course_id: pc.course_id,
          order_index: index
        }));
        
        supabase.from("path_courses").upsert(updates).then(({ error }: any) => {
          if (error) {
            showToast("Failed to reorder: " + error.message, "error");
            fetchData(); // revert
          }
        });

        return newPaths;
      });
    }
  };

  const handleSavePath = async () => {
    if (!editingPath?.title) return;

    try {
      const slug = editingPath.slug || editingPath.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      const payload = {
        title: editingPath.title,
        description: editingPath.description,
        slug,
        status: editingPath.status || "draft",
        icon: editingPath.icon || "🚀",
        color: editingPath.color || "#059669",
        bg_color: editingPath.bg_color || "#E1F5EE"
      };

      if (editingPath.id) {
        await supabase.from("learning_paths").update(payload).eq("id", editingPath.id);
        showToast("Learning path updated", "success");
      } else {
        await supabase.from("learning_paths").insert([payload]);
        showToast("Learning path created", "success");
      }
      setEditingPath(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleDeletePath = async (id: string) => {
    if (!confirm("Are you sure? This will delete the path and its course assignments.")) return;
    try {
      await supabase.from("learning_paths").delete().eq("id", id);
      showToast("Learning path deleted", "success");
      fetchData();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleAddCourseToPath = async (pathId: string, courseId: string) => {
    if (!courseId) return;
    const path = paths.find(p => p.id === pathId);
    if (path.path_courses.some((pc: any) => pc.course_id === courseId)) {
      showToast("Course already in path", "error");
      return;
    }
    
    try {
      await supabase.from("path_courses").insert([{
        path_id: pathId,
        course_id: courseId,
        order_index: path.path_courses.length
      }]);
      showToast("Course added to path", "success");
      fetchData();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleRemoveCourseFromPath = async (pcId: string) => {
    try {
      await supabase.from("path_courses").delete().eq("id", pcId);
      showToast("Course removed from path", "success");
      fetchData();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const togglePath = (id: string) => {
    setExpandedPaths(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  if (loading) return <div style={{ padding: "40px" }}>Loading learning paths...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
            Learning Paths
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "14px", fontWeight: 500 }}>Organize courses into structured career journeys.</p>
        </div>
        <button 
          onClick={() => setEditingPath({ title: "", description: "", status: "draft", icon: "🚀", color: "#059669", bg_color: "#E1F5EE" })}
          style={{ 
            background: "#111827", 
            color: "white", 
            padding: "10px 20px", 
            borderRadius: "8px", 
            border: "none",
            fontWeight: 700, 
            display: "flex", 
            alignItems: "center", 
            gap: "8px",
            fontSize: "14px",
            cursor: "pointer"
          }}
        >
          <Plus size={18} /> New Path
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {paths.map(path => (
          <div key={path.id} style={{ background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border-primary)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: expandedPaths.includes(path.id) ? "1px solid #E5E7EB" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", cursor: "pointer" }} onClick={() => togglePath(path.id)}>
                {expandedPaths.includes(path.id) ? <ChevronDown size={20} color="#6B7280" /> : <ChevronRight size={20} color="#6B7280" />}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ 
                      display: "flex", alignItems: "center", justifyContent: "center", 
                      width: "32px", height: "32px", borderRadius: "8px", 
                      background: path.bg_color || "#E1F5EE", color: path.color || "#059669",
                      flexShrink: 0, fontSize: "16px", overflow: "hidden"
                    }}>
                      {(() => {
                        const iconStr = path.icon || "🚀";
                        if (iconStr.length <= 2) return iconStr;
                        const IconCmp = (LucideIcons as any)[iconStr];
                        return IconCmp ? <IconCmp size={18} /> : iconStr.charAt(0);
                      })()}
                    </span>
                    <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>{path.title}</h3>
                    {path.status === 'published' ? (
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 6px", background: "#D1FAE5", color: "#059669", borderRadius: "4px", textTransform: "uppercase" }}>Published</span>
                    ) : (
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 6px", background: "#F3F4F6", color: "#6B7280", borderRadius: "4px", textTransform: "uppercase" }}>Draft</span>
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px", marginLeft: "44px" }}>{path.path_courses?.length || 0} Courses</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setEditingPath(path)} style={{ padding: "8px", background: "var(--bg-tertiary)", border: "none", borderRadius: "8px", color: "var(--text-secondary)", cursor: "pointer" }}><Edit2 size={16} /></button>
                <button onClick={() => handleDeletePath(path.id)} style={{ padding: "8px", background: "none", border: "none", borderRadius: "8px", color: "#EF4444", cursor: "pointer" }}><Trash2 size={16} /></button>
              </div>
            </div>

            {expandedPaths.includes(path.id) && (
              <div style={{ padding: "24px", background: "var(--bg-secondary)" }}>
                <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                  <select 
                    id={`select-${path.id}`}
                    style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid var(--border-primary)" }}
                    defaultValue=""
                  >
                    <option value="" disabled>Select a course to add...</option>
                    {courses.filter(c => !path.path_courses.some((pc: any) => pc.course_id === c.id)).map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => {
                      const select = document.getElementById(`select-${path.id}`) as HTMLSelectElement;
                      if (select && select.value) {
                        handleAddCourseToPath(path.id, select.value);
                        select.value = "";
                      }
                    }}
                    style={{ padding: "10px 20px", background: "var(--brand-primary)", color: "white", borderRadius: "8px", border: "none", fontWeight: 600, cursor: "pointer" }}
                  >
                    Add Course
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  {path.path_courses.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px", color: "#9CA3AF", fontSize: "14px" }}>No courses assigned yet.</div>
                  ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => handleDragEnd(event, path.id)}>
                      <SortableContext items={path.path_courses.map((pc: any) => pc.id)} strategy={verticalListSortingStrategy}>
                        {path.path_courses.map((pc: any, index: number) => (
                          <SortableCourseItem key={pc.id} id={pc.id} pc={pc} index={index} onRemove={handleRemoveCourseFromPath} />
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {paths.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px", background: "var(--bg-card)", borderRadius: "16px", border: "1px dashed #E5E7EB" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--bg-tertiary)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
              <TrendingUp size={32} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>No paths yet</h3>
            <p style={{ color: "var(--text-tertiary)", fontSize: "14px" }}>Create your first learning path to guide students.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {editingPath && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--bg-card)", padding: "32px", borderRadius: "16px", width: "400px", maxWidth: "90%" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "20px" }}>{editingPath.id ? "Edit Path" : "New Path"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Path Title</label>
                <input 
                  type="text" 
                  value={editingPath.title || ""} 
                  onChange={e => setEditingPath({...editingPath, title: e.target.value})}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-primary)", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Description</label>
                <textarea 
                  value={editingPath.description || ""} 
                  onChange={e => setEditingPath({...editingPath, description: e.target.value})}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-primary)", outline: "none", resize: "vertical", minHeight: "80px" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Status</label>
                <select 
                  value={editingPath.status || "draft"} 
                  onChange={e => setEditingPath({...editingPath, status: e.target.value})}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-primary)", outline: "none" }}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Icon (Emoji or Lucide name)</label>
                  <input 
                    type="text" 
                    value={editingPath.icon || "🚀"} 
                    onChange={e => setEditingPath({...editingPath, icon: e.target.value})}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-primary)", outline: "none" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Color</label>
                  <input 
                    type="color" 
                    value={editingPath.color || "#059669"} 
                    onChange={e => setEditingPath({...editingPath, color: e.target.value})}
                    style={{ width: "100%", height: "42px", padding: "2px", borderRadius: "8px", border: "1px solid var(--border-primary)", outline: "none", cursor: "pointer" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Bg Color</label>
                  <input 
                    type="color" 
                    value={editingPath.bg_color || "#E1F5EE"} 
                    onChange={e => setEditingPath({...editingPath, bg_color: e.target.value})}
                    style={{ width: "100%", height: "42px", padding: "2px", borderRadius: "8px", border: "1px solid var(--border-primary)", outline: "none", cursor: "pointer" }}
                  />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button onClick={() => setEditingPath(null)} style={{ padding: "8px 16px", background: "var(--bg-tertiary)", borderRadius: "8px", border: "none", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSavePath} style={{ padding: "8px 16px", background: "#111827", color: "white", borderRadius: "8px", border: "none", fontWeight: 600, cursor: "pointer" }}>Save Path</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

