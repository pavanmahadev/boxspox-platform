import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const { resumeText } = await request.json();

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
      return NextResponse.json({ error: "Please provide a valid resume (at least 50 characters)." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in to review your resume." }, { status: 401 });
    }

    // 1. Fetch available jobs from Supabase to match against
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, title, company, type, location')
      .order('created_at', { ascending: false })
      .limit(30);

    if (jobsError) {
      console.error("Error fetching jobs for matching:", jobsError);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. Prompt Gemini
    const prompt = `
      You are an expert, strict but encouraging Senior Technical Recruiter at a top tech company.
      I am providing you with a user's resume and a list of open job positions on our platform.

      USER RESUME:
      """
      ${resumeText}
      """

      AVAILABLE JOBS:
      ${JSON.stringify(jobs || [], null, 2)}

      TASK:
      1. Give the resume a score out of 100 based on clarity, impact, technical depth, and formatting.
      2. Identify exactly 3 strong points (strengths) of this resume.
      3. Identify exactly 3 critical areas of improvement or missing skills (weaknesses).
      4. Review the "AVAILABLE JOBS" list and select the 3 jobs that best match this candidate's resume. Return their exact 'id's. If there are no good matches, just return the 3 most relevant tech jobs anyway.

      Respond STRICTLY with a raw JSON object. Do NOT include markdown formatting like \`\`\`json or \`\`\`. 
      Format exactly like this:
      {
        "score": number,
        "strengths": ["string", "string", "string"],
        "weaknesses": ["string", "string", "string"],
        "matchedJobIds": ["uuid-string-1", "uuid-string-2", "uuid-string-3"]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting
    let cleanText = responseText.trim();
    if (cleanText.startsWith('```json')) cleanText = cleanText.slice(7);
    if (cleanText.startsWith('```')) cleanText = cleanText.slice(3);
    if (cleanText.endsWith('```')) cleanText = cleanText.slice(0, -3);
    
    const analysis = JSON.parse(cleanText.trim());

    // 3. Fetch full details of the matched jobs
    let matchedJobsFull = [];
    if (analysis.matchedJobIds && analysis.matchedJobIds.length > 0) {
      const { data: matchedData } = await supabase
        .from('jobs')
        .select('*')
        .in('id', analysis.matchedJobIds);
      
      matchedJobsFull = matchedData || [];
    }

    return NextResponse.json({ 
      success: true, 
      analysis: {
        score: analysis.score,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        matchedJobs: matchedJobsFull
      }
    });
    
  } catch (err: any) {
    console.error("AI Resume Review Error:", err);
    return NextResponse.json({ error: err.message || "Failed to analyze resume" }, { status: 500 });
  }
}
