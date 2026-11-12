import { NextResponse } from "next/server"
import { callGroq } from "@/lib/groq"

export async function POST(req: Request) {
  try {
    const { startup_idea = "AI SaaS", industry = "Technology" } = await req.json()

    const prompt = `Create a team and hiring plan for:
Startup Idea: ${startup_idea}
Industry: ${industry}

Return ONLY valid JSON matching this schema:
{
  "key_roles": [
    { "title": "Full-Stack AI Engineer", "level": "Founding Engineer", "compensation": "$110K-$140K + 1.5% equity", "description": "Core product architecture and LLM pipelines." }
  ],
  "hiring_plan": [
    { "phase": "Phase 1: Seed Team (Months 1-3)", "hires": ["Founding Engineer", "Growth Marketer"] }
  ],
  "skills_required": ["TypeScript & Next.js", "Python & FastAPI", "LLM Fine-tuning & Prompt Engineering", "Product-Led Growth"],
  "team_structure": ["Founder / CEO (Vision, Fundraising, Sales)", "Founding CTO (Engineering & Infrastructure)"]
}`

    const fallbackPlan = {
      key_roles: [
        { title: "Founding AI / Full-Stack Engineer", level: "Senior / Lead", compensation: "$120K-$150K + 1.0-2.5% Equity", description: "Leads frontend Next.js architecture, edge runtime optimization, and agent workflow orchestration." },
        { title: "Head of Growth & Developer Relations", level: "Growth Lead", compensation: "$95K-$125K + 0.5-1.5% Equity", description: "Drives product-led acquisition, founder community engagement, and viral content distribution." },
        { title: "Product Designer & UX Lead", level: "Senior IC", compensation: "$100K-$130K + 0.5-1.0% Equity", description: "Crafts intuitive generative UI, accessible interaction patterns, and conversion funnels." },
        { title: "Customer Success & Operations Lead", level: "Early Hire", compensation: "$75K-$95K + 0.25-0.75% Equity", description: "Manages founder onboarding, user support tickets, and feature feedback prioritization." }
      ],
      hiring_plan: [
        { phase: "Phase 1: Zero-to-One Core Team (Month 1-3)", hires: ["Founding Full-Stack Engineer", "Contract UI/UX Designer"] },
        { phase: "Phase 2: Product Velocity (Month 4-6)", hires: ["AI Pipeline Engineer", "Growth Marketing Lead"] },
        { phase: "Phase 3: Scale & Community (Month 7-12)", hires: ["Full-Time Customer Success", "DevRel Advocate"] },
        { phase: "Phase 4: Post-Series A Expansion", hires: ["Head of Enterprise Sales", "DevOps & Security Specialist"] }
      ],
      skills_required: [
        "Modern React, Next.js App Router, and TypeScript",
        "LLM API integration (Groq, OpenAI, Anthropic) and prompt tuning",
        "Product-Led Growth (PLG) analytics and conversion optimization",
        "Autonomous problem-solving in high-velocity startup environments"
      ],
      team_structure: [
        "Executive Leadership: Founder / CEO leading vision, fundraising, and strategic partnerships",
        "Engineering & Architecture: Technical Co-Founder / Lead directing core agent pipelines",
        "Growth & Community: Marketing lead executing organic loops and developer evangelism"
      ]
    }

    const team_plan = await callGroq(prompt, {
      systemPrompt: "You are a startup talent strategist and executive recruiter for venture-backed companies. Return strictly valid JSON.",
      jsonMode: true,
      maxTokens: 2500,
      fallbackData: fallbackPlan,
    })

    return NextResponse.json({ team_plan: team_plan || fallbackPlan })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
