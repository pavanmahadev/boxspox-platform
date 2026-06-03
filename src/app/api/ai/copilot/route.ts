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

    // Role check - Only allow admins and instructors
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin" && profile?.role !== "instructor") {
       return NextResponse.json({ error: "Forbidden: You don't have access to the AI Co-Pilot." }, { status: 403 });
    }

    const { query, template } = await req.json();
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ 
        response: "AI Co-Pilot is currently unavailable. Please check the server configuration." 
      }, { status: 503 });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert AI Co-Pilot integrated directly into an online CodeSandbox editor.
The user is currently writing code in the "${template}" environment (e.g. Vanilla JS, React, etc.).

The user has asked for help:
"${query}"

Provide a highly concise, accurate answer containing code snippets they can directly copy and paste.
Use standard markdown formatting for code.
Keep your response short and to the point.
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("AI Co-Pilot Error:", error);
    return NextResponse.json({ 
      error: "AI Co-Pilot is temporarily unavailable"
    }, { status: 500 });
  }
}
