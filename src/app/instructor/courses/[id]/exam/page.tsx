import React from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ExamBuilder } from "@/components/instructor/ExamBuilder";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default async function ExamBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  let query = supabase.from("courses").select("*").eq("id", id);
  if (profile?.role !== "admin") query = query.eq("instructor_id", user.id);
  const { data: course } = await query.single();
  if (!course) notFound();

  // Fetch exam and questions
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("*, questions:quiz_questions(*)")
    .eq("course_id", id)
    .eq("is_final_exam", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const questions = quiz?.questions
    ? [...quiz.questions].sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", paddingBottom: "60px" }}>
      {/* Breadcrumb header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <Link href={`/instructor/courses/${id}`}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-tertiary)", textDecoration: "none", fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>
            <ArrowLeft size={14} /> Back to Course
          </Link>
          <h1 style={{ fontSize: "26px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "6px" }}>
            Exam Builder
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>{course.title}</p>
        </div>
        <Link href={`/tutorials/${course.slug}/exam`} target="_blank"
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "var(--bg-secondary)", borderRadius: "10px", color: "var(--text-primary)", textDecoration: "none", fontWeight: 700, border: "1px solid var(--border-primary)", fontSize: "13px" }}>
          <ExternalLink size={16} /> Preview Exam
        </Link>
      </div>

      <ExamBuilder
        courseId={id}
        courseTitle={course.title}
        quizId={quiz?.id ?? null}
        initialQuestions={questions}
        timeLimitMinutes={quiz?.time_limit_minutes ?? 30}
        passingScore={quiz?.passing_score ?? 80}
      />
    </div>
  );
}
