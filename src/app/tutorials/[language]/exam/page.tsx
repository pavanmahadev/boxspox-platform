import React from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import ActiveExam from "@/components/exam/ActiveExam";
import { executeCodeInPiston } from "@/utils/piston";

export const dynamic = "force-dynamic";

export default async function ExamPage({
  params,
  searchParams,
}: {
  params: Promise<{ language: string }>;
  searchParams: Promise<{ failed?: string; score?: string }>;
}) {
  const { language } = await params;
  const { failed, score } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=/tutorials/${language}/exam`);
  }

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", language)
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
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at top left, rgba(15, 110, 86, 0.05) 0%, transparent 50%), radial-gradient(circle at bottom right, rgba(16, 185, 129, 0.03) 0%, transparent 50%), var(--bg-secondary)",
        padding: "20px"
      }}>
        <div style={{
          background: "var(--bg-primary)",
          padding: "60px 40px",
          borderRadius: "28px",
          maxWidth: "520px",
          width: "100%",
          textAlign: "center",
          border: "1px solid var(--border-primary)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08), 0 0 0 1px rgba(16, 185, 129, 0.05)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "6px", background: "linear-gradient(90deg, var(--brand-primary), var(--brand-accent))" }} />
          <div style={{
            width: "88px",
            height: "88px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.03))",
            color: "var(--brand-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 28px",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            boxShadow: "0 10px 20px -5px rgba(16, 185, 129, 0.1)"
          }}>
            <CheckCircle2 size={44} />
          </div>
          <h1 style={{ fontSize: "30px", fontWeight: 900, marginBottom: "12px", letterSpacing: "-0.5px" }}>You Already Passed!</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "36px", lineHeight: 1.6, fontSize: "15px" }}>
            Outstanding work! You successfully certified in <strong>{course.title}</strong> with a score of <strong>{enrollment.final_exam_score}%</strong>.
          </p>
          <Link
            href={`/certificates/${enrollment.certificate_id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              background: "var(--brand-primary)",
              color: "white",
              padding: "16px 32px",
              borderRadius: "14px",
              textDecoration: "none",
              fontWeight: 800,
              fontSize: "15px",
              boxShadow: "0 10px 25px -5px rgba(15, 110, 86, 0.4)"
            }}
          >
            View Verified Certificate <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  // Show failed result screen — DO NOT reload the exam (causes re-submission loop)
  if (failed === "true") {
    const failedScore = parseInt(score || "0", 10);
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at top left, rgba(220, 38, 38, 0.02) 0%, transparent 50%), radial-gradient(circle at bottom right, rgba(17, 24, 39, 0.03) 0%, transparent 50%), var(--bg-secondary)",
        padding: "20px"
      }}>
        <div style={{
          background: "var(--bg-primary)",
          padding: "60px 40px",
          borderRadius: "28px",
          maxWidth: "520px",
          width: "100%",
          textAlign: "center",
          border: "1px solid var(--border-primary)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08), 0 0 0 1px rgba(220, 38, 38, 0.05)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "6px", background: "linear-gradient(90deg, #DC2626, #EF4444)" }} />
          <div style={{
            width: "88px",
            height: "88px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(220, 38, 38, 0.02))",
            color: "#DC2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 28px",
            border: "1px solid rgba(220, 38, 38, 0.15)",
            boxShadow: "0 10px 20px -5px rgba(220, 38, 38, 0.08)"
          }}>
            <XCircle size={44} />
          </div>
          <h1 style={{ fontSize: "30px", fontWeight: 900, marginBottom: "12px", letterSpacing: "-0.5px" }}>Exam Not Passed</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "10px", lineHeight: 1.6, fontSize: "15px" }}>
            You scored <strong style={{ color: "#DC2626" }}>{failedScore}%</strong>. A score of <strong>80% or higher</strong> is required to earn certification.
          </p>
          <p style={{ color: "var(--text-tertiary)", fontSize: "14px", marginBottom: "40px", lineHeight: 1.6 }}>
            Review the course material to sharpen your knowledge and try again whenever you are ready.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Link
              href={`/tutorials/${language}/exam`}
              prefetch={false}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                background: "var(--brand-primary)",
                color: "white",
                padding: "16px 28px",
                borderRadius: "14px",
                textDecoration: "none",
                fontWeight: 800,
                fontSize: "15px",
                boxShadow: "0 10px 25px -5px rgba(15, 110, 86, 0.3)"
              }}
            >
              <RotateCcw size={18} /> Retry Exam
            </Link>
            <Link
              href={`/tutorials/${language}`}
              prefetch={false}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                padding: "15px 28px",
                borderRadius: "14px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "15px",
                border: "1px solid var(--border-primary)"
              }}
            >
              Review Course
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fetch the exam — limit(1) + maybeSingle to safely handle any duplicates
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
            href={`/tutorials/${language}`}
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

  // Server Action: securely grades the exam
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
          // Send to Piston Sandbox for real evaluation
          const output = await executeCodeInPiston(language, userAnswer);
          
          if (output !== null) {
            const outStr = output.toLowerCase().trim();
            const exp = (q.expected_output || "").toLowerCase().trim();
            
            // If the execution output contains the expected keyword, mark it correct.
            // Or if expectedOutput is empty, just consider it correct for running without crashing.
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
      
      // Check if a certificate already exists for this user and course
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
          // Fallback select in case of race conditions
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

        // Create notification for passing final exam and earning certificate
        await supabase.from("notifications").insert({
          user_id: user.id,
          type: "success",
          title: "Exam Passed & Certified! 🎓",
          body: `Congratulations! You scored ${examScore}% on the final exam for ${course.title} and earned your official certificate.`,
          link: `/certificates/${cert.id}`,
          is_read: false
        });

        redirect(`/certificates/${cert.id}?just_passed=true&score=${examScore}`);
      } else {
        throw new Error("Failed to issue or retrieve certificate. Please contact support.");
      }
    } else {
      // Create notification for failing the exam
      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "error",
        title: "Exam Attempt Finished",
        body: `You scored ${examScore}% on the final exam for ${course.title}. A score of 80% or higher is required. Review the material and try again!`,
        link: `/tutorials/${course.slug}/exam`,
        is_read: false
      });

      // Go to the FAILED results screen — NOT back to the live exam
      redirect(`/tutorials/${course.slug}/exam?failed=true&score=${examScore}`);
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
