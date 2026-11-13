import { NextResponse } from "next/server"
import { callGroq } from "@/lib/groq"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const userApiKey = req.headers.get("x-groq-api-key") || undefined
    const { startup_idea } = await req.json()
    const idea = startup_idea || "AI-powered B2B SaaS platform"

    const prompt = `You are a startup strategy expert.
Create a comprehensive business plan for:
${idea}

Return ONLY valid JSON matching this exact structure:
{
  "lean_canvas": {
    "problem": "Top 3 problems",
    "solution": "Top 3 solutions",
    "keyMetrics": "Key metrics to track",
    "uniqueValueProposition": "Single, clear, compelling message",
    "unfairAdvantage": "Cannot be easily copied",
    "channels": "Path to customers",
    "customerSegments": "Target users & customers",
    "costStructure": "Customer acquisition, hosting, salaries",
    "revenueStreams": "Subscription tiers, usage pricing"
  },
  "swot": {
    "strengths": ["...", "..."],
    "weaknesses": ["...", "..."],
    "opportunities": ["...", "..."],
    "threats": ["...", "..."]
  },
  "executive_summary": {
    "businessOverview": "Concise overview",
    "marketOpportunity": "Market sizing & urgency",
    "competitiveAdvantage": "Primary differentiator",
    "financialProjections": {
      "year1": "$120,000 ARR",
      "year2": "$650,000 ARR",
      "year3": "$2,400,000 ARR"
    },
    "fundingRequirements": "$500,000 Seed round"
  }
}`

    const fallbackPlan = {
      lean_canvas: {
        problem: "Manual repetitive workflows cause high operational latency and costly human error.",
        solution: "Autonomous multi-agent system executing business pipelines with human-in-the-loop validation.",
        keyMetrics: "Monthly Recurring Revenue (MRR), Net Revenue Retention (NRR > 115%), CAC payback period.",
        uniqueValueProposition: "Replace weeks of manual startup strategy and analysis with intelligent AI co-founder execution.",
        unfairAdvantage: "Proprietary fine-tuned task agents and domain evaluation benchmarks.",
        channels: "Product Hunt launch, founder community referral loops, developer content marketing.",
        customerSegments: "Early-stage founders, startup studios, seed-funded technical entrepreneurs.",
        costStructure: "LLM API compute, cloud infrastructure, customer support.",
        revenueStreams: "Tiered SaaS subscription ($49 - $299/mo) with usage add-ons."
      },
      swot: {
        strengths: ["Fast time-to-value", "Comprehensive multi-agent coverage", "Intuitive zero-friction UX"],
        weaknesses: ["Dependent on upstream LLM latency", "Brand recognition in early stages"],
        opportunities: ["Explosion of micro-SaaS and solo-founder businesses", "Enterprise internal startup incubation"],
        threats: ["General purpose chatbots adding similar templates", "API pricing fluctuations"]
      },
      executive_summary: {
        businessOverview: `${idea} automates core strategic and operational milestones for modern entrepreneurs.`,
        marketOpportunity: "A $14B global market for entrepreneurship tools and AI productivity software growing at 32% CAGR.",
        competitiveAdvantage: "Deep domain-specialized autonomous agents rather than generic unstructured chats.",
        financialProjections: {
          year1: "$180,000 ARR (150 customers)",
          year2: "$850,000 ARR (600 customers)",
          year3: "$3,200,000 ARR (2,000 customers)"
        },
        fundingRequirements: "$750,000 Seed for engineering and go-to-market acceleration."
      }
    }

    const plan = await callGroq(prompt, {
      systemPrompt: "You are an elite VC venture partner and startup strategist. Return strictly valid JSON.",
      jsonMode: true,
      maxTokens: 3000,
      apiKey: userApiKey,
      fallbackData: fallbackPlan,
    })

    return NextResponse.json({ plan: plan || fallbackPlan })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
