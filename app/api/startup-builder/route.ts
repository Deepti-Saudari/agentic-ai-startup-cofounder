import { NextResponse } from "next/server";
import { chatCompletion, parseJsonCompletion } from "@/lib/groq";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const skills = body.skills || "AI engineering, fullstack web development, product architecture";
    const interests = body.interests || "B2B SaaS, developer tooling, autonomous agents";
    const experience = body.experience || "Technical founder with 5 years engineering experience";

    const prompt = `You are a legendary venture builder orchestrating a full startup launch plan.
Founder Profile:
- Skills: ${skills}
- Interests: ${interests}
- Experience: ${experience}

Return ONLY a JSON object with this exact shape:
{
  "selected_idea": "Autonomous AI Agent Workflow Engine for B2B Ops",
  "all_ideas": [
    { "title": "Autonomous AI Agent Workflow Engine for B2B Ops", "category": "Enterprise SaaS", "score": 94 },
    { "title": "Real-time Compliance Auditor for Healthcare Startups", "category": "HealthTech", "score": 89 }
  ],
  "market_research": {
    "tam": "$42B",
    "cagr": "28.4%",
    "summary": "Rapidly growing demand for agentic orchestration across Fortune 500 workflows.",
    "competitors": ["Zapier Central", "Make.com", "CrewAI"]
  },
  "business_plan": {
    "monetization": "Tiered SaaS subscription with usage-based compute billing",
    "target_acv": "$12,000 / year",
    "go_to_market": "Product-led developer adoption transitioning to enterprise sales"
  },
  "product_plan": {
    "mvp_features": ["Visual flow builder", "Multi-model routing", "Audit logging"],
    "tech_stack": "Next.js, FastAPI, PostgreSQL, Groq Llama-3"
  },
  "financial_model": {
    "year_1_arr": "$240,000",
    "year_3_arr": "$2,500,000",
    "break_even_month": 14
  }
}

Return ONLY valid JSON.`;

    const raw = await chatCompletion([
      { role: "system", content: "You are a startup venture architect returning strictly pure JSON." },
      { role: "user", content: prompt },
    ]);

    const parsed = parseJsonCompletion<any>(raw, {
      selected_idea: `Autonomous Ops Engine for ${interests.split(",")[0] || "B2B SaaS"}`,
      all_ideas: [
        { title: `Autonomous Ops Engine for ${interests.split(",")[0] || "B2B SaaS"}`, category: "Enterprise SaaS", score: 95 },
        { title: `Real-time AI Copilot for Technical Teams`, category: "DevTools", score: 91 },
        { title: `Intelligent Workflow Assistant for Founders`, category: "Productivity", score: 88 }
      ],
      market_research: {
        tam: "$35B",
        cagr: "31.2%",
        summary: "Accelerating enterprise adoption of agentic software and workflow automation.",
        competitors: ["Legacy ERPs", "Zapier", "UiPath"]
      },
      business_plan: {
        monetization: "Freemium developer tier with $199/mo Pro and custom Enterprise contracts",
        target_acv: "$15,000 / year",
        go_to_market: "Developer-first open source core with cloud hosted enterprise orchestration"
      },
      product_plan: {
        mvp_features: ["Drag-and-drop agent canvas", "Groq-powered instant reasoning", "Webhook triggers"],
        tech_stack: "Next.js 14, Tailwind CSS, Vercel Serverless, Groq"
      },
      financial_model: {
        year_1_arr: "$300,000",
        year_3_arr: "$3,200,000",
        break_even_month: 12
      }
    });

    return NextResponse.json({ startup: parsed });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to orchestrate startup builder" },
      { status: 500 }
    );
  }
}
