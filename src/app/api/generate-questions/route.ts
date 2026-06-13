import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const { prompt, count } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY is not set in environment variables." }, { status: 500 });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const numQuestions = parseInt(count) || 5;

    const systemPrompt = `You are an expert educational question generator. Your task is to generate exactly ${numQuestions} exam questions based on the provided text.
You must return a JSON object containing an array called "questions".
There are four types of questions you can generate: "multiple_choice", "fill_in_the_blank", "match_the_following", and "coding". Use a mix of these types where appropriate.

Format the JSON strictly as follows:
{
  "questions": [
    {
      "question_type": "multiple_choice",
      "question_text": "What is the capital of France?",
      "options": ["London", "Paris", "Berlin", "Madrid"],
      "correct_answer": "Paris",
      "points": 1
    },
    {
      "question_type": "fill_in_the_blank",
      "question_text": "...",
      "options": [],
      "correct_answer": "exact word or phrase",
      "points": 1
    },
    {
      "question_type": "match_the_following",
      "question_text": "Match the following items.",
      "options": [
        {"left": "Item 1", "right": "Match 1"},
        {"left": "Item 2", "right": "Match 2"}
      ],
      "correct_answer": "",
      "points": 2
    },
    {
      "question_type": "coding",
      "question_text": "Write a function...",
      "options": [{
        "function_name": "myFunc",
        "starter_code": "function myFunc(arg) {\n  // Write your code here\n}",
        "test_cases": [
          { "input": "\"hello\"", "expected_output": "true", "is_hidden": false },
          { "input": "\"world\"", "expected_output": "false", "is_hidden": true }
        ]
      }],
      "correct_answer": "function myFunc(arg) {\n  return true;\n}",
      "points": 5
    }
  ]
}

CRITICAL RULES:
1. ONLY OUTPUT RAW VALID JSON. NO MARKDOWN. NO BACKTICKS.
2. For coding questions, options MUST be an array containing exactly ONE object with 'function_name', 'starter_code', and an array of 'test_cases'.
3. For coding questions, the starter_code MUST NOT contain the final answer! It should only contain the empty function signature.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate ${numQuestions} questions based on this topic/text:\n\n${prompt}` }
      ],
      model: "llama-3.1-8b-instant", 
      temperature: 0.5,
      response_format: { type: "json_object" }
    });

    let responseText = chatCompletion.choices[0]?.message?.content || "{}";
    
    // Fallback cleanup in case the AI ignored the 'no markdown' instruction
    if (responseText.startsWith("```json")) {
      responseText = responseText.replace(/^```json/, "").replace(/```$/, "");
    } else if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```/, "").replace(/```$/, "");
    }

    const parsed = JSON.parse(responseText.trim());

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
       throw new Error("AI did not return a valid 'questions' array.");
    }

    return NextResponse.json({ questions: parsed.questions });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
