import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(req: Request) {
  return handleTest(req)
}

export async function POST(req: Request) {
  return handleTest(req)
}

async function handleTest(req: Request) {
  try {
    const url = new URL(req.url)
    const queryKey = url.searchParams.get("key")
    const headerKey = req.headers.get("x-groq-api-key")

    let bodyKey: string | undefined
    if (req.method === "POST") {
      try {
        const body = await req.json()
        bodyKey = body.key || body.apiKey
      } catch {}
    }

    const rawKey = queryKey || headerKey || bodyKey || process.env.GROQ_API_KEY || ""
    const apiKey = rawKey.trim().replace(/^["']|["']$/g, "")

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        status: "error",
        message: "No Groq API Key provided. Enter your key in the Connection modal or set GROQ_API_KEY in Vercel.",
        groq_configured: false,
      }, { status: 400 })
    }

    // Ping Groq with lightweight query
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: "Respond with the single word 'OK'." }],
        max_tokens: 10,
        temperature: 0.1,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({
        success: false,
        status: "error",
        statusCode: res.status,
        message: `Groq authentication failed (${res.status}): ${errText}`,
        groq_configured: false,
      }, { status: res.status === 401 ? 401 : 502 })
    }

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content?.trim() || "OK"

    return NextResponse.json({
      success: true,
      status: "connected",
      model: "llama-3.1-8b-instant",
      message: `Groq API is connected and responding! (LLaMA 3.1 8B replied: "${reply}")`,
      groq_configured: true,
      groq_key_preview: apiKey.length > 8 ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}` : "Configured",
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      status: "error",
      message: error?.message || "Failed to reach Groq API",
    }, { status: 500 })
  }
}
