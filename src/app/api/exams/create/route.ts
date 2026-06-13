import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    // Authenticate the user via their session
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { exam, questions } = await req.json();

    if (!exam?.title) {
      return NextResponse.json({ error: "Exam title is required" }, { status: 400 });
    }

    // Use service role to bypass RLS for insert
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Insert Exam
    const { data: examData, error: examError } = await admin.from("exams").insert({
      title: exam.title,
      description: exam.description || null,
      passing_score: exam.passing_score || 70,
      time_limit_minutes: exam.time_limit_minutes || 60,
      is_published: exam.is_published || false,
      created_by: user.id,
    }).select().single();

    if (examError) {
      console.error("Exam insert error:", examError);
      return NextResponse.json({ error: examError.message }, { status: 500 });
    }

    // 2. Insert Questions
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
          exam_id: examData.id,
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
        // Rollback exam
        await admin.from("exams").delete().eq("id", examData.id);
        return NextResponse.json({ error: qError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, examId: examData.id });
  } catch (err: any) {
    console.error("Create exam API error:", err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
