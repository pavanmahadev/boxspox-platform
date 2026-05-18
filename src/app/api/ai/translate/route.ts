import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized — please log in." }, { status: 401 });
    }

    const { content } = await req.json();
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return NextResponse.json({ 
        translated: "Hinglish translation is currently unavailable." 
      }, { status: 503 });
    }

    const openai = new OpenAI({
      apiKey: GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const prompt = `Translate the following educational programming content into "Hinglish" (a conversational mix of Hindi and English written in Latin script). 
Keep all markdown formatting, code blocks, and technical terms in English. Only translate the conversational explanations to make it friendly and easy to understand for an Indian student.

Content to translate:
${content}
`;

    const response = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "user", content: prompt }
      ],
    });

    const translated = response.choices[0].message.content;

    return NextResponse.json({ translated });
  } catch (error: any) {
    console.error("Translation Error:", error);
    return NextResponse.json({ error: "Failed to translate content", details: error.message }, { status: 500 });
  }
}
