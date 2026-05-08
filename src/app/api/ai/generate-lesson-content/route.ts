import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { lessonTitle, moduleTitle, courseTitle } = await req.json();
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
