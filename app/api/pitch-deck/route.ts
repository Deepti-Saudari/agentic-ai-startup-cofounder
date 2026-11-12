import { NextResponse } from "next/server"
import { callGroq } from "@/lib/groq"

export async function POST(req: Request) {
  try {
    const { startup_idea = "AI Co-Founder Suite", target_market = "Tech Founders" } = await req.json()

    const prompt = `Create a compelling 9-slide investor pitch deck for:
Startup Idea: ${startup_idea}
Target Market: ${target_market}

Return ONLY valid JSON matching this schema:
{
  "problem": "Pain point description",
  "solution": "Unique product solution",
  "market": "TAM, SAM, SOM analysis",
  "businessModel": "Pricing & revenue structure",
  "traction": "Early momentum, pilots, waitlist",
  "competition": "Key competitors & our moat",
  "team": "Founder superpowers and domain mastery",
  "financials": "Revenue growth trajectory",
  "ask": "Target funding round & capital allocation"
}`

    const fallbackDeck = {
      problem: `Early-stage founders spend 60% of their initial runway struggling with non-core tasks—drafting business plans, researching competitors, building financial models, and writing pitch decks. Outside advisory and agencies cost $20,000+ with weeks of delay.`,
      solution: `${startup_idea} replaces fragmented consultant work with an integrated suite of 13 autonomous AI agents that act as an on-demand executive co-founder team available 24/7.`,
      market: `Targeting ${target_market}. Total Addressable Market (TAM) is $18.4B across global startup tooling, incubators, and solo-entrepreneur software growing at 28% CAGR. Initial serviceable obtainable market (SOM) is $420M in English-speaking tech hubs.`,
      businessModel: `High-margin SaaS recurring subscription: Pro Plan at $49/month for solo founders, Studio Plan at $199/month for incubators and venture builders, plus pay-per-execution agent usage models.`,
      traction: `Over 1,200 active beta users, 3,400+ generated startup blueprints, 94% user satisfaction rate, and 45% month-over-month organic waitlist growth driven entirely by founder community referrals.`,
      competition: `Incumbents rely on generic single-chat windows or static PDF templates. Our moat is deep multi-agent workflow orchestration, local workspace persistence, and domain-specialized evaluation algorithms.`,
      team: `Complementary founding team combining deep AI engineering expertise, repeat venture-backed startup leadership, and scaled product design from tier-1 technology companies.`,
      financials: `Projected Year 1 ARR of $240,000 scaling to $1.8M ARR in Year 2 and $5.5M ARR in Year 3 with an 84% software gross margin and negative net churn.`,
      ask: `Raising $1,000,000 Seed financing to accelerate multi-agent model fine-tuning, expand engineering team, and scale product-led growth acquisition funnels.`
    }

    const deck = await callGroq(prompt, {
      systemPrompt: "You are a top Silicon Valley venture capitalist and pitch deck narrative architect. Return strictly valid JSON.",
      jsonMode: true,
      maxTokens: 2500,
      fallbackData: fallbackDeck,
    })

    return NextResponse.json({ deck: deck || fallbackDeck })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
