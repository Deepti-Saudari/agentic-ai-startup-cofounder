import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "agentic-ai-startup-cofounder",
    groq_configured: Boolean(process.env.GROQ_API_KEY),
    mode: "serverless-nextjs",
  })
}
