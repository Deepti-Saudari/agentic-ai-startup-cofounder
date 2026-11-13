"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Calculator, DollarSign, TrendingUp, PieChart, Download, RefreshCw } from "lucide-react"
import { apiFetch } from "@/lib/api"

interface FinancialData {
  month: string
  revenue: number
  expenses: number
  profit: number
  customers: number
  arr: number
}



export function FinancialModel() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasData, setHasData] = useState(false)
  const [financialData, setFinancialData] = useState<any>(null)
  const [startupIdea, setStartupIdea] = useState("")

  const [assumptions, setAssumptions] = useState({
    monthlyGrowthRate: "15",
    averageRevenuePerUser: "500",
    customerAcquisitionCost: "200",
    churnRate: "5",
    grossMargin: "80",
  })

  const generateModel = async () => {

  setIsGenerating(true)

  try {

    const response = await apiFetch("/financial-model", {
      method: "POST",
      body: JSON.stringify({
        startup_idea: startupIdea,
        growth_rate: assumptions.monthlyGrowthRate,
        arpu: assumptions.averageRevenuePerUser,
        cac: assumptions.customerAcquisitionCost,
        churn: assumptions.churnRate,
        margin: assumptions.grossMargin
      })
    })

    const data = await response.json()

    console.log("Financial Model:", data)

    setFinancialData(data.financials)

    setHasData(true)

  } catch (error) {

    console.error("Financial Model Error:", error)

  }

  setIsGenerating(false)

}

  const currentMetrics = financialData?.metrics || {
  mrr: 0,
  arr: 0,
  customers: 0,
  cac: 0,
  ltv: 0,
  burnRate: 0,
  runway: 0,
}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Financial Model</h1>
          <p className="text-muted-foreground">
            Build comprehensive financial projections and track key business metrics.
          </p>
        </div>
        <Button onClick={generateModel} disabled={isGenerating}>
          {isGenerating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Calculator className="w-4 h-4 mr-2" />}
          {isGenerating ? "Generating..." : "Generate Model"}
        </Button>
      </div>
      <Card>
  <CardHeader>
    <CardTitle>Startup Idea</CardTitle>
    <CardDescription>
      Enter your startup idea to generate financial projections
    </CardDescription>
  </CardHeader>

  <CardContent>

    <div className="space-y-2">

      <Label>Startup Idea</Label>

      <Input
        placeholder="Example: AI powered code review assistant"
        value={startupIdea}
        onChange={(e) => setStartupIdea(e.target.value)}
      />

    </div>

  </CardContent>
</Card>
      {/* Key Assumptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Key Assumptions
          </CardTitle>
          <CardDescription>Define the core assumptions that drive your financial model.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="growth-rate">Monthly Growth Rate (%)</Label>
              <Input
                id="growth-rate"
                type="number"
                value={assumptions.monthlyGrowthRate}
                onChange={(e) => setAssumptions({ ...assumptions, monthlyGrowthRate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arpu">Avg Revenue Per User ($)</Label>
              <Input
                id="arpu"
                type="number"
                value={assumptions.averageRevenuePerUser}
                onChange={(e) => setAssumptions({ ...assumptions, averageRevenuePerUser: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cac">Customer Acquisition Cost ($)</Label>
              <Input
                id="cac"
                type="number"
                value={assumptions.customerAcquisitionCost}
                onChange={(e) => setAssumptions({ ...assumptions, customerAcquisitionCost: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="churn">Monthly Churn Rate (%)</Label>
              <Input
                id="churn"
                type="number"
                value={assumptions.churnRate}
                onChange={(e) => setAssumptions({ ...assumptions, churnRate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="margin">Gross Margin (%)</Label>
              <Input
                id="margin"
                type="number"
                value={assumptions.grossMargin}
                onChange={(e) => setAssumptions({ ...assumptions, grossMargin: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {hasData && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
            <TabsTrigger value="projections">Projections</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span className="font-semibold">MRR</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">${currentMetrics.mrr.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Monthly Recurring Revenue</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">ARR</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">${(currentMetrics.arr / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-muted-foreground">Annual Recurring Revenue</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <PieChart className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">Customers</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{currentMetrics.customers}</p>
                  <p className="text-xs text-muted-foreground">Total active customers</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold">LTV/CAC</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {(currentMetrics.ltv / currentMetrics.cac).toFixed(1)}x
                  </p>
                  <p className="text-xs text-muted-foreground">Lifetime Value / CAC ratio</p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue & Profit Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Profit Trends</CardTitle>
                <CardDescription>Monthly revenue, expenses, and profit over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={financialData?.projections|| []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]} />
                    <Line type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} name="Revenue" />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                    <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Monthly revenue growth and customer acquisition</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={financialData?.projections || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]} />
                    <Bar dataKey="revenue" fill="#059669" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current MRR</span>
                    <span className="font-semibold">${currentMetrics.mrr.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ARR</span>
                    <span className="font-semibold">${(currentMetrics.arr / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ARPU</span>
                    <span className="font-semibold">${assumptions.averageRevenuePerUser}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Growth Rate</span>
                    <span className="font-semibold text-green-600">{assumptions.monthlyGrowthRate}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Customers</span>
                    <span className="font-semibold">{currentMetrics.customers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CAC</span>
                    <span className="font-semibold">${currentMetrics.cac}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">LTV</span>
                    <span className="font-semibold">${currentMetrics.ltv.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Churn Rate</span>
                    <span className="font-semibold text-red-600">{assumptions.churnRate}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Unit Economics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">LTV</span>
                    <span className="font-semibold">${currentMetrics.ltv.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CAC</span>
                    <span className="font-semibold">${currentMetrics.cac}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">LTV/CAC Ratio</span>
                    <Badge variant={currentMetrics.ltv / currentMetrics.cac > 3 ? "default" : "destructive"}>
                      {(currentMetrics.ltv / currentMetrics.cac).toFixed(1)}x
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payback Period</span>
                    <span className="font-semibold">
                      {Math.round(currentMetrics.cac / (Number.parseInt(assumptions.averageRevenuePerUser) * 0.8))}{" "}
                      months
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cash Flow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Burn</span>
                    <span className="font-semibold text-red-600">${currentMetrics.burnRate.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Runway</span>
                    <span className="font-semibold">{currentMetrics.runway} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Break-even</span>
                    <span className="font-semibold">Month 3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cash Position</span>
                    <span className="font-semibold text-green-600">$810K</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Growth Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MRR Growth</span>
                    <span className="font-semibold text-green-600">{assumptions.monthlyGrowthRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer Growth</span>
                    <span className="font-semibold text-green-600">12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Churn Rate</span>
                    <span className="font-semibold text-red-600">{assumptions.churnRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Net Revenue Retention</span>
                    <span className="font-semibold text-green-600">110%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>3-Year Financial Projections</CardTitle>
                <CardDescription>Revenue, customer, and profitability forecasts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Metric</th>
                        <th className="text-right p-2">Year 1</th>
                        <th className="text-right p-2">Year 2</th>
                        <th className="text-right p-2">Year 3</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">

<tr className="border-b">
<td className="p-2 font-medium">Revenue</td>

<td className="p-2 text-right">
${financialData?.yearly_projection?.year1?.revenue?.toLocaleString()}
</td>

<td className="p-2 text-right">
${financialData?.yearly_projection?.year2?.revenue?.toLocaleString()}
</td>

<td className="p-2 text-right">
${financialData?.yearly_projection?.year3?.revenue?.toLocaleString()}
</td>

</tr>


<tr className="border-b">
<td className="p-2 font-medium">Customers</td>

<td className="p-2 text-right">
{financialData?.yearly_projection?.year1?.customers}
</td>

<td className="p-2 text-right">
{financialData?.yearly_projection?.year2?.customers}
</td>

<td className="p-2 text-right">
{financialData?.yearly_projection?.year3?.customers}
</td>

</tr>


<tr className="border-b">
<td className="p-2 font-medium">Gross Profit</td>

<td className="p-2 text-right">
${financialData?.yearly_projection?.year1?.grossProfit?.toLocaleString()}
</td>

<td className="p-2 text-right">
${financialData?.yearly_projection?.year2?.grossProfit?.toLocaleString()}
</td>

<td className="p-2 text-right">
${financialData?.yearly_projection?.year3?.grossProfit?.toLocaleString()}
</td>

</tr>


<tr className="border-b">
<td className="p-2 font-medium">Operating Expenses</td>

<td className="p-2 text-right">
${financialData?.yearly_projection?.year1?.operatingExpenses?.toLocaleString()}
</td>

<td className="p-2 text-right">
${financialData?.yearly_projection?.year2?.operatingExpenses?.toLocaleString()}
</td>

<td className="p-2 text-right">
${financialData?.yearly_projection?.year3?.operatingExpenses?.toLocaleString()}
</td>

</tr>


<tr className="border-b">
<td className="p-2 font-medium">Net Income</td>

<td className="p-2 text-right">
${financialData?.yearly_projection?.year1?.netIncome?.toLocaleString()}
</td>

<td className="p-2 text-right">
${financialData?.yearly_projection?.year2?.netIncome?.toLocaleString()}
</td>

<td className="p-2 text-right">
${financialData?.yearly_projection?.year3?.netIncome?.toLocaleString()}
</td>

</tr>

</tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Export Financial Model
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                <Calculator className="w-4 h-4 mr-2" />
                Create Investor Deck
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
