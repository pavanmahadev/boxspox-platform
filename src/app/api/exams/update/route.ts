import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { examId, exam, questions } = await req.json();

    if (!examId) {
      return NextResponse.json({ error: "Exam ID is required" }, { status: 400 });
    }

    if (!exam?.title) {
      return NextResponse.json({ error: "Exam title is required" }, { status: 400 });
    }

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify ownership
    const { data: existingExam, error: checkError } = await admin
      .from("exams")
      .select("created_by")
      .eq("id", examId)
      .single();

    if (checkError || !existingExam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (existingExam.created_by !== user.id) {
      return NextResponse.json({ error: "Unauthorized: You do not own this exam" }, { status: 403 });
    }

    // 1. Update Exam Details
    const { error: examError } = await admin.from("exams").update({
      title: exam.title,
      description: exam.description || null,
      passing_score: exam.passing_score || 70,
      time_limit_minutes: exam.time_limit_minutes || 60,
      is_published: exam.is_published || false,
    }).eq("id", examId);

    if (examError) {
      console.error("Exam update error:", examError);
      return NextResponse.json({ error: examError.message }, { status: 500 });
    }

    // 2. Replace Questions (Delete existing, insert new)
    const { error: deleteError } = await admin
      .from("exam_questions")
      .delete()
      .eq("exam_id", examId);

    if (deleteError) {
      console.error("Questions delete error:", deleteError);
      return NextResponse.json({ error: "Failed to clear old questions: " + deleteError.message }, { status: 500 });
    }

    if (questions && questions.length > 0) {
      const questionsToInsert = questions.map((q: any, i: number) => {
        let processedOptions = q.options;
        let processedAnswer = q.correct_answer;

        if (q.question_type === "match_the_following") {
          processedOptions = {
            left: q.options.map((o: any) => o.left),
            right: q.options.map((o: any) => o.right),
          };
          const answerMap: Record<string, string> = {};
          q.options.forEach((o: any) => { answerMap[o.left] = o.right; });
          processedAnswer = JSON.stringify(answerMap);
        }

        return {
          exam_id: examId,
          question_text: q.question_text,
          question_type: q.question_type,
          options: processedOptions,
          correct_answer: processedAnswer || "",
          points: q.points || 1,
          order_index: i,
        };
      });

      const { error: qError } = await admin.from("exam_questions").insert(questionsToInsert);
      if (qError) {
        console.error("Questions insert error:", qError);
        return NextResponse.json({ error: qError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, examId });
  } catch (err: any) {
    console.error("Update exam API error:", err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
