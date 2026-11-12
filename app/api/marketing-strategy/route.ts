import { NextResponse } from "next/server"
import { callGroq } from "@/lib/groq"

export async function POST(req: Request) {
  try {
    const { startup_idea = "AI Startup Co-Founder", industry = "B2B SaaS" } = await req.json()

    const prompt = `Create a go-to-market and marketing strategy for:
Startup Idea: ${startup_idea}
Industry: ${industry}

Return ONLY valid JSON matching this schema:
{
  "target_audience": [
    { "segment": "Solo Founders & Indie Hackers", "description": "Technical builders seeking business guidance", "size": "3.5M founders", "priority": "Primary" }
  ],
  "acquisition_channels": [
    { "channel": "Developer & Founder Communities", "strategy": "Active value-first posts on X, Hacker News, and Reddit", "cost": "Low", "roi": "High" }
  ],
  "marketing_strategy": [
    { "initiative": "Build In Public Campaign", "goal": "Generate early organic word-of-mouth and trust", "timeline": "Weeks 1-4" }
  ],
  "growth_plan": [
    { "stage": "Stage 1: Community Seed", "tactics": ["Direct outreach", "Loom demo walk-throughs", "Free beta tokens"] }
  ]
}`

    const fallbackPlan = {
      target_audience: [
        { segment: "Solo Technical Founders", description: "Engineers and developers building solo who lack business, finance, or pitch deck experience.", size: "4.2M worldwide", priority: "Primary" },
        { segment: "Pre-Seed Startup Incubator Cohorts", description: "Founders admitted to accelerators needing rapid business plan and financial model iteration.", size: "250K founders/year", priority: "High" },
        { segment: "Corporate Innovation Teams", description: "Internal venture builders testing new product vectors under fast timelines.", size: "850K operators", priority: "Secondary" },
        { segment: "Angel Investors & Venture Scouts", description: "Investors using the tool to stress-test incoming pitches and assess market sizing.", size: "120K angels", priority: "Supporting" }
      ],
      acquisition_channels: [
        { channel: "Founder Communities (X/Twitter, IndieHackers, YC)", strategy: "Share authentic breakdown threads analyzing popular startup ideas using our agents.", cost: "Low", roi: "High" },
        { channel: "Product Hunt & Launch Directories", strategy: "Coordinated launch day campaign with interactive demo video and live creator engagement.", cost: "Low", roi: "Very High" },
        { channel: "SEO & Programmatic Startup Guides", strategy: "Generate search-optimized templates for pitch deck outlines, financial formulas, and lean canvases.", cost: "Medium", roi: "High" },
        { channel: "Incubator & University Partnerships", strategy: "Offer free credits to university entrepreneurship clubs and early-stage startup accelerators.", cost: "Low", roi: "High" },
        { channel: "Referral & Viral Sharing Loops", strategy: "Allow users to share a public read-only link to their generated venture blueprint with investor watermarks.", cost: "Zero", roi: "Very High" }
      ],
      marketing_strategy: [
        { initiative: "Venture Blueprint Viral Sharing", goal: "Every generated pitch deck and lean canvas includes a 'Built with AI Co-Founder' attribution badge.", timeline: "Immediate" },
        { initiative: "Weekly Startup Teardown Newsletter", goal: "Publish deep multi-agent analyses of trending AI startups to build authoritative industry credibility.", timeline: "Month 1-3" },
        { initiative: "Interactive Free Tools Funnel", goal: "Provide free standalone calculators for CAC, LTV, and Runway that convert users into full suite accounts.", timeline: "Month 2-4" },
        { initiative: "Influencer & Podcast Sponsorships", goal: "Partner with top tech podcasts and newsletter creators covering startup strategy.", timeline: "Month 4-6" }
      ],
      growth_plan: [
        { stage: "Stage 1: Launch & Validation (0 - 1,000 Users)", tactics: ["Personal outreach to 100 founders on Twitter", "Host live demo workshops", "Iterate on user feedback within 24 hours"] },
        { stage: "Stage 2: Growth Engine (1,000 - 10,000 Users)", tactics: ["Product Hunt Launch #1", "Launch free interactive financial calculator", "Implement referral rewards"] },
        { stage: "Stage 3: Monetization & Retention ($0 - $20K MRR)", tactics: ["Introduce Pro subscription tiers", "Team collaboration workspaces", "Priority Groq LLM inference speed"] },
        { stage: "Stage 4: Scale & Ecosystem ($20K - $100K+ MRR)", tactics: ["API platform access for venture studios", "Direct integrations with AngelList and Crunchbase", "Enterprise team seats"] }
      ]
    }

    const marketing_plan = await callGroq(prompt, {
      systemPrompt: "You are a Silicon Valley Chief Growth Officer and viral marketing architect. Return strictly valid JSON.",
      jsonMode: true,
      maxTokens: 3000,
      fallbackData: fallbackPlan,
    })

    return NextResponse.json({ marketing_plan: marketing_plan || fallbackPlan })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
