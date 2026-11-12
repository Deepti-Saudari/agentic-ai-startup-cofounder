import { NextResponse } from "next/server"
import { callGroq } from "@/lib/groq"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { skills = "Tech, Product", interests = "SaaS, AI", experience = "Developer", idea = "", mode = "generate" } = body

    const prompt = mode === "generate"
      ? `Generate 3-5 high-potential startup opportunities for a founder with:
Skills: ${skills}
Interests: ${interests}
Experience: ${experience}

Return ONLY valid JSON matching this schema:
{
  "analysis": {
    "summary": "Strategic founder-market fit analysis",
    "recommended_focus": "Specific market vector",
    "timing_rationale": "Why now is the right time"
  },
  "ideas": [
    {
      "title": "Startup Name & Tagline",
      "one_liner": "Single compelling sentence",
      "problem": "Clear validated pain point",
      "solution": "Unique agentic or software solution",
      "target_customer": "Primary buyer",
      "business_model": "Subscription / usage",
      "marketOpportunity": {
        "size": "$4.5B",
        "growth": "28% YoY",
        "trend": "Key macro driver",
        "drivers": ["Driver 1", "Driver 2"]
      }
    }
  ]
}`
      : `Enhance and stress-test this startup idea:
Idea: ${idea}

Return ONLY valid JSON matching the same schema.`

    const fallbackData = {
      analysis: {
        summary: `Strong founder-market synergy combining ${skills} with emerging opportunities in ${interests}.`,
        recommended_focus: "Vertical B2B productivity software with embedded agentic workflows.",
        timing_rationale: "Rapid enterprise adoption of autonomous AI tools creates an urgent 18-month window to capture workflow dominance."
      },
      ideas: [
        {
          title: "Agentic Ops - Autonomous Back-Office Operations",
          one_liner: "AI co-workers that execute reconciliation, invoicing, and vendor follow-ups without manual supervision.",
          problem: "Growing startups spend 30+ hours weekly on fragmented operational glue-work across Stripe, QuickBooks, and email.",
          solution: "A coordinated multi-agent system with human verification checkpoints that completes back-office tasks autonomously.",
          target_customer: "Fast-growing tech companies with 10-100 employees.",
          business_model: "$149/month base + $0.50 per automated operation completed.",
          marketOpportunity: {
            size: "$8.2 Billion",
            growth: "34% CAGR",
            trend: "Shift from passive dashboards to active workflow executors.",
            drivers: ["API standardization across cloud services", "High cost of hiring administrative staff"]
          }
        },
        {
          title: "DocuSense - Instant Contract Intelligence for Founders",
          one_liner: "Turn 40-page venture debt, SAFE, and vendor agreements into plain-English risk assessments in 30 seconds.",
          problem: "Early-stage founders sign risky legal clauses or spend thousands on routine lawyer reviews.",
          solution: "Domain-specialized legal agent scanning for non-standard indemnities, IP assignment risks, and liquidation preferences.",
          target_customer: "Pre-seed and seed stage entrepreneurs and angel investors.",
          business_model: "$79/month unlimited contract analysis.",
          marketOpportunity: {
            size: "$3.4 Billion",
            growth: "26% CAGR",
            trend: "Democratization of legal tech through fine-tuned LLMs.",
            drivers: ["Surge in remote global startup founding", "Rising legal counsel hourly rates"]
          }
        },
        {
          title: "SprintPilot - Spec-to-Code Roadmap Architect",
          one_liner: "Translates customer feature requests directly into scoped engineering specs, test cases, and sprint boards.",
          problem: "Product managers and engineers lose 40% of their sprint velocity writing boilerplate ticket specifications.",
          solution: "An intelligent product manager agent that analyzes customer feedback and generates complete PRDs and task trees.",
          target_customer: "Agile software teams and technical product managers.",
          business_model: "$29 per engineer/month.",
          marketOpportunity: {
            size: "$11 Billion",
            growth: "22% CAGR",
            trend: "Convergence of AI coding assistants with project management suites.",
            drivers: ["Rapid rise of autonomous software development", "Demand for tighter product-market iteration cycles"]
          }
        }
      ]
    }

    const result = await callGroq(prompt, {
      systemPrompt: "You are a world-class venture capitalist and startup incubator director. Return strictly valid JSON.",
      jsonMode: true,
      maxTokens: 3500,
      fallbackData,
    })

    return NextResponse.json(result || fallbackData)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
