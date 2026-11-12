import { NextResponse } from "next/server"
import { callGroq } from "@/lib/groq"

export async function POST(req: Request) {
  try {
    const { startup_idea = "AI Workflow App", industry = "SaaS" } = await req.json()

    const prompt = `Create a product development plan for:
Startup Idea: ${startup_idea}
Industry: ${industry}

Return ONLY valid JSON matching this schema:
{
  "mvp_features": [
    { "name": "Feature Name", "description": "Brief description", "priority": "Critical", "complexity": "Medium" }
  ],
  "tech_stack": [
    { "category": "Frontend", "technology": "Next.js 14", "reason": "Fast SSR and serverless deployment" }
  ],
  "development_phases": [
    { "phase": "Phase 1: Discovery & Wireframing", "duration": "Weeks 1-2", "deliverables": ["Figma mockups", "Architecture doc"] }
  ],
  "milestones": [
    { "title": "Closed Alpha Launch", "date": "Month 1", "success_criteria": "10 active pilot teams" }
  ]
}`

    const fallbackPlan = {
      mvp_features: [
        { name: "Autonomous Agent Orchestrator", description: "Multi-agent task dispatcher managing prompt pipelines with validation gates.", priority: "Critical", complexity: "High" },
        { name: "Interactive Workspace Dashboard", description: "Unified command center displaying venture strategy, lean canvas, and milestones.", priority: "Critical", complexity: "Medium" },
        { name: "One-Click PDF Export Engine", description: "Export investor-grade pitch summaries, financial forecasts, and business plans.", priority: "High", complexity: "Low" },
        { name: "Browser Persistence Layer", description: "Automatic local storage sync and JSON backup/restore for complete data privacy.", priority: "High", complexity: "Medium" },
        { name: "Live AI Co-Founder Chat", description: "Context-aware conversational assistant trained on venture building frameworks.", priority: "Medium", complexity: "Medium" }
      ],
      tech_stack: [
        { category: "Frontend Framework", technology: "Next.js 14 (App Router)", reason: "Optimal server-rendered performance and seamless Vercel edge deployment." },
        { category: "UI & Design System", technology: "Tailwind CSS & Radix UI", reason: "Accessible, responsive components with instant dark/light theme switching." },
        { category: "AI Inference Engine", technology: "Groq LLaMA 3.3 70B", reason: "Ultra-fast low-latency token generation for real-time agent execution." },
        { category: "Data Storage", technology: "Browser LocalStorage & JSON Workspace", reason: "Zero-latency state persistence without requiring third-party database logins." },
        { category: "Hosting & CI/CD", technology: "Vercel Platform", reason: "Automated git preview deployments, serverless functions, and global CDN caching." }
      ],
      development_phases: [
        { phase: "Phase 1: Architecture & UI Scaffolding", duration: "Weeks 1-2", deliverables: ["Component library", "API route contracts", "State schema"] },
        { phase: "Phase 2: Agent Integration & Prompt Tuning", duration: "Weeks 3-4", deliverables: ["Prompt pipelines", "JSON validator", "Fallback mock models"] },
        { phase: "Phase 3: Beta Testing & Polishing", duration: "Weeks 5-6", deliverables: ["User feedback loops", "End-to-end testing", "Mobile responsiveness"] },
        { phase: "Phase 4: Public Launch & Scaling", duration: "Weeks 7-8", deliverables: ["Product Hunt launch", "Vercel analytics", "Community onboarding"] }
      ],
      milestones: [
        { title: "Working MVP Deployment", date: "Week 4", success_criteria: "Complete venture generation workflow operating under 3 seconds." },
        { title: "First 100 Founder Users", date: "Month 2", success_criteria: "100 generated plans with 85%+ user approval score." },
        { title: "Public Product Hunt Launch", date: "Month 3", success_criteria: "Top 5 Product of the Day and 1,000+ new signups." },
        { title: "First $5,000 MRR Milestone", date: "Month 5", success_criteria: "50 paying Pro subscribers with positive net retention." }
      ]
    }

    const product_plan = await callGroq(prompt, {
      systemPrompt: "You are a VP of Product and Chief Technology Officer for high-growth tech startups. Return strictly valid JSON.",
      jsonMode: true,
      maxTokens: 3000,
      fallbackData: fallbackPlan,
    })

    return NextResponse.json({ product_plan: product_plan || fallbackPlan })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
