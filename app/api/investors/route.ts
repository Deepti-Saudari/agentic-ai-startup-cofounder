import { NextResponse } from 'next/server';
import { callGroq } from '@/lib/groq';

export const runtime = "nodejs";

// Define types locally to avoid import issues
interface Investor {
  id: string;
  name: string;
  firm: string;
  type: string;
  location: string;
  investment_stage: string[];
  check_size: string;
  industries: string[];
  recent_investments: string[];
  meeting_available: boolean;
  last_active?: string;
  match_score?: number;
}

interface RequestBody {
  industry?: string;
  stage?: string;
  startupIdea?: string;
}

export async function POST(
  request: Request
): Promise<NextResponse> {
  try {
    const userApiKey = request.headers.get("x-groq-api-key") || undefined;
    const body = (await request.json().catch(() => ({}))) as RequestBody;

    const industry = body?.industry || 'Technology / AI';
    const stage = body?.stage || 'Seed';
    const startupIdea = body?.startupIdea || 'B2B AI Platform';

    const fallbackInvestors = getDemoInvestors(industry, stage).map((inv, idx) => ({
      ...inv,
      match_score: 95 - idx * 4,
    }));

    const prompt = `You are a venture capital syndicate director.
Find 6 premier venture capital firms, angel syndicates, or accelerators actively investing in this startup:
Startup Idea: ${startupIdea}
Industry: ${industry}
Stage: ${stage}

Return ONLY valid JSON matching this schema:
{
  "investors": [
    {
      "id": "1",
      "name": "Lead Partner or Firm Name",
      "firm": "Firm Name",
      "type": "VC",
      "location": "City, State or Country",
      "investment_stage": ["${stage}"],
      "check_size": "$500K - $3M",
      "industries": ["${industry}", "AI & Software"],
      "recent_investments": ["Company A", "Company B"],
      "meeting_available": true,
      "last_active": "Active this week",
      "match_score": 96
    }
  ]
}`;

    const result = await callGroq(prompt, {
      systemPrompt: "You are a Silicon Valley venture capitalist matching founders with top tier investors. Return strictly valid JSON.",
      jsonMode: true,
      maxTokens: 2500,
      apiKey: userApiKey,
      fallbackData: { investors: fallbackInvestors },
    });

    const investorsList = (result?.investors && Array.isArray(result.investors) && result.investors.length > 0)
      ? result.investors
      : fallbackInvestors;

    return NextResponse.json({
      investors: investorsList,
      timestamp: new Date().toISOString(),
      total_found: investorsList.length,
      source: result?.investors ? 'Groq AI Live' : 'Demo data',
    });
  } catch (error) {
    console.error('Error in investors API:', error);
    return NextResponse.json({
      error: 'Failed to fetch investors',
      investors: [],
    }, { status: 500 });
  }
}

// Demo investor generator
function getDemoInvestors(industry: string, stage: string): Investor[] {
  return [
    {
      id: '1',
      name: 'Andreessen Horowitz (a16z)',
      firm: 'Andreessen Horowitz',
      type: 'VC',
      location: 'Menlo Park, CA',
      investment_stage: [stage, 'Series A', 'Series B'],
      check_size: '$1M - $15M',
      industries: [industry, 'AI/ML', 'Developer Tools'],
      recent_investments: ['OpenAI', 'Databricks', 'Cursor'],
      meeting_available: true,
      last_active: 'This week',
    },
    {
      id: '2',
      name: 'Sequoia Capital',
      firm: 'Sequoia Capital',
      type: 'VC',
      location: 'Menlo Park, CA',
      investment_stage: ['Pre-Seed', stage, 'Series A'],
      check_size: '$500K - $5M',
      industries: [industry, 'Enterprise', 'AI Infrastructure'],
      recent_investments: ['Harvey AI', 'DoorDash', 'Stripe'],
      meeting_available: true,
      last_active: 'Active yesterday',
    },
    {
      id: '3',
      name: 'Y Combinator',
      firm: 'Y Combinator',
      type: 'Accelerator',
      location: 'San Francisco, CA',
      investment_stage: ['Pre-Seed', 'Seed'],
      check_size: '$500,000 standard SAFE',
      industries: ['All Industries', industry],
      recent_investments: ['Airbnb', 'Stripe', 'Coinbase', 'Scale AI'],
      meeting_available: true,
      last_active: 'Active today',
    },
    {
      id: '4',
      name: 'Bessemer Venture Partners',
      firm: 'Bessemer Venture Partners',
      type: 'VC',
      location: 'San Francisco, CA',
      investment_stage: [stage, 'Series A'],
      check_size: '$1M - $10M',
      industries: ['Cloud Software', industry, 'Developer Tools'],
      recent_investments: ['Shopify', 'Twilio', 'Zapier'],
      meeting_available: true,
      last_active: 'This week',
    },
    {
      id: '5',
      name: 'Founders Fund',
      firm: 'Founders Fund',
      type: 'VC',
      location: 'San Francisco, CA',
      investment_stage: ['Seed', 'Series A', 'Growth'],
      check_size: '$1M - $20M',
      industries: ['Deep Tech', 'Applied AI', industry],
      recent_investments: ['SpaceX', 'Palantir', 'Figma'],
      meeting_available: false,
      last_active: '3 days ago',
    },
    {
      id: '6',
      name: 'Techstars Accelerator',
      firm: 'Techstars',
      type: 'Accelerator',
      location: 'Boulder / Worldwide',
      investment_stage: ['Pre-Seed', 'Seed'],
      check_size: '$120,000 convertible',
      industries: [industry, 'SaaS', 'B2B Tools'],
      recent_investments: ['SendGrid', 'ClassPass', 'DigitalOcean'],
      meeting_available: true,
      last_active: 'Active today',
    },
  ];
}
