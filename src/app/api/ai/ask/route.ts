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

    const { question, lessonTitle, lessonContent, history } = await req.json();
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ 
        answer: "AI Tutor is currently unavailable. Please check the server configuration." 
      }, { status: 503 });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Format history for multi-turn conversation
    const historyText = Array.isArray(history) 
      ? history.map((h: any) => `${h.role === 'user' ? 'Student' : 'Tutor'}: ${h.content}`).join('\n')
      : "";

    const prompt = `You are an expert programming tutor for the Boxspox platform.
The student is currently taking a lesson titled: "${lessonTitle}".
Here is the content of the lesson for your context:
${lessonContent?.substring(0, 3000) || "No content provided."}

Previous Conversation History:
${historyText || "No previous history."}

The student has asked the following new question:
"${question}"

Provide a clear, encouraging, and accurate answer to the student's question. 
If relevant, provide a short code example. Use markdown for formatting. 
Keep your response concise and focused on the lesson content.`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error("AI Error:", error);
    // Sanitize error before returning to client
    return NextResponse.json({ 
      error: "AI Tutor is temporarily unavailable", 
      message: "The AI service encountered an error. Please try again in a few moments." 
    }, { status: 500 });
  }
}
