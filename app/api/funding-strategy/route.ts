import { NextResponse } from "next/server"
import { callGroq } from "@/lib/groq"

export async function POST(req: Request) {
  try {
    const { startup_idea = "AI SaaS", industry = "Technology" } = await req.json()

    const prompt = `Generate a funding strategy for:
Startup Idea: ${startup_idea}
Industry: ${industry}

Return ONLY valid JSON matching this schema:
{
  "funding_stages": [
    { "stage": "Pre-Seed", "amount": "$250,000", "valuation": "$2.5M", "milestone": "Working prototype & 10 pilot users" },
    { "stage": "Seed", "amount": "$1,000,000", "valuation": "$8.0M", "milestone": "$25K MRR and strong retention" },
    { "stage": "Series A", "amount": "$5,000,000", "valuation": "$25M", "milestone": "$100K+ MRR and proven GTM" },
    { "stage": "Series B", "amount": "$15,000,000", "valuation": "$75M", "milestone": "Market category leadership" }
  ],
  "investor_types": ["Angel Investors", "Micro VCs", "Venture Studios", "Strategic Angels"],
  "fundraising_strategy": [
    "Target founder-friendly angel operators in your vertical",
    "Build momentum with SAFE notes on a rolling close",
    "Leverage demo video metrics and community waitlist",
    "Create investor updates with transparent weekly progress"
  ],
  "use_of_funds": [
    { "category": "Product & Engineering", "percentage": "55%", "description": "Core platform development and AI compute" },
    { "category": "Go-To-Market & Growth", "percentage": "25%", "description": "Developer relations, content marketing, launch" },
    { "category": "Operations & Legal", "percentage": "10%", "description": "Incorporation, IP protection, accounting" },
    { "category": "Working Capital Runway", "percentage": "10%", "description": "18 months cash buffer" }
  ]
}`

    const fallbackPlan = {
      funding_stages: [
        { stage: "Pre-Seed", amount: "$250,000", valuation: "$2,500,000 post-money", milestone: "Functional MVP with 20 active trial users." },
        { stage: "Seed", amount: "$1,250,000", valuation: "$8,500,000 post-money", milestone: "$25,000 MRR, 15% MoM growth, positive CAC payback." },
        { stage: "Series A", amount: "$6,000,000", valuation: "$28,000,000 post-money", milestone: "$120,000+ MRR, repeatable enterprise sales motion." },
        { stage: "Series B", amount: "$18,000,000", valuation: "$85,000,000 post-money", milestone: "International market expansion and category leadership." }
      ],
      investor_types: [
        "Technical Angels & SaaS Operators",
        "AI-Specialized Micro-VC Funds ($20M-$50M AUM)",
        "Pre-Seed Accelerators (Y Combinator, Techstars)",
        "Strategic Corporate Venture Arms"
      ],
      fundraising_strategy: [
        "Warm introductions via founders in target investors' current portfolio",
        "Lead with demonstrable product velocity and organic user traction",
        "Use YC standard post-money SAFE agreements to streamline legal execution",
        "Create competitive urgency by running a disciplined 3-week fundraising process"
      ],
      use_of_funds: [
        { category: "Engineering & AI Infrastructure", percentage: "50%", description: "Full-stack developers, AI agent fine-tuning, and model compute." },
        { category: "Growth & Product Marketing", percentage: "30%", description: "Paid acquisition, creator sponsorships, content marketing funnels." },
        { category: "Operations, Compliance & Legal", percentage: "10%", description: "Delaware C-corp compliance, trademarking, customer contracts." },
        { category: "Reserve & Safety Runway", percentage: "10%", description: "Cash reserve ensuring 18+ months of uninterrupted runway." }
      ]
    }

    const funding_plan = await callGroq(prompt, {
      systemPrompt: "You are an experienced venture capitalist and startup fundraising advisor. Return strictly valid JSON.",
      jsonMode: true,
      maxTokens: 2500,
      fallbackData: fallbackPlan,
    })

    return NextResponse.json({ funding_plan: funding_plan || fallbackPlan })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
