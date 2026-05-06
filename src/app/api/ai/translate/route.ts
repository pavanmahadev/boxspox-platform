import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { content } = await req.json();
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ 
        translated: "Hinglish translation is currently unavailable." 
      }, { status: 503 });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Translate the following educational programming content into "Hinglish" (a conversational mix of Hindi and English written in Latin script). 
Keep all markdown formatting, code blocks, and technical terms in English. Only translate the conversational explanations to make it friendly and easy to understand for an Indian student.

Content to translate:
${content}
`;

    const result = await model.generateContent(prompt);
    const translated = result.response.text();

    return NextResponse.json({ translated });
  } catch (error: any) {
    console.error("Translation Error:", error);
    return NextResponse.json({ error: "Failed to translate content", details: error.message }, { status: 500 });
  }
}
