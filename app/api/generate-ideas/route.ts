import { NextResponse } from "next/server"
import { callGroq } from "@/lib/groq"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { skills = "Fullstack & AI Engineering", interests = "B2B SaaS, Productivity, Autonomous Agents", experience = "Senior Software Engineer", idea = "", mode = "generate" } = body

    const prompt = mode === "generate"
      ? `You are a world-class venture capitalist and startup strategist.
Analyze founder profile:
- Skills: ${skills}
- Interests: ${interests}
- Experience: ${experience}

Perform a deep 8-layer strategic industry analysis and generate 3 comprehensive startup opportunities.
Return ONLY valid JSON matching this schema:
{
  "analysis": {
    "industry": {
      "name": "${interests.split(',')[0] || 'Enterprise Software'}",
      "history": {
        "evolution": "Industry evolved from manual bespoke services to centralized cloud tools, and is now rapidly transitioning to autonomous agentic workflows.",
        "timeline": [
          { "year": "2015", "event": "First Generation SaaS Explosion", "impact": "Standardized subscription workflows across enterprises." },
          { "year": "2020", "event": "Remote Work Acceleration", "impact": "Forced adoption of collaborative asynchronous tooling." },
          { "year": "2024", "event": "Generative AI Paradigm Shift", "impact": "Transition from manual UI entry to autonomous execution." }
        ],
        "pastStartups": [
          { "name": "VentureOps", "outcome": "Acquired", "year": "2021", "lesson": "Deep workflow integration creates high switching costs." }
        ]
      }
    },
    "ecosystem": {
      "majorPlayers": [
        { "name": "Incumbent Leaders", "type": "incumbent", "strengths": ["Enterprise sales", "Existing customer base"], "weaknesses": ["Slow UI innovation", "High pricing"] }
      ],
      "startups": [
        { "name": "NextGen Automation", "focus": "Agentic Orchestration", "fundingStage": "Series A", "notable": true }
      ],
      "investors": [
        { "name": "a16z & Sequoia", "focus": ["Applied AI", "Developer Tools"], "typicalCheck": "$2M - $10M", "active": true }
      ]
    },
    "technology": {
      "emerging": [
        { "name": "Multi-Agent Reflection Loops", "maturity": "maturing", "impact": "high", "timeframe": "1-2 years" },
        { "name": "Real-time Edge Inference", "maturity": "developing", "impact": "high", "timeframe": "1 year" }
      ]
    },
    "regulation": {
      "opportunities": [
        { "area": "Data Privacy & Local Persistence", "advantage": "Zero-retention architecture allows compliant enterprise adoption", "impact": "high" }
      ]
    },
    "problems": {
      "problems": [
        {
          "id": "1",
          "problem": "Founders lose 25+ hours weekly coordinating fragmented tools and legal/finance boilerplate.",
          "severity": "critical",
          "marketFailure": "Existing tools provide isolated silos without shared startup context.",
          "opportunity": "Unified autonomous agent suite executing full venture operations."
        }
      ]
    }
  },
  "ideas": [
    {
      "id": "1",
      "title": "Autonomous Ops Engine",
      "tagline": "AI Co-founder that executes back-office workflows autonomously",
      "description": "Multi-agent executive team streamlining company formation, compliance, financial models, and roadmaps.",
      "problem": {
        "statement": "Early founders spend 60% of their time on operational bureaucracy instead of talking to users.",
        "severity": "High",
        "frequency": "Daily",
        "whyNow": "Groq LLM speeds enable real-time sub-second multi-agent planning loops."
      },
      "solution": {
        "statement": "An on-demand suite of 13 coordinated autonomous agents executing strategic startup operations.",
        "uniqueValue": "Transforms multi-week consulting processes into 30-second structured blueprints.",
        "whyBetter": "Persistent local workspace with zero data leaks and instant document compilation.",
        "keyFeatures": ["1-Click Business Plan & SWOT", "Real-Time Pitch Deck Synthesizer", "Financial Model Generator"]
      },
      "targetCustomers": ["Technical Solo Founders", "Incubator Cohorts", "Agile Small Teams"],
      "marketOpportunity": {
        "size": "$18.4 Billion",
        "growth": "28.5% CAGR",
        "trend": "Shift toward lean 1-person billion dollar companies",
        "drivers": ["Proliferation of AI tools", "High advisory hourly rates"]
      },
      "technologyStack": ["Next.js 14", "Tailwind CSS", "Groq LLaMA 3", "Vercel Serverless"],
      "businessModel": {
        "revenueStreams": ["Self-serve SaaS ($49/mo)", "Studio Tier ($199/mo)"],
        "pricing": [
          { "tier": "Pro Founder", "price": "$49/mo", "features": ["Unlimited blueprint exports", "Fast Groq inference", "Storage sync"] }
        ]
      },
      "competitiveLandscape": {
        "directCompetitors": [
          { "name": "Generic Chatbots", "weakness": "Lacks structured document outputs and data persistence" }
        ],
        "differentiation": "Domain-specialized agentic workflows with automatic local workspace synchronization.",
        "moat": ["Unified multi-agent orchestration", "Client-side private state"]
      },
      "mvpRoadmap": [
        { "phase": "Phase 1: Core Blueprint Generator", "duration": "Month 1", "features": ["Idea generator", "Business plan", "Market research"] },
        { "phase": "Phase 2: Export & Financial Engine", "duration": "Month 2", "features": ["Live financial model", "Instant PDF export"] }
      ],
      "keyRisks": [
        { "risk": "LLM model hallucination on market statistics", "impact": "Medium", "probability": "Low", "mitigation": "Constrained JSON schemas and domain validation gates." }
      ],
      "exitOpportunities": [
        { "type": "Acquisition", "acquirer": "Atlassian / Carta / AngelList", "rationale": "Strategic acquisition to power next-generation founder onboarding." }
      ],
      "scoring": {
        "marketNeed": 94,
        "technicalFeasibility": 91,
        "businessViability": 89,
        "competitiveMoat": 88,
        "timingAndTrends": 96,
        "overall": 92
      },
      "strategicRecommendations": [
        "Focus on product-led growth through interactive public calculators.",
        "Partner with pre-seed venture incubators for cohort distribution.",
        "Keep local persistence as a key privacy and speed differentiator."
      ]
    }
  ]
}`
      : `You are a world-class venture capitalist. Enhance this startup idea:
Idea: ${idea}
Return ONLY valid JSON matching the same comprehensive 8-layer schema.`

    const fallbackData = {
      analysis: {
        industry: {
          name: interests.split(',')[0] || "Software & Artificial Intelligence",
          history: {
            evolution: "The software landscape has shifted from monolithic desktop tools to cloud SaaS, and is currently experiencing an epochal transition toward autonomous agentic architectures that execute goals independently.",
            timeline: [
              { year: "2018", event: "Cloud SaaS Saturation", impact: "Sprawling fragmented point solutions created severe operator context switching." },
              { year: "2021", event: "Rise of Low-Code & APIs", impact: "Standardized protocols allowed seamless cross-platform integrations." },
              { year: "2024", event: "Autonomous LLM Reasoning", impact: "Shifted software from passive record-keeping to proactive decision execution." }
            ],
            pastStartups: [
              { name: "VentureSmith", outcome: "Acquired", year: "2022", lessons: ["Founders prioritize fast execution over lengthy documents."] }
            ]
          }
        },
        ecosystem: {
          majorPlayers: [
            { name: "Legacy SaaS Suites", type: "incumbent", strengths: ["Enterprise contracts"], weaknesses: ["High complexity", "Expensive implementation"] },
            { name: "AI Assistant Plugins", type: "challenger", strengths: ["Fast conversational answers"], weaknesses: ["No structured business document output"] }
          ],
          startups: [
            { name: "Agentic Founders Co", focus: "Multi-Agent Venture Scaffolding", fundingStage: "Seed", notable: true }
          ],
          investors: [
            { name: "Y Combinator & Andreessen Horowitz", focus: ["AI Agents", "B2B SaaS", "DevTools"], typicalCheck: "$500K - $5M", active: true }
          ]
        },
        technology: {
          emerging: [
            { name: "Sub-Second Groq LLaMA Inference", maturity: "maturing", impact: "high", timeframe: "Immediate" },
            { name: "Zero-Knowledge Local State Persistence", maturity: "maturing", impact: "high", timeframe: "Current" }
          ]
        },
        regulation: {
          opportunities: [
            { area: "Data Sovereignty & Local Browser Storage", advantage: "Founders can brainstorm proprietary trade secrets without risk of cloud leakage", impact: "high" }
          ]
        },
        problems: {
          problems: [
            {
              id: "1",
              problem: "Founders waste 30+ hours weekly researching competitors, drafting pitch decks, and estimating unit economics manually.",
              severity: "critical",
              marketFailure: "Advisory services cost $15,000+ while generic AI chats lack structured schemas.",
              opportunity: "Deliver instantaneous, verifiable, investor-grade startup blueprints in one unified application."
            }
          ]
        }
      },
      ideas: [
        {
          id: "1",
          title: `Autonomous ${interests.split(',')[0] || "Venture"} Orchestration Platform`,
          tagline: "Your 24/7 AI Co-Founder for strategy, market research, and financial modeling",
          description: "An integrated suite of 13 specialized AI agents that synthesize market validation, lean canvases, financial forecasts, and pitch decks in seconds.",
          problem: {
            statement: "Solo founders and early builders are bottlenecked by lack of cross-disciplinary expertise in finance, marketing, and legal planning.",
            severity: "High",
            frequency: "Daily",
            whyNow: "Ultra-fast Groq LPU computing enables multi-agent validation loops in under 3 seconds."
          },
          solution: {
            statement: "A comprehensive executive command center that coordinates research, finance, and roadmaps seamlessly.",
            uniqueValue: "Replaces 5 disparate subscription tools with one unified venture intelligence engine.",
            whyBetter: "Instant local persistence, zero data tracking, and real-time interactive dashboards.",
            keyFeatures: [
              "Automated 8-Layer Market Research",
              "12-Month Financial Forecasting with Live Charts",
              "Investor Pitch Deck Narrative Architect",
              "1-Click PDF Business Plan Exporter"
            ]
          },
          targetCustomers: [
            "Technical Solo Founders & Indie Hackers",
            "Accelerators, Incubators & Venture Studios",
            "Corporate Product Managers & Innovators"
          ],
          marketOpportunity: {
            size: "$21.5 Billion",
            growth: "31.2% CAGR",
            trend: "Proliferation of 1-person software companies",
            drivers: ["Rising cost of consulting services", "Rapid acceleration in global startup formation"]
          },
          technologyStack: ["Next.js 14 App Router", "Tailwind CSS", "Groq LLaMA 3.3", "Vercel Serverless"],
          businessModel: {
            type: ["SaaS", "Freemium"],
            revenueStreams: ["Pro Founder Subscription ($49/mo)", "Venture Studio License ($199/mo)"],
            pricing: [
              { tier: "Starter", price: "Free", features: ["Basic idea generation", "Local workspace auto-save"] },
              { tier: "Pro Co-Founder", price: "$49/mo", features: ["Unlimited agent executions", "PDF plan exports", "Priority Groq inference"] }
            ]
          },
          competitiveLandscape: {
            directCompetitors: [
              { name: "Single-window ChatGPT / Claude", weakness: "Unstructured, forgets context across sessions" },
              { name: "Static Template Marketplaces", weakness: "Non-interactive, requires manual spreadsheet entry" }
            ],
            differentiation: "Interactive live calculation engine with persistent workspace state and multi-agent synthesis.",
            moat: ["Unified multi-agent data model", "Instant client-side privacy architecture"]
          },
          mvpRoadmap: [
            { phase: "Sprint 1: Core Strategy Engine", duration: "Weeks 1-3", features: ["Idea generator", "Market research", "Lean canvas"] },
            { phase: "Sprint 2: Financials & Investor Matching", duration: "Weeks 4-6", features: ["Dynamic CAC/LTV model", "Verified investor matchmaking"] },
            { phase: "Sprint 3: Document Compilation & PDF Export", duration: "Weeks 7-9", features: ["1-click PDF download", "Executive summary printer"] }
          ],
          keyRisks: [
            { risk: "Competitor imitation by generic wrapper tools", impact: "Medium", probability: "Medium", mitigation: "Focus on deep workflow tooling, financial calculations, and unified workspace persistence." }
          ],
          exitOpportunities: [
            { type: "Acquisition", acquirer: "Carta / AngelList / HubSpot", rationale: "Natural expansion into top-of-funnel founder acquisition and cap table onboarding." }
          ],
          scoring: {
            marketNeed: 95,
            technicalFeasibility: 92,
            businessViability: 90,
            competitiveMoat: 89,
            timingAndTrends: 97,
            overall: 93
          },
          strategicRecommendations: [
            "Leverage interactive free calculators to capture high-intent founder traffic.",
            "Integrate directly with founder communities and university incubator cohorts.",
            "Maintain ultra-fast Groq inference speeds as a signature user delight feature."
          ]
        },
        {
          id: "2",
          title: "Real-Time Compliance & Legal Auditor",
          tagline: "Continuous automated compliance scanning and contract generation for startups",
          description: "Generates tailored Founders Agreements, NDAs, and IP assignments with instant risk analysis.",
          problem: {
            statement: "Legal fees for early setup exceed $5,000, leading many founders to skip critical IP agreements.",
            severity: "Critical",
            frequency: "Weekly",
            whyNow: "LLMs now have the precision to draft binding, standardized legal clauses with accuracy."
          },
          solution: {
            statement: "Self-service legal workflow suite that produces signed, exportable PDFs in seconds.",
            uniqueValue: "Saves $4,000+ in early legal costs while ensuring 100% IP ownership assignment.",
            whyBetter: "Includes instant PDF export with clean formatting.",
            keyFeatures: ["Delaware C-Corp IP Assignment", "Mutual NDA Generator", "Founders Stock Vesting Clauses"]
          },
          targetCustomers: ["Pre-seed Tech Founders", "Remote Engineering Teams"],
          marketOpportunity: {
            size: "$9.8 Billion",
            growth: "24.5% CAGR",
            trend: "Standardization of venture legal agreements (SAFE, FAST agreements)",
            drivers: ["Global remote teams", "Need for bulletproof legal diligence"]
          },
          technologyStack: ["Next.js 14", "Tailwind CSS", "Simple-PDF Generator"],
          businessModel: {
            type: ["Subscription", "Pay per document"],
            revenueStreams: ["$79 one-time package or $29/mo"],
            pricing: [
              { tier: "Legal Core", price: "$29/mo", features: ["All templates", "Unlimited PDF generation"] }
            ]
          },
          competitiveLandscape: {
            directCompetitors: [{ name: "Clerky / LegalZoom", weakness: "Rigid, slow, and expensive" }],
            differentiation: "Instant generation tailored to specific founder skillsets and cap tables.",
            moat: ["Customized clause templates", "Integrated startup workflow"]
          },
          mvpRoadmap: [
            { phase: "Phase 1", duration: "Month 1", features: ["Founders agreement generator", "PDF export"] }
          ],
          keyRisks: [
            { risk: "Regulatory compliance variations", impact: "High", probability: "Low", mitigation: "Standardized Delaware corporate law baseline." }
          ],
          exitOpportunities: [
            { type: "Acquisition", acquirer: "LegalZoom / Stripe Atlas", rationale: "Consolidation of automated legal tech for startups." }
          ],
          scoring: {
            marketNeed: 91,
            technicalFeasibility: 94,
            businessViability: 88,
            competitiveMoat: 86,
            timingAndTrends: 92,
            overall: 90
          },
          strategicRecommendations: [
            "Provide disclaimers and recommend legal review for non-standard terms.",
            "Bundle with company formation checklists."
          ]
        }
      ]
    }

    const result = await callGroq(prompt, {
      systemPrompt: "You are a master venture capitalist and startup architect. Return ONLY valid JSON matching the exact schema with all 8 layers populated.",
      jsonMode: true,
      maxTokens: 4000,
      fallbackData,
    })

    return NextResponse.json(result || fallbackData)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
