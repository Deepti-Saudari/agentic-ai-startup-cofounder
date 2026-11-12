// Lightweight native Groq API caller for Next.js serverless functions

export async function callGroq(
  userPrompt: string,
  options: {
    systemPrompt?: string
    jsonMode?: boolean
    maxTokens?: number
    temperature?: number
    fallbackData?: any
  } = {}
): Promise<any> {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    console.warn("[Groq] No GROQ_API_KEY configured in environment. Using fallback response.")
    if (options.fallbackData !== undefined) {
      return options.fallbackData
    }
    throw new Error("GROQ_API_KEY is not configured in Vercel environment variables.")
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          ...(options.systemPrompt
            ? [{ role: "system", content: options.systemPrompt }]
            : []),
          { role: "user", content: userPrompt },
        ],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 3000,
        response_format: options.jsonMode ? { type: "json_object" } : undefined,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error("[Groq API Error]", res.status, errText)
      if (options.fallbackData !== undefined) return options.fallbackData
      throw new Error(`Groq API returned ${res.status}: ${errText}`)
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content?.trim() || ""

    if (options.jsonMode) {
      return parseJsonCompletion(content, options.fallbackData)
    }

    return content
  } catch (err: any) {
    console.error("[Groq Call Error]", err)
    if (options.fallbackData !== undefined) {
      return options.fallbackData
    }
    throw err
  }
}

export async function chatCompletion(
  messages: { role: string; content: string }[],
  options: { model?: string; temperature?: number; max_tokens?: number } = {}
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    return ""
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: options.model || "llama-3.3-70b-versatile",
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 3000,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("[Groq chatCompletion error]", res.status, err)
      return ""
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() || ""
  } catch (err) {
    console.error("[Groq chatCompletion exception]", err)
    return ""
  }
}

export function parseJsonCompletion<T>(text: string, fallback: T): T {
  if (!text) return fallback

  let cleaned = text.trim()
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7)
  if (cleaned.startsWith("```")) cleaned = cleaned.slice(3)
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3)
  cleaned = cleaned.trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch {}
    }
    return fallback
  }
}
