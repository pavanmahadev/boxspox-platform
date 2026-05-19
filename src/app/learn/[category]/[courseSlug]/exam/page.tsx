import React from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import ActiveExam from "@/components/exam/ActiveExam";
import { executeCodeInPiston } from "@/utils/piston";

export const dynamic = "force-dynamic";

export default async function LearnExamPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string; courseSlug: string }>;
  searchParams: Promise<{ failed?: string; score?: string }>;
}) {
  const { category, courseSlug } = await params;
  const { failed, score } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=/learn/${category}/${courseSlug}/exam`);
  }

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", courseSlug)
    .single();

  if (!course) notFound();

  // Check enrollment and exam unlock status
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .maybeSingle();

  if (!enrollment?.exam_unlocked) {
    redirect(`/checkout/${course.id}`);
  }

  // Already passed — show certificate page
  if (enrollment.final_exam_passed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-secondary)", padding: "20px" }}>
        <div style={{ background: "var(--bg-primary)", padding: "60px 40px", borderRadius: "32px", maxWidth: "520px", width: "100%", textAlign: "center", border: "1px solid var(--border-primary)", boxShadow: "0 20px 60px rgba(0,0,0,0.06)" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#ECFDF5", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <CheckCircle2 size={40} />
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "12px" }}>You Already Passed!</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "32px", lineHeight: 1.6 }}>
            You passed the {course.title} certification with a score of <strong>{enrollment.final_exam_score}%</strong>.
          </p>
          <Link
            href={`/certificates/${enrollment.certificate_id}`}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--brand-primary)", color: "white", padding: "14px 28px", borderRadius: "14px", textDecoration: "none", fontWeight: 800 }}
          >
            View Certificate <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  // Show failed result screen
  if (failed === "true") {
    const failedScore = parseInt(score || "0", 10);
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-secondary)", padding: "20px" }}>
        <div style={{ background: "var(--bg-primary)", padding: "60px 40px", borderRadius: "32px", maxWidth: "520px", width: "100%", textAlign: "center", border: "1px solid var(--border-primary)", boxShadow: "0 20px 60px rgba(0,0,0,0.06)" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#FEF2F2", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <XCircle size={40} />
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "12px" }}>Exam Not Passed</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "8px", lineHeight: 1.6 }}>
            You scored <strong style={{ color: "#DC2626" }}>{failedScore}%</strong>. A score of <strong>80% or higher</strong> is required to pass.
          </p>
          <p style={{ color: "var(--text-tertiary)", fontSize: "14px", marginBottom: "40px", lineHeight: 1.6 }}>
            Review the course material and try again whenever you are ready.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Link
              href={`/learn/${category}/${courseSlug}/exam`}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "var(--brand-primary)", color: "white", padding: "16px 28px", borderRadius: "14px", textDecoration: "none", fontWeight: 800 }}
            >
              <RotateCcw size={18} /> Retry Exam
            </Link>
            <Link
              href={`/learn/${category}/${courseSlug}`}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "var(--bg-secondary)", color: "var(--text-primary)", padding: "14px 28px", borderRadius: "14px", textDecoration: "none", fontWeight: 700, border: "1px solid var(--border-primary)" }}
            >
              Review Course
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fetch the exam
  const { data: exam } = await supabase
    .from("quizzes")
    .select("*, questions:quiz_questions(*)")
    .eq("course_id", course.id)
    .eq("is_final_exam", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const hasQuestions = exam && exam.questions && exam.questions.length > 0;

  if (!hasQuestions) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-secondary)", padding: "20px" }}>
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "16px" }}>Exam Coming Soon</h1>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "24px" }}>
            The final exam for this course is being prepared by the instructor. Check back soon!
          </p>
          <Link
            href={`/learn/${category}/${courseSlug}`}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--brand-primary)", color: "white", padding: "14px 24px", borderRadius: "12px", textDecoration: "none", fontWeight: 700 }}
          >
            Back to Course
          </Link>
        </div>
      </div>
    );
  }

  // Sort questions by order_index
  const questions = [...exam.questions].sort(
    (a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0)
  );

  // Grading Server Action
  async function submitExamAction(answers: Record<number, any>) {
    "use server";
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    let correctCount = 0;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const userAnswer = answers[i];
      if (userAnswer === undefined || userAnswer === null) continue;

      if (q.question_type === "coding") {
        if (typeof userAnswer === "string" && userAnswer.trim().length > 0) {
          const output = await executeCodeInPiston(courseSlug, userAnswer);
          
          if (output !== null) {
            const outStr = output.toLowerCase().trim();
            const exp = (q.expected_output || "").toLowerCase().trim();
            
            if (!exp || outStr.includes(exp)) {
              correctCount++;
            }
          }
        }
      } else if (q.question_type === "short_answer") {
        if (
          typeof userAnswer === "string" && 
          q.expected_output && 
          userAnswer.trim().toLowerCase() === q.expected_output.trim().toLowerCase()
        ) {
          correctCount++;
        }
      } else if (q.question_type === "fill_in_the_blank") {
        try {
          const expectedArr = JSON.parse(q.expected_output);
          const userArr = userAnswer as string[];
          if (Array.isArray(expectedArr) && Array.isArray(userArr)) {
            let isCorrect = true;
            for (let j = 0; j < expectedArr.length; j++) {
              if ((userArr[j] || "").trim().toLowerCase() !== (expectedArr[j] || "").trim().toLowerCase()) {
                isCorrect = false;
                break;
              }
            }
            if (isCorrect && expectedArr.length === userArr.length) correctCount++;
          }
        } catch (e) {
          console.error("Failed to grade fill_in_the_blank", e);
        }
      } else if (q.question_type === "match_the_following") {
        const userArr = userAnswer as string[];
        if (Array.isArray(userArr)) {
          let isCorrect = true;
          for (let j = 0; j < q.options.length; j++) {
            if (userArr[j] !== q.options[j].matchTarget) {
              isCorrect = false;
              break;
            }
          }
          if (isCorrect && userArr.length === q.options.length) correctCount++;
        }
      } else {
        const option = q.options?.[userAnswer];
        if (option?.isCorrect) {
          correctCount++;
        }
      }
    }

    const total = questions.length || 1;
    const examScore = Math.round((correctCount / total) * 100);
    const passed = examScore >= (exam.passing_score || 80);

    // Record the attempt
    await supabase.from("quiz_attempts").insert({
      user_id: user.id,
      quiz_id: exam.id,
      score: examScore,
      passed,
      metadata: { answers },
    });

    if (passed) {
      let cert = null;
      
      const { data: existingCert } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", course.id)
        .maybeSingle();

      if (existingCert) {
        cert = existingCert;
      } else {
        const { data: newCert, error: insertError } = await supabase
          .from("certificates")
          .insert({ user_id: user.id, course_id: course.id })
          .select()
          .single();

        if (insertError) {
          console.error("[Exam] Certificate Insert Error:", insertError);
          const { data: fallbackCert } = await supabase
            .from("certificates")
            .select("*")
            .eq("user_id", user.id)
            .eq("course_id", course.id)
            .maybeSingle();
          cert = fallbackCert;
        } else {
          cert = newCert;
        }
      }

      if (cert) {
        await supabase
          .from("enrollments")
          .update({
            final_exam_passed: true,
            final_exam_score: examScore,
            certificate_id: cert.id,
          })
          .eq("user_id", user.id)
          .eq("course_id", course.id);

        redirect(`/certificates/${cert.id}?just_passed=true&score=${examScore}`);
      } else {
        throw new Error("Failed to issue or retrieve certificate. Please contact support.");
      }
    } else {
      redirect(`/learn/${category}/${courseSlug}/exam?failed=true&score=${examScore}`);
    }
  }

  return (
    <ActiveExam
      course={course}
      questions={questions}
      timeLimitMinutes={exam.time_limit_minutes || 30}
      submitAction={submitExamAction}
    />
  );
}
