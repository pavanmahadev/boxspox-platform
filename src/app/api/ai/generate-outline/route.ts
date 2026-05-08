import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseTitle } = await req.json();
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: "AI Service is currently unavailable." 
      }, { status: 503 });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert curriculum designer.
Generate a comprehensive, logically structured course outline for a tutorial on "${courseTitle}".
I want it to be inspired by W3Schools but with a more premium, scenario-based and role-based structure (not a copy).

Cover these topics in a structured way:
- Git Basics (Home, Intro, Install, Config, Get Started, New Files, Staging, Commit, Tagging, Stash, History, Help)
- Branching & Merging (Workflow, Best Practices)
- Git and GitHub (Get Started, SSH, Set Remote, Edit Code, Pull, Push, Flow, Pages, GUI)
- Contributing (Fork, Clone, Pull Request)
- Undoing Changes (Revert, Reset, Amend, Rebase, Reflog, Recovery)
- Advanced Git (.gitignore, Attributes, LFS, Signing, Cherrypick, Conflicts, CI/CD, Hooks, Submodules)
- Certificate & Exercises (Quiz, Syllabus, Study Plan)

Requirements:
1. Divide the course into 4-6 modules grouped by the learner's journey (e.g., Solo Developer, Team Player, Git Master).
2. Use engaging, scenario-based titles for modules and lessons (e.g., "Oops! Fixing Mistakes" instead of "Git Undo").
3. Each module should have 5-10 lessons.
4. Return the result as a JSON array of modules, where each module has 'title' and 'lessons' (array of objects with 'title' and 'slug' in kebab-case).
5. Do NOT prefix titles with "Module X:" or "Lesson X:".
6. Do not include any other text, markdown formatting (like \`\`\`json), or explanations. Return ONLY the raw JSON array.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Clean up the response in case Gemini includes markdown code blocks
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

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
