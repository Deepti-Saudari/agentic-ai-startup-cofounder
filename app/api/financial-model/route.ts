import { NextResponse } from "next/server"
import { callGroq } from "@/lib/groq"

export async function POST(req: Request) {
  try {
    const {
      startup_idea = "B2B SaaS",
      growth_rate = "15",
      arpu = "100",
      cac = "250",
      churn = "4",
      margin = "80",
    } = await req.json()

    const prompt = `Create a realistic financial model for:
Startup Idea: ${startup_idea}
Assumptions:
- Growth Rate: ${growth_rate}%
- ARPU: $${arpu}
- CAC: $${cac}
- Churn: ${churn}%
- Gross Margin: ${margin}%

Return ONLY valid JSON matching this schema:
{
  "metrics": {
    "mrr": 25000,
    "arr": 300000,
    "customers": 250,
    "ltv": 2500,
    "cac": 250,
    "burnRate": 18000,
    "runway": 18
  },
  "projections": [
    {
      "month": "Month 1",
      "revenue": 5000,
      "expenses": 15000,
      "profit": -10000,
      "customers": 50,
      "arr": 60000
    }
  ],
  "yearly_projection": {
    "year1": { "revenue": 120000, "customers": 180, "grossProfit": 96000, "operatingExpenses": 180000 },
    "year2": { "revenue": 550000, "customers": 600, "grossProfit": 440000, "operatingExpenses": 420000 },
    "year3": { "revenue": 1850000, "customers": 1800, "grossProfit": 1480000, "operatingExpenses": 950000 }
  }
}`

    // Calculate dynamic 12-month projections based on user inputs
    const monthlyRate = parseFloat(growth_rate) / 100 || 0.15
    const ticket = parseFloat(arpu) || 100
    const costAcq = parseFloat(cac) || 250
    const marginPct = parseFloat(margin) / 100 || 0.8
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    let currentCustomers = 20
    const projections = months.map((m) => {
      currentCustomers = Math.round(currentCustomers * (1 + monthlyRate))
      const revenue = Math.round(currentCustomers * ticket)
      const expenses = Math.round(revenue * (1 - marginPct) + (currentCustomers * costAcq * 0.1) + 8000)
      const profit = revenue - expenses
      return {
        month: m,
        revenue,
        expenses,
        profit,
        customers: currentCustomers,
        arr: revenue * 12,
      }
    })

    const fallbackFinancials = {
      metrics: {
        mrr: projections[projections.length - 1].revenue,
        arr: projections[projections.length - 1].revenue * 12,
        customers: projections[projections.length - 1].customers,
        ltv: Math.round(ticket / (parseFloat(churn) / 100 || 0.04)),
        cac: costAcq,
        burnRate: 14000,
        runway: 18,
      },
      projections,
      yearly_projection: {
        year1: {
          revenue: projections.reduce((s, p) => s + p.revenue, 0),
          customers: projections[11].customers,
          grossProfit: Math.round(projections.reduce((s, p) => s + p.revenue, 0) * marginPct),
          operatingExpenses: 180000,
          netIncome: Math.round(projections.reduce((s, p) => s + p.revenue, 0) * marginPct) - 180000,
        },
        year2: {
          revenue: Math.round(projections[11].arr * 1.8),
          customers: Math.round(projections[11].customers * 2.2),
          grossProfit: Math.round(projections[11].arr * 1.8 * marginPct),
          operatingExpenses: 450000,
          netIncome: Math.round(projections[11].arr * 1.8 * marginPct) - 450000,
        },
        year3: {
          revenue: Math.round(projections[11].arr * 4.5),
          customers: Math.round(projections[11].customers * 5.0),
          grossProfit: Math.round(projections[11].arr * 4.5 * marginPct),
          operatingExpenses: 1100000,
          netIncome: Math.round(projections[11].arr * 4.5 * marginPct) - 1100000,
        },
      },
    }

    const financials = await callGroq(prompt, {
      systemPrompt: "You are a Wall Street & Silicon Valley startup financial modeler. Return strictly valid JSON.",
      jsonMode: true,
      maxTokens: 2500,
      fallbackData: fallbackFinancials,
    })

    return NextResponse.json({ financials: financials || fallbackFinancials })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
