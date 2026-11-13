import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const userKey = req.headers.get("x-groq-api-key")
  const rawKey = userKey || process.env.GROQ_API_KEY || ""
  const hasKey = Boolean(rawKey.trim())

  return NextResponse.json({
    status: "healthy",
    service: "agentic-ai-startup-cofounder",
    groq_configured: hasKey,
    groq_source: userKey ? "client-header" : process.env.GROQ_API_KEY ? "server-env" : "none",
    mode: "serverless-nextjs",
  })
}
