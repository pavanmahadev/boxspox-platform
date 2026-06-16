import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(request: Request) {
  try {
    const { topic, messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const systemPrompt = `You are a helpful AI coding tutor for an educational platform called Pandaschool.
Your goal is to help the student understand the current topic: "${topic}".
Keep your answers clear, educational, and relatively brief. Don't just give the answer if it's a coding problem; explain the concepts so the student can learn.
Use markdown for formatting code blocks or emphasis.`;

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content
      }))
    ];

    const completion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: "llama-3.3-70b-versatile", // Versatile and fast
      temperature: 0.7,
      max_tokens: 800,
    });

    const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI Tutor Error:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
