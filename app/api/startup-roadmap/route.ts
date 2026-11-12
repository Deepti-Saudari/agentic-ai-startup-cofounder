import { NextResponse } from "next/server"
import { callGroq } from "@/lib/groq"

export async function POST(req: Request) {
  try {
    const { startup_idea = "AI Co-Founder Suite", industry = "B2B SaaS" } = await req.json()

    const prompt = `Create a startup roadmap for:
Startup Idea: ${startup_idea}
Industry: ${industry}

Return ONLY valid JSON matching this schema:
{
  "milestones": [
    { "title": "Milestone Title", "description": "Brief description", "category": "product", "priority": "high", "tasks": ["Task 1", "Task 2"] }
  ],
  "timeline": [
    { "phase": "Phase 1: Validation & Architecture", "duration": "Month 1-2", "goals": ["Goal 1", "Goal 2"] }
  ]
}
Rules:
Categories must be one of: product, business, funding, team, legal. Priority: high, medium, low.`

    const fallbackRoadmap = {
      milestones: [
        {
          title: "Architecture & Interactive Prototype",
          description: "Establish Next.js frontend with unified local persistence and multi-agent routing.",
          category: "product",
          priority: "high",
          tasks: ["Design executive dashboard", "Implement auto-saving storage", "Connect Groq LLM pipelines"]
        },
        {
          title: "Legal Formation & Founder IP Assignment",
          description: "Incorporate company entity, assign intellectual property, and adopt standard cap table.",
          category: "legal",
          priority: "high",
          tasks: ["Incorporate Delaware C-Corp", "Execute Founders Restricted Stock Agreements", "Publish standard Terms & Privacy Policy"]
        },
        {
          title: "Private Founder Beta (50 Cohort Users)",
          description: "Run private onboarding cohorts with active founders to measure feature usage and retention.",
          category: "business",
          priority: "medium",
          tasks: ["Distribute beta invite access", "Conduct weekly customer feedback calls", "Optimize prompt completions"]
        },
        {
          title: "Public Launch & Product Hunt Debut",
          description: "Coordinate cross-channel public debut with demo video and founder community blitz.",
          category: "business",
          priority: "high",
          tasks: ["Record 90-second product demo video", "Prepare Product Hunt maker post", "Publish live benchmarks"]
        },
        {
          title: "Seed Round Closing ($750K-$1M)",
          description: "Complete investor roadshow with warm introductions and close target seed funding.",
          category: "funding",
          priority: "high",
          tasks: ["Finalize investor pitch deck", "Build out data room with financial projections", "Issue standard SAFE notes"]
        },
        {
          title: "Key Engineering & Growth Hires",
          description: "Bring on founding engineer and growth lead to accelerate product iteration.",
          category: "team",
          priority: "medium",
          tasks: ["Post job openings in tech networks", "Run technical architecture interviews", "Issue equity grant agreements"]
        }
      ],
      timeline: [
        { phase: "Phase 1: Foundation & Alpha Build", duration: "Months 1-2", goals: ["Deploy core 13 agents", "Validate with 25 test founders", "Achieve sub-3s response latency"] },
        { phase: "Phase 2: Beta Launch & Feedback Iteration", duration: "Months 3-4", goals: ["Reach 500 active users", "Implement workspace JSON export", "Achieve 70%+ weekly retention"] },
        { phase: "Phase 3: Public Debut & Monetization", duration: "Months 5-6", goals: ["Launch on Product Hunt", "Introduce Pro subscription tier", "Reach first $10K MRR"] },
        { phase: "Phase 4: Seed Capital & Team Expansion", duration: "Months 7-9", goals: ["Close $1M Seed financing", "Onboard 2 key team hires", "Scale to 5,000+ active ventures"] }
      ]
    }

    const roadmap = await callGroq(prompt, {
      systemPrompt: "You are a top accelerator director and startup roadmap advisor. Return strictly valid JSON.",
      jsonMode: true,
      maxTokens: 3000,
      fallbackData: fallbackRoadmap,
    })

    return NextResponse.json({ roadmap: roadmap || fallbackRoadmap })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
