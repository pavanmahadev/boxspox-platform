"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import Groq from "groq-sdk";

// Ensure a final exam quiz exists for the course; return its ID
async function ensureExam(supabase: any, courseId: string, courseTitle: string) {
  const { data: existing } = await supabase
    .from("quizzes")
    .select("id")
    .eq("course_id", courseId)
    .eq("is_final_exam", true)
    .limit(1)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created } = await supabase
    .from("quizzes")
    .insert({
      course_id: courseId,
      title: `${courseTitle} Final Certification Exam`,
      description: `Comprehensive final exam for ${courseTitle}.`,
      is_final_exam: true,
      time_limit_minutes: 30,
      passing_score: 80,
    })
    .select("id")
    .single();

  return created?.id ?? null;
}

export async function updateExamSettingsAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const quizId = formData.get("quizId") as string;
  const timeLimitMinutes = parseInt(formData.get("timeLimitMinutes") as string, 10);
  const passingScore = parseInt(formData.get("passingScore") as string, 10);
  const courseId = formData.get("courseId") as string;

  const { error } = await supabase
    .from("quizzes")
    .update({ time_limit_minutes: timeLimitMinutes, passing_score: passingScore })
    .eq("id", quizId);

  if (error) return { error: error.message };

  revalidatePath(`/instructor/courses/${courseId}/exam`);
  return { success: true };
}

export async function addQuestionAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const courseId = formData.get("courseId") as string;
  const courseTitle = formData.get("courseTitle") as string;
  const questionType = formData.get("questionType") as string;
  const question = formData.get("question") as string;
  const codeTemplate = formData.get("codeTemplate") as string;
  const expectedOutput = formData.get("expectedOutput") as string;

  // Get or create exam
  const quizId = await ensureExam(supabase, courseId, courseTitle);
  if (!quizId) return { error: "Failed to create exam" };

  // Parse options for MC, TF, and Match questions
  let options: any[] = [];
  if (questionType === "multiple_choice" || questionType === "true_false" || questionType === "match_the_following") {
    const optionCount = parseInt(formData.get("optionCount") as string, 10) || 4;
    for (let i = 0; i < optionCount; i++) {
      options.push({
        text: formData.get(`option_${i}`) as string,
        isCorrect: formData.get(`correct_${i}`) === "true",
        matchTarget: formData.get(`matchTarget_${i}`) as string || undefined,
      });
    }
    if (questionType !== "match_the_following") {
      const hasCorrect = options.some((o) => o.isCorrect);
      if (!hasCorrect) return { error: "At least one option must be marked as correct" };
    }
  } else {
    options = [];
  }

  // Get current question count for order_index
  const { count } = await supabase
    .from("quiz_questions")
    .select("id", { count: "exact", head: true })
    .eq("quiz_id", quizId);

  const { error } = await supabase.from("quiz_questions").insert({
    quiz_id: quizId,
    question_type: questionType,
    question,
    options,
    code_template: codeTemplate || null,
    expected_output: expectedOutput || null,
    order_index: count ?? 0,
  });

  if (error) return { error: error.message };

  revalidatePath(`/instructor/courses/${courseId}/exam`);
  return { success: true };
}

export async function updateQuestionAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const questionId = formData.get("questionId") as string;
  const courseId = formData.get("courseId") as string;
  const questionType = formData.get("questionType") as string;
  const question = formData.get("question") as string;
  const codeTemplate = formData.get("codeTemplate") as string;
  const expectedOutput = formData.get("expectedOutput") as string;

  let options: any[] = [];
  if (questionType === "multiple_choice" || questionType === "true_false" || questionType === "match_the_following") {
    const optionCount = parseInt(formData.get("optionCount") as string, 10) || 4;
    for (let i = 0; i < optionCount; i++) {
      options.push({
        text: formData.get(`option_${i}`) as string,
        isCorrect: formData.get(`correct_${i}`) === "true",
        matchTarget: formData.get(`matchTarget_${i}`) as string || undefined,
      });
    }
    if (questionType !== "match_the_following") {
      const hasCorrect = options.some((o) => o.isCorrect);
      if (!hasCorrect) return { error: "At least one option must be marked as correct" };
    }
  }

  const { error } = await supabase
    .from("quiz_questions")
    .update({
      question_type: questionType,
      question,
      options,
      code_template: codeTemplate || null,
      expected_output: expectedOutput || null,
    })
    .eq("id", questionId);

  if (error) return { error: error.message };

  revalidatePath(`/instructor/courses/${courseId}/exam`);
  return { success: true };
}

export async function deleteQuestionAction(questionId: string, courseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("quiz_questions")
    .delete()
    .eq("id", questionId);

  if (error) return { error: error.message };

  revalidatePath(`/instructor/courses/${courseId}/exam`);
  return { success: true };
}

export async function reorderQuestionsAction(
  questionIds: string[],
  courseId: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const updates = questionIds.map((id, idx) =>
    supabase.from("quiz_questions").update({ order_index: idx }).eq("id", id)
  );

  await Promise.all(updates);
  revalidatePath(`/instructor/courses/${courseId}/exam`);
  return { success: true };
}

export async function generateExamWithAIAction(courseId: string, courseTitle: string, numQuestions: number = 5) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) return { error: "AI service is not configured. Please add GROQ_API_KEY to your .env file." };

  const quizId = await ensureExam(supabase, courseId, courseTitle);
  if (!quizId) return { error: "Failed to create or find exam" };

  // Get current question count to append correctly
  const { count } = await supabase
    .from("quiz_questions")
    .select("id", { count: "exact", head: true })
    .eq("quiz_id", quizId);
  let startIndex = count ?? 0;

  try {
    const groq = new Groq({ apiKey: GROQ_API_KEY });

    const prompt = `You are an expert exam creator for the Pandaschool platform. 
Generate exactly ${numQuestions} high-quality, challenging questions for a final certification exam strictly on the topic of: "${courseTitle}".

CRITICAL INSTRUCTION: ALL questions MUST be exclusively related to "${courseTitle}". Do not include general, unrelated programming questions. Every question must test the user's knowledge on this specific course subject.

You must generate a variety of question types. Mix and match from: "multiple_choice", "true_false", "short_answer", "fill_in_the_blank", and "match_the_following".

Return ONLY a valid JSON array of objects. Do not include markdown code blocks or any other text.
Format each object EXACTLY according to its question_type schema (use realistic, meaningful text for options, NOT literal "A", "B", etc.):

[
  {
    "question_type": "multiple_choice",
    "question": "What is the primary purpose of a Git commit?",
    "options": [
      {"text": "To save a snapshot of changes", "isCorrect": true}, 
      {"text": "To download code from a remote", "isCorrect": false},
      {"text": "To delete old files", "isCorrect": false},
      {"text": "To branch the repository", "isCorrect": false}
    ]
  },
  {
    "question_type": "true_false",
    "question": "HTML is a programming language.",
    "options": [{"text": "True", "isCorrect": false}, {"text": "False", "isCorrect": true}]
  },
  {
    "question_type": "short_answer",
    "question": "What does CSS stand for?",
    "expected_output": "Cascading Style Sheets"
  },
  {
    "question_type": "fill_in_the_blank",
    "question": "The ___ tag is used for images, and requires a ___ attribute.",
    "expected_output": "[\\"img\\", \\"src\\"]"
  },
  {
    "question_type": "match_the_following",
    "question": "Match the terms.",
    "options": [{"text": "HTML", "isCorrect": true, "matchTarget": "Structure"}, {"text": "CSS", "isCorrect": true, "matchTarget": "Style"}]
  }
]`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a precise JSON generator. You output only valid JSON without markdown wrapping." },
        { role: "user", content: prompt }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
    });

    let text = chatCompletion.choices[0]?.message?.content?.trim() || "";
    
    // Clean up potential markdown formatting if the model still outputs it
    if (text.startsWith("\`\`\`json")) text = text.substring(7);
    if (text.startsWith("\`\`\`")) text = text.substring(3);
    if (text.endsWith("\`\`\`")) text = text.substring(0, text.length - 3);
    text = text.trim();

    const questionsList = JSON.parse(text);

    if (!Array.isArray(questionsList) || questionsList.length === 0) {
      return { error: "AI generated an invalid format." };
    }

    const inserts = questionsList.map((q: any, i: number) => ({
      quiz_id: quizId,
      question_type: q.question_type || "multiple_choice",
      question: q.question,
      options: q.options || [],
      expected_output: q.expected_output || null,
      order_index: startIndex + i,
    }));

    const { error } = await supabase.from("quiz_questions").insert(inserts);
    if (error) return { error: error.message };

    revalidatePath(`/instructor/courses/${courseId}/exam`);
    return { success: true };
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return { error: "Failed to generate questions using AI. Check your API key or try again." };
  }
}
