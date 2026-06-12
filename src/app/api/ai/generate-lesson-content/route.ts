import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: "Groq API key not configured. Please add GROQ_API_KEY to your environment variables." }, { status: 500 });
    }

    const supabase = await createClient();

    // Use getUser() instead of getSession() — more reliable in API routes
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized — please log in." }, { status: 401 });
    }

    // Check if user is admin or instructor
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "admin" && profile.role !== "instructor")) {
      return NextResponse.json({ error: "Unauthorized. Only admins and instructors can use this feature." }, { status: 403 });
    }

    const body = await req.json();
    const { lessonTitle, moduleTitle, courseTitle } = body;

    if (!lessonTitle) {
      return NextResponse.json({ error: "lessonTitle is required." }, { status: 400 });
    }

    // Groq is compatible with the OpenAI SDK
    const openai = new OpenAI({
      apiKey: GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const prompt = `You are an expert technical writer and instructor for the Pandaschool platform.
Generate a comprehensive, engaging, and easy-to-understand lesson content for a tutorial.

Course: "${courseTitle || "Unknown Course"}"
Module: "${moduleTitle || "Unknown Module"}"
Lesson: "${lessonTitle}"

Requirements:
1. Use clear headings (##, ###) and formatting.
2. Provide practical examples with real-world context.
3. If applicable, include code snippets in appropriate languages (e.g., \`\`\`bash, \`\`\`js, \`\`\`python).
4. Keep the tone encouraging and professional.
5. Do not include a title for the lesson (the system adds it automatically).
6. Return ONLY the markdown content, nothing else.

Generate the lesson content now:`;

    const response = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "AI returned empty content. Please try again." }, { status: 500 });
    }

    const usage = response.usage;

    // Log usage to database (non-blocking — don't fail if this errors)
    if (usage) {
      // Log usage to database
      try {
        await supabase.from("ai_usage").insert({
          user_id: user.id,
          feature: "generate-lesson-content",
          model: "llama-3.1-8b-instant",
          prompt_tokens: usage.prompt_tokens,
          completion_tokens: usage.completion_tokens,
          total_tokens: usage.total_tokens,
        });
      } catch (e) {
        console.warn("Failed to log AI usage:", e);
      }
    }

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("AI Generate Content Error:", error);
    // Return the actual Groq error message if available
    const message = error?.error?.message || error?.message || "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
