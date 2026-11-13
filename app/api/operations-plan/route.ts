import { NextResponse } from "next/server";
import { chatCompletion, parseJsonCompletion } from "@/lib/groq";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const userApiKey = req.headers.get("x-groq-api-key") || undefined
    const body = await req.json().catch(() => ({}));
    const startupIdea = body.startup_idea || body.startupIdea || "AI SaaS platform";
    const industry = body.industry || "Software & Technology";

    const prompt = `You are a startup operations consultant.
Create an operations strategy for the startup below.

Startup Idea: ${startupIdea}
Industry: ${industry}

Return ONLY valid JSON in this format:
{
  "operations_structure": {
    "teams": [
      { "name": "Engineering & DevOps", "lead": "VP of Engineering", "members": 5, "responsibilities": ["Core platform development", "Infrastructure reliability"] },
      { "name": "Customer Success & Support", "lead": "Head of CS", "members": 3, "responsibilities": ["Onboarding", "Ticket resolution", "Retention"] },
      { "name": "Growth & Marketing", "lead": "Growth Lead", "members": 2, "responsibilities": ["Acquisition funnels", "Content strategy"] }
    ],
    "tools": [
      { "name": "Linear", "category": "Project Management", "purpose": "Sprint planning and issue tracking" },
      { "name": "GitHub / Vercel", "category": "CI/CD & Hosting", "purpose": "Continuous integration and global deployment" },
      { "name": "Slack & Notion", "category": "Internal Ops", "purpose": "Communication and documentation" }
    ],
    "processes": [
      { "name": "Continuous Deployment Workflow", "frequency": "Daily", "owner": "Engineering", "description": "Automated test suites and staging environment rollouts" },
      { "name": "Weekly Sprint Review", "frequency": "Weekly", "owner": "Product Lead", "description": "Cross-functional progress check against quarterly milestones" }
    ]
  },
  "infrastructure": {
    "cloud": "AWS / Vercel hybrid for high-availability serverless workloads",
    "devops": "GitHub Actions with automated Docker builds, linting, and semantic versioning",
    "security": "SOC2-ready role-based access control, TLS 1.3, encrypted database backups"
  },
  "kpis": [
    { "metric": "System Uptime", "target": "99.95%", "current": "99.9%" },
    { "metric": "Customer Support First Response", "target": "< 15 mins", "current": "22 mins" },
    { "metric": "Sprint Delivery Velocity", "target": "85% points completed", "current": "80%" }
  ]
}

Only return pure JSON. No markdown or explanation.`;

    const raw = await chatCompletion([
      { role: "system", content: "You are an expert startup operations consultant who always returns raw valid JSON." },
      { role: "user", content: prompt },
    ], { apiKey: userApiKey, max_tokens: 3000 });

    const parsed = parseJsonCompletion<any>(raw, {
      operations_structure: {
        teams: [
          { name: "Engineering", lead: "Tech Lead", members: 4, responsibilities: ["Platform architecture", "API reliability"] },
          { name: "Product & Design", lead: "Product Lead", members: 2, responsibilities: ["Roadmap", "UX research"] },
          { name: "Growth & Sales", lead: "Growth Manager", members: 2, responsibilities: ["Inbound lead conversion", "Outreach"] }
        ],
        tools: [
          { name: "Linear", category: "Project Management", purpose: "Agile sprints" },
          { name: "Vercel & AWS", category: "Cloud Hosting", purpose: "Serverless execution" },
          { name: "PostHog", category: "Analytics", purpose: "Product telemetry" }
        ],
        processes: [
          { name: "Sprint Planning", frequency: "Bi-weekly", owner: "Tech Lead", description: "Prioritize backlog and plan releases" },
          { name: "Incident Management", frequency: "As needed", owner: "DevOps", description: "Automated alert triage and post-mortems" }
        ]
      },
      infrastructure: {
        cloud: "Vercel Serverless + Supabase / PostgreSQL cloud backend",
        devops: "GitHub Actions CI/CD with automated end-to-end testing",
        security: "End-to-end HTTPS, OAuth 2.0, AES-256 encrypted storage"
      },
      kpis: [
        { metric: "Platform Uptime", target: "99.9%", current: "99.8%" },
        { metric: "Release Frequency", target: "2 releases / week", current: "1 release / week" }
      ]
    });

    return NextResponse.json({ operations: parsed });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate operations plan" },
      { status: 500 }
    );
  }
}
