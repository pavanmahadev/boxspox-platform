import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or instructor
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!profile || (profile.role !== "admin" && profile.role !== "instructor")) {
      return NextResponse.json({ error: "Unauthorized. Only admins and instructors can use this feature." }, { status: 403 });
    }

    const { lessonTitle, moduleTitle, courseTitle } = await req.json();
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: "Groq API key not configured. Please add GROQ_API_KEY to your .env file." }, { status: 500 });
    }

    // Groq is compatible with the OpenAI SDK
    const openai = new OpenAI({
      apiKey: GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const prompt = `You are an expert technical writer and instructor for the Boxspox platform.
Generate a comprehensive, engaging, and easy-to-understand lesson content for a tutorial.

Course: "${courseTitle}"
Module: "${moduleTitle}"
Lesson: "${lessonTitle}"

Requirements:
1. Use clear headings (##, ###) and formatting.
2. Provide practical examples.
3. If applicable, include code snippets in appropriate languages (e.g., \`\`\`bash, \`\`\`js).
4. Keep the tone encouraging and professional.
5. Do not include a title for the lesson (the system adds it).
6. Return ONLY the markdown content.

Generate the lesson content now:`;

    const response = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "user", content: prompt }
      ],
    });

    const content = response.choices[0].message.content;
    const usage = response.usage;

    // Log usage to database
    if (usage) {
      await supabase.from("ai_usage").insert({
        user_id: session.user.id,
        feature: "generate-lesson-content",
        model: "llama-3.3-70b-versatile",
        prompt_tokens: usage.prompt_tokens,
        completion_tokens: usage.completion_tokens,
        total_tokens: usage.total_tokens,
      });
    }

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
