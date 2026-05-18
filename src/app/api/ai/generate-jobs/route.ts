import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Authorize: only admins can generate jobs
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized. Admin only." }, { status: 403 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. Prompt Gemini to return a structured JSON array of tech jobs
    const prompt = `
      You are an expert AI recruiter for a tech education platform.
      Find or generate 5 highly realistic, up-to-date entry-level or mid-level tech jobs (e.g. Frontend Engineer, Backend Developer, UI/UX Designer, Data Scientist).
      For each job, provide a realistic or canonical 'apply' link (like a direct company careers page, or platforms like simplify.jobs / linkedin).
      
      Respond strictly with a raw JSON array of objects, with NO markdown formatting, NO \`\`\`json wrappers. 
      Format each object exactly like this:
      {
        "title": "String",
        "company": "String",
        "team": "String (e.g., Engineering, Design, Product)",
        "location": "String (e.g., Remote, San Francisco, CA)",
        "type": "String (e.g., Full-time, Internship)",
        "link": "String (URL)"
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting
    let cleanText = responseText.trim();
    if (cleanText.startsWith('```json')) cleanText = cleanText.slice(7);
    if (cleanText.startsWith('```')) cleanText = cleanText.slice(3);
    if (cleanText.endsWith('```')) cleanText = cleanText.slice(0, -3);
    
    const jobsData = JSON.parse(cleanText.trim());

    if (!Array.isArray(jobsData) || jobsData.length === 0) {
      throw new Error("AI returned invalid job format.");
    }

    // 3. Insert jobs into Supabase
    const { data, error } = await supabase.from('jobs').insert(jobsData).select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, count: jobsData.length, jobs: data });
    
  } catch (err: any) {
    console.error("AI Jobs Generation Error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate jobs" }, { status: 500 });
  }
}
