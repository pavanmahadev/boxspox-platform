import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized — please log in." }, { status: 401 });
    }

    const { lessonTitle, lessonContent } = await req.json();
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: "AI Tutor is currently unavailable. Please check the server configuration." 
      }, { status: 503 });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert programming instructor for the Pandaschool platform.
The student is currently taking a lesson titled: "${lessonTitle}".
Here is the content of the lesson for your context:
${lessonContent?.substring(0, 4000) || "No content provided."}

Generate a multiple-choice quiz based ONLY on the provided lesson content.
The quiz should have EXACTLY 3 questions. Each question must have EXACTLY 4 options, and only one correct option.

You MUST respond strictly in the following JSON format without any markdown wrappers or code blocks:
{
  "title": "Quiz: ${lessonTitle}",
  "passing_score": 60,
  "questions": [
    {
      "question": "Question text here?",
      "options": [
        { "text": "Option A", "isCorrect": true },
        { "text": "Option B", "isCorrect": false },
        { "text": "Option C", "isCorrect": false },
        { "text": "Option D", "isCorrect": false }
      ]
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    let textResult = result.response.text();
    
    // Clean up potentially wrapped JSON (markdown backticks)
    if (textResult.includes("\`\`\`json")) {
      textResult = textResult.replace(/\`\`\`json\n?/, "").replace(/\`\`\`\n?$/, "");
    }
    
    const quizData = JSON.parse(textResult.trim());
    
    return NextResponse.json(quizData);
  } catch (error: any) {
    console.error("AI Quiz Error:", error);
    return NextResponse.json({ 
      error: "Failed to generate AI Quiz", 
      message: "The AI service encountered an error generating the quiz." 
    }, { status: 500 });
  }
}
