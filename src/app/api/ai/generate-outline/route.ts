import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
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

    const { courseTitle } = await req.json();
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return NextResponse.json({ 
        error: "AI Service is currently unavailable." 
      }, { status: 503 });
    }

    const openai = new OpenAI({
      apiKey: GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const prompt = `You are an expert curriculum designer.
Generate a comprehensive, logically structured course outline for a tutorial on "${courseTitle}".
I want it to be inspired by W3Schools but with a more premium, scenario-based and role-based structure (not a copy).

Please cover all essential topics for "${courseTitle}" in a structured way, suitable for a complete beginner to master the subject.

CRITICAL REQUIREMENT:
Generate topics ONLY for "${courseTitle}". Do NOT include any other subjects. For example, if the course is about HTML, do NOT include Git, GitHub, or any other programming languages or tools unless they are strictly part of learning "${courseTitle}". Focus 100% on "${courseTitle}".

Requirements:
1. Divide the course into 4-6 modules grouped by the learner's journey (e.g., "Getting Started", "Building Real Projects").
2. Use engaging, scenario-based titles for modules and lessons.
3. Each module should have 5-10 lessons.
4. Return the result as a JSON array of modules, where each module has 'title' and 'lessons' (array of objects with 'title' and 'slug' in kebab-case).
5. Do NOT prefix titles with "Module X:" or "Lesson X:".
6. Do not include any other text, markdown formatting (like \`\`\`json), or explanations. Return ONLY the raw JSON array.`;

    const response = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "user", content: prompt }
      ],
    });

    const text = response.choices[0].message.content;
    const usage = response.usage;

    if (!text) {
      return NextResponse.json({ error: "AI returned empty response" }, { status: 500 });
    }

    // Log usage to database
    if (usage) {
      // Log usage to database
      try {
        await supabase.from("ai_usage").insert({
          user_id: user.id,
          feature: "generate-outline",
          model: "llama-3.1-8b-instant",
          prompt_tokens: usage.prompt_tokens,
          completion_tokens: usage.completion_tokens,
          total_tokens: usage.total_tokens,
        });
      } catch (e) {
        console.warn("Failed to log AI usage:", e);
      }
    }
    
    // Extract the JSON array from the response
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    
    if (start === -1 || end === -1) {
      console.error("No JSON array found in AI response:", text);
      return NextResponse.json({ error: "AI did not return a valid JSON array.", details: text }, { status: 500 });
    }

    const cleanedText = text.substring(start, end + 1).trim();

    try {
      const outline = JSON.parse(cleanedText);
      return NextResponse.json({ outline });
    } catch (parseError: any) {
      console.error("Failed to parse JSON from AI:", text);
      return NextResponse.json({ error: `Failed to parse JSON: ${parseError.message}. AI response was: ${text}` }, { status: 500 });
    }
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ 
      error: `AI service error: ${error.message}` 
    }, { status: 500 });
  }
}
