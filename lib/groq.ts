// Lightweight native Groq API caller with multi-model fallback for Next.js serverless functions

const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "llama3-70b-8192",
  "llama3-8b-8192",
]

function getCleanApiKey(overrideKey?: string): string {
  const raw =
    overrideKey ||
    process.env.GROQ_API_KEY ||
    process.env.NEXT_PUBLIC_GROQ_API_KEY ||
    process.env.GROQ_KEY ||
    process.env.GROQ_API ||
    process.env.GROQ_APIKEY ||
    process.env.API_KEY ||
    process.env.API ||
    ""
  return raw.trim().replace(/^["']|["']$/g, "")
}

export async function callGroq(
  userPrompt: string,
  options: {
    systemPrompt?: string
    jsonMode?: boolean
    maxTokens?: number
    temperature?: number
    fallbackData?: any
    apiKey?: string
  } = {}
): Promise<any> {
  const apiKey = getCleanApiKey(options.apiKey)

  if (!apiKey) {
    console.warn("[Groq] No GROQ_API_KEY configured in environment. Using fallback response.")
    if (options.fallbackData !== undefined) {
      return options.fallbackData
    }
    throw new Error("GROQ_API_KEY is not configured in Vercel environment variables.")
  }

  const messages = [
    ...(options.systemPrompt
      ? [{ role: "system", content: options.systemPrompt }]
      : []),
    { role: "user", content: userPrompt },
  ]

  let lastError: any = null

  for (const model of GROQ_MODELS) {
    try {
      const maxTokens = model.includes("8b") && (options.maxTokens || 3000) > 4096
        ? 4096
        : (options.maxTokens ?? 3000)

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: maxTokens,
          response_format: options.jsonMode ? { type: "json_object" } : undefined,
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        console.warn(`[Groq Model ${model} returned ${res.status}]: ${errText}`)
        // If authentication failed (401), stop cycling models
        if (res.status === 401) {
          throw new Error(`Invalid GROQ_API_KEY: ${errText}`)
        }
        lastError = new Error(`Groq ${model} status ${res.status}: ${errText}`)
        continue
      }

      const data = await res.json()
      const content = data.choices?.[0]?.message?.content?.trim() || ""

      if (options.jsonMode) {
        return parseJsonCompletion(content, options.fallbackData)
      }

      return content
    } catch (err: any) {
      if (err.message && err.message.includes("Invalid GROQ_API_KEY")) {
        throw err
      }
      lastError = err
      continue
    }
  }

  console.error("[Groq Call All Models Failed]", lastError)
  if (options.fallbackData !== undefined) {
    return options.fallbackData
  }
  throw lastError || new Error("Failed to get response from Groq models.")
}

export async function chatCompletion(
  messages: { role: string; content: string }[],
  options: { model?: string; temperature?: number; max_tokens?: number; apiKey?: string } = {}
): Promise<string> {
  const apiKey = getCleanApiKey(options.apiKey)

  if (!apiKey) {
    return ""
  }

  const requestedModel = options.model || "llama-3.3-70b-versatile"
  const modelsToTry = [requestedModel, ...GROQ_MODELS.filter(m => m !== requestedModel)]

  for (const model of modelsToTry) {
    try {
      const maxTokens = model.includes("8b") && (options.max_tokens || 3000) > 4096
        ? 4096
        : (options.max_tokens ?? 3000)

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: maxTokens,
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        console.warn(`[Groq chatCompletion ${model} error]`, res.status, err)
        if (res.status === 401) return ""
        continue
      }

      const data = await res.json()
      return data.choices?.[0]?.message?.content?.trim() || ""
    } catch (err) {
      continue
    }
  }

  return ""
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
