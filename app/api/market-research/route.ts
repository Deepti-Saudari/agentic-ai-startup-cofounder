import { NextResponse } from "next/server"
import { callGroq } from "@/lib/groq"

export async function POST(req: Request) {
  try {
    const userApiKey = req.headers.get("x-groq-api-key") || undefined
    const { industry = "Tech / SaaS", target_market = "Global SMBs" } = await req.json()

    const prompt = `You are a startup market research expert.
Perform a realistic, rigorous market analysis.
Industry: ${industry}
Target Market: ${target_market}

Return ONLY valid JSON matching this schema:
{
  "competitors": [
    {
      "name": "Competitor Name",
      "website": "example.com",
      "description": "Brief description",
      "marketShare": 25,
      "funding": "$10M Series A",
      "strengths": ["...", "..."],
      "weaknesses": ["...", "..."],
      "pricing": "$49/mo",
      "threatLevel": "High"
    }
  ],
  "personas": [
    {
      "name": "Alex - Technical Founder",
      "age": "28-40",
      "occupation": "CTO / Founder",
      "income": "$90K-$150K",
      "painPoints": ["Lack of business strategy time", "High agency costs"],
      "goals": ["Ship fast", "Secure seed investment"],
      "channels": ["Twitter/X", "Hacker News", "Product Hunt"],
      "buyingBehavior": "Values speed and autonomy"
    }
  ],
  "trends": [
    {
      "trend": "Autonomous AI Agent Workflows",
      "impact": "Positive",
      "description": "Businesses shifting from conversational bots to multi-agent goal execution.",
      "timeframe": "2026-2028",
      "confidence": 88
    }
  ]
}`

    const fallbackAnalysis = {
      competitors: [
        {
          name: "VentureCraft AI",
          website: "venturecraft.ai",
          description: "General AI business plan generator for early founders.",
          marketShare: 22,
          funding: "$8M Series A",
          strengths: ["Clean templates", "Simple onboarding"],
          weaknesses: ["No financial modeling", "Static unstructured output"],
          pricing: "$29/mo",
          threatLevel: "Medium"
        },
        {
          name: "StratScale Studio",
          website: "stratscale.io",
          description: "Enterprise strategy software for internal innovation labs.",
          marketShare: 35,
          funding: "$24M Series B",
          strengths: ["Enterprise security", "Team collaboration"],
          weaknesses: ["High enterprise price tag", "Complex 3-month setup"],
          pricing: "$800/mo+",
          threatLevel: "High"
        },
        {
          name: "SoloFounder Toolkit",
          website: "solofounder.co",
          description: "Lightweight spreadsheet prompts and checklists.",
          marketShare: 14,
          funding: "Bootstrapped",
          strengths: ["Low cost", "Active indie community"],
          weaknesses: ["Manual data entry", "No real-time intelligence"],
          pricing: "$49 one-time",
          threatLevel: "Low"
        }
      ],
      personas: [
        {
          name: "Jordan - Solo Technical Founder",
          age: "26-38",
          occupation: "Software Engineer / Indie Hacker",
          income: "$85K - $130K",
          painPoints: ["Strong at code but lacks finance and GTM strategy", "Overwhelmed writing pitch decks and legal agreements"],
          goals: ["Validate ideas before spending 6 months coding", "Raise seed capital or bootstrap to $10K MRR"],
          channels: ["X/Twitter", "GitHub", "Y Combinator forum", "Tech podcasts"],
          buyingBehavior: "Self-serve, tries free tier first, converts on immediate utility"
        },
        {
          name: "Priya - Venture Studio Director",
          age: "34-48",
          occupation: "Managing Director / Incubator Lead",
          income: "$140K - $220K",
          painPoints: ["Managing cohorts of 20+ startups simultaneously", "Inconsistent quality in pitch decks and market sizing"],
          goals: ["Accelerate time-to-market for portfolio companies", "Standardize due diligence materials"],
          channels: ["LinkedIn", "AngelList", "Venture conferences"],
          buyingBehavior: "High Willingness to Pay, team seats, requires data export"
        }
      ],
      trends: [
        {
          trend: "Agentic Multi-Agent Collaboration",
          impact: "Positive",
          description: "Shift from general prompts to specialized agents handling legal, finance, and marketing autonomously.",
          timeframe: "Next 12-24 months",
          confidence: 92
        },
        {
          trend: "Micro-SaaS Proliferation",
          impact: "Positive",
          description: "Lower development barriers leading to a 300% surge in solo-operated software startups requiring virtual co-founders.",
          timeframe: "Ongoing",
          confidence: 85
        },
        {
          trend: "Tightened Seed Due Diligence",
          impact: "Neutral",
          description: "Investors demand defensible unit economics and clear traction metrics earlier in the venture lifecycle.",
          timeframe: "Next 18 months",
          confidence: 78
        }
      ]
    }

    const analysis = await callGroq(prompt, {
      systemPrompt: "You are a senior market analyst and VC research partner. Return strictly valid JSON.",
      jsonMode: true,
      maxTokens: 3000,
      apiKey: userApiKey,
      fallbackData: fallbackAnalysis,
    })

    return NextResponse.json({ analysis: analysis || fallbackAnalysis })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
