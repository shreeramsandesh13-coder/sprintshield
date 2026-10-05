import { NextResponse } from "next/server";

export const runtime = "edge";
export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

  const prompt = `
      You are SprintShield, an expert code reviewer.
      Analyze the following code for:
      1. Security Vulnerabilities
      2. Performance Traps
      
      CRITICAL INSTRUCTION: If the code is already secure and perfectly optimized, you MUST return empty arrays [] for "security" and "performance", and return the original code in "patchedCode". Do not invent theoretical issues just to fill the arrays.
      
      You must respond ONLY with a valid JSON object in this exact format. Do not use markdown blocks.
      {
        "security": ["issue 1", "issue 2"],
        "performance": ["issue 1"],
        "patchedCode": "complete fixed code here"
      }

      CODE:
      ${code}
    `;
    // Using your newly discovered authorized model: gemini-3.5-flash
    const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      console.error("RAW GOOGLE ERROR:", data);
      return NextResponse.json({ error: data.error?.message || "Google rejected request" }, { status: 500 });
    }

    const responseText = data.candidates[0].content.parts[0].text;
    const cleanedJson = responseText.replace(/```json\n?|```/g, "").trim();
    
    return NextResponse.json(JSON.parse(cleanedJson));
    
  } catch (error: any) {
    console.error("SERVER CRASH:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}