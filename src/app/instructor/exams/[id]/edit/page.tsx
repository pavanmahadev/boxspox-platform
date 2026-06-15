"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";
import ExamForm from "@/components/instructor/ExamForm";

export default function EditExam({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const supabase = createClient();
  const { showToast } = useToast();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExam() {
      try {
        const { data, error } = await supabase
          .from("exams")
          .select("*, exam_questions(*)")
          .eq("id", id)
          .single();
        
        if (data) {
          // Sort questions by order_index just to be safe
          if (data.exam_questions) {
            data.exam_questions.sort((a: any, b: any) => a.order_index - b.order_index);
          }
          setInitialData({ exam: data, questions: data.exam_questions || [] });
        }
      } catch (err) {
        console.error("Exception in loadExam:", err);
      } finally {
        setLoading(false);
      }
    }
    loadExam();
  }, [id]);

  const handleSubmit = async (examData: any, questionsData: any[]) => {
    const res = await fetch("/api/exams/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        examId: id, 
        exam: examData, 
        questions: questionsData 
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || `Server error: ${res.status}`);
    }

    showToast("✅ Exam updated successfully!", "success");
    router.push("/instructor/exams");
    router.refresh();
  };

  if (loading) return <div style={{ padding: 40 }}>Loading exam...</div>;
  if (!initialData) return <div style={{ padding: 40 }}>Exam not found.</div>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
        <Link href="/instructor/exams" style={{
          width: "40px", height: "40px", borderRadius: "50%", background: "var(--bg-card)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid var(--border-primary)", color: "var(--text-primary)"
        }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>
            Edit Exam: {initialData.exam.title}
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "14px" }}>
            Make changes to your exam configuration and questions.
          </p>
        </div>
      </div>
      
      <ExamForm 
        initialData={initialData} 
        onSubmit={handleSubmit} 
        submitLabel="Update Exam" 
      />
    </div>
  );
}
