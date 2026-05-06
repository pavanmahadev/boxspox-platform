import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { quizId, answers } = await req.json();

  if (!quizId || !answers) {
    return NextResponse.json({ error: "Missing quizId or answers" }, { status: 400 });
  }

  // Fetch quiz and questions with answers
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("*, questions:quiz_questions(*)")
    .eq("id", quizId)
    .single();

  if (quizError || !quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  let correctCount = 0;
  const questions = quiz.questions.sort((a: any, b: any) => a.order_index - b.order_index);

  questions.forEach((q: any, idx: number) => {
    const selectedOptionIndex = answers[idx];
    if (q.options[selectedOptionIndex]?.isCorrect) {
      correctCount++;
    }
  });

  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= quiz.passing_score;

  // Save attempt
  const { data: attempt, error: attemptError } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: user.id,
      quiz_id: quizId,
      score,
      passed
    })
    .select()
    .single();

  if (attemptError) {
    return NextResponse.json({ error: "Failed to save attempt" }, { status: 500 });
  }

  return NextResponse.json({
    score,
    passed,
    correctCount,
    total: questions.length,
    attemptId: attempt.id
  });
}
