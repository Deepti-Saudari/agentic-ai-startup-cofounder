import { NextResponse } from "next/server"
import { callGroq } from "@/lib/groq"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const message = body.message || "Hello"

    const isGenerationRequest = [
      "generate", "create", "make me", "build", "write", "roadmap", "plan",
      "idea for", "suggest", "give me", "need a"
    ].some((phrase) => message.toLowerCase().includes(phrase))

    const prompt = isGenerationRequest
      ? `The founder asked for startup assistance:\n${message}\n\nProvide direct, practical, and structured guidance without asking conversational follow-ups.`
      : `The founder is chatting casually:\n${message}\n\nRespond as a sharp, experienced, empathetic tech startup cofounder.`

    const reply = await callGroq(prompt, {
      systemPrompt: "You are an elite, practical AI startup co-founder assisting with product strategy, traction, and scaling.",
      temperature: 0.7,
      maxTokens: 1000,
      fallbackData: `As your AI Co-Founder, I recommend focusing on customer validation and narrow problem scoping first. For "${message}", identify 10 target users, conduct 20-minute discovery calls to test pain severity, and launch an MVP within 2 weeks.`,
    })

    return NextResponse.json({ reply })
  } catch (error: any) {
    return NextResponse.json({
      reply: "I am ready to assist your startup. Please ensure GROQ_API_KEY is configured in your Vercel project settings.",
    })
  }
}
