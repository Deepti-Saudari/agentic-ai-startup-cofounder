"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { FileText, Target, TrendingUp, AlertTriangle, CheckCircle, Download, Save, RefreshCw } from "lucide-react"
import { getApiUrl } from "@/lib/api"

interface LeanCanvasData {
  problem: string
  solution: string
  keyMetrics: string
  uniqueValueProposition: string
  unfairAdvantage: string
  channels: string
  customerSegments: string
  costStructure: string
  revenueStreams: string
}

interface SWOTData {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

export function BusinessPlan() {
  const [activeTab, setActiveTab] = useState("lean-canvas")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [startupIdea, setStartupIdea] = useState("")

  const [leanCanvas, setLeanCanvas] = useState<LeanCanvasData>({
    problem: "",
    solution: "",
    keyMetrics: "",
    uniqueValueProposition: "",
    unfairAdvantage: "",
    channels: "",
    customerSegments: "",
    costStructure: "",
    revenueStreams: "",
  })

  const [swot, setSWOT] = useState<SWOTData>({
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
  })
  const [executiveSummary, setExecutiveSummary] = useState<any>(null)

  const generateBusinessPlan = async () => {
  setIsGenerating(true)

  try {
    const response = await fetch(getApiUrl("/business-plan"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        startup_idea: startupIdea
      })
    })

    const data = await response.json()

    if (data.plan) {
      setLeanCanvas(
        data.plan.lean_canvas || {
          problem: "",
          solution: "",
          keyMetrics: "",
          uniqueValueProposition: "",
          unfairAdvantage: "",
          channels: "",
          customerSegments: "",
          costStructure: "",
          revenueStreams: ""
        }
      )

      setSWOT(
        data.plan.swot || {
          strengths: [],
          weaknesses: [],
          opportunities: [],
          threats: []
        }
      )

      setExecutiveSummary(data.plan.executive_summary || null)
    }
  } catch (error) {
    console.error("Business Plan Error:", error)
  }

  setIsGenerating(false)
}

  const savePlan = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }
  const router = useRouter()
  const exportPDF = async () => {

  const response = await fetch(getApiUrl("/export-business-plan"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      lean_canvas: leanCanvas,
      swot: swot,
      executive_summary: executiveSummary
    })
  })

  const blob = await response.blob()

  const url = window.URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = "business_plan.pdf"
  a.click()
}

const createPitchDeck = () => {

  router.push("/pitch-deck")

}

  const updateLeanCanvas = (field: keyof LeanCanvasData, value: string) => {
    setLeanCanvas((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Business Plan Builder</h1>
          <div className="space-y-2 mt-4">
  <Label>Startup Idea</Label>

  <Textarea
    placeholder="Enter your startup idea..."
    value={startupIdea}
    onChange={(e) => setStartupIdea(e.target.value)}
    className="min-h-[80px]"
  />
</div>
          <p className="text-muted-foreground">
            Create comprehensive business plans with lean canvas and SWOT analysis.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={savePlan} disabled={isSaving} variant="outline">
            {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Plan
          </Button>
          <Button onClick={generateBusinessPlan} disabled={isGenerating}>
            {isGenerating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
            {isGenerating ? "Generating..." : "Generate with AI"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lean-canvas">Lean Canvas</TabsTrigger>
          <TabsTrigger value="swot">SWOT Analysis</TabsTrigger>
          <TabsTrigger value="executive-summary">Executive Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="lean-canvas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Lean Canvas
              </CardTitle>
              <CardDescription>
                A one-page business model that helps you deconstruct your idea into its key assumptions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="problem" className="text-sm font-semibold text-red-600">
                      1. Problem
                    </Label>
                    <Textarea
                      id="problem"
                      placeholder="Top 3 problems you're solving..."
                      value={leanCanvas.problem}
                      onChange={(e) => updateLeanCanvas("problem", e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer-segments" className="text-sm font-semibold text-blue-600">
                      4. Customer Segments
                    </Label>
                    <Textarea
                      id="customer-segments"
                      placeholder="Target customers and users..."
                      value={leanCanvas.customerSegments}
                      onChange={(e) => updateLeanCanvas("customerSegments", e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>
                </div>

                {/* Middle Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="solution" className="text-sm font-semibold text-green-600">
                      2. Solution
                    </Label>
                    <Textarea
                      id="solution"
                      placeholder="Top 3 features that solve the problems..."
                      value={leanCanvas.solution}
                      onChange={(e) => updateLeanCanvas("solution", e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unique-value-proposition" className="text-sm font-semibold text-purple-600">
                      3. Unique Value Proposition
                    </Label>
                    <Textarea
                      id="unique-value-proposition"
                      placeholder="Single, clear, compelling message..."
                      value={leanCanvas.uniqueValueProposition}
                      onChange={(e) => updateLeanCanvas("uniqueValueProposition", e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unfair-advantage" className="text-sm font-semibold text-orange-600">
                      9. Unfair Advantage
                    </Label>
                    <Textarea
                      id="unfair-advantage"
                      placeholder="Something that can't be easily copied..."
                      value={leanCanvas.unfairAdvantage}
                      onChange={(e) => updateLeanCanvas("unfairAdvantage", e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="key-metrics" className="text-sm font-semibold text-indigo-600">
                      5. Key Metrics
                    </Label>
                    <Textarea
                      id="key-metrics"
                      placeholder="Key numbers that tell you how your business is doing..."
                      value={leanCanvas.keyMetrics}
                      onChange={(e) => updateLeanCanvas("keyMetrics", e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="channels" className="text-sm font-semibold text-teal-600">
                      6. Channels
                    </Label>
                    <Textarea
                      id="channels"
                      placeholder="Path to customers..."
                      value={leanCanvas.channels}
                      onChange={(e) => updateLeanCanvas("channels", e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost-structure" className="text-sm font-semibold text-red-600">
                    7. Cost Structure
                  </Label>
                  <Textarea
                    id="cost-structure"
                    placeholder="Customer acquisition costs, distribution costs, hosting, people, etc..."
                    value={leanCanvas.costStructure}
                    onChange={(e) => updateLeanCanvas("costStructure", e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revenue-streams" className="text-sm font-semibold text-green-600">
                    8. Revenue Streams
                  </Label>
                  <Textarea
                    id="revenue-streams"
                    placeholder="Revenue model, life time value, revenue, gross margin..."
                    value={leanCanvas.revenueStreams}
                    onChange={(e) => updateLeanCanvas("revenueStreams", e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="swot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                SWOT Analysis
              </CardTitle>
              <CardDescription>
                Analyze your startup's Strengths, Weaknesses, Opportunities, and Threats.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-5 h-5" />
                      Strengths
                    </CardTitle>
                    <CardDescription>Internal positive factors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {swot.strengths.map((strength, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-white rounded border">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Weaknesses */}
                <Card className="border-red-200 bg-red-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                      <AlertTriangle className="w-5 h-5" />
                      Weaknesses
                    </CardTitle>
                    <CardDescription>Internal negative factors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {swot.weaknesses.map((weakness, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-white rounded border">
                          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{weakness}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Opportunities */}
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                      <TrendingUp className="w-5 h-5" />
                      Opportunities
                    </CardTitle>
                    <CardDescription>External positive factors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {swot.opportunities.map((opportunity, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-white rounded border">
                          <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{opportunity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Threats */}
                <Card className="border-yellow-200 bg-yellow-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-yellow-700">
                      <AlertTriangle className="w-5 h-5" />
                      Threats
                    </CardTitle>
                    <CardDescription>External negative factors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {swot.threats.map((threat, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-white rounded border">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{threat}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executive-summary" className="space-y-4">

<Card>

<CardHeader>

<CardTitle className="flex items-center gap-2">
<FileText className="w-5 h-5 text-primary" />
Executive Summary
</CardTitle>

<CardDescription>
A concise overview of your business plan for investors and stakeholders.
</CardDescription>

</CardHeader>

<CardContent className="space-y-6">

{executiveSummary ? (

<div className="prose max-w-none">

<h3 className="text-lg font-semibold mb-3">Business Overview</h3>
<p className="text-muted-foreground mb-4">
{executiveSummary.businessOverview}
</p>

<h3 className="text-lg font-semibold mb-3">Market Opportunity</h3>
<p className="text-muted-foreground mb-4">
{executiveSummary.marketOpportunity}
</p>

<h3 className="text-lg font-semibold mb-3">Competitive Advantage</h3>
<p className="text-muted-foreground mb-4">
{executiveSummary.competitiveAdvantage}
</p>

<h3 className="text-lg font-semibold mb-3">Financial Projections</h3>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

<Card>
<CardContent className="pt-4">
<div className="text-center">
<p className="text-2xl font-bold text-primary">
{executiveSummary.financialProjections.year1}
</p>
<p className="text-sm text-muted-foreground">Year 1 Revenue</p>
</div>
</CardContent>
</Card>

<Card>
<CardContent className="pt-4">
<div className="text-center">
<p className="text-2xl font-bold text-primary">
{executiveSummary.financialProjections.year2}
</p>
<p className="text-sm text-muted-foreground">Year 2 Revenue</p>
</div>
</CardContent>
</Card>

<Card>
<CardContent className="pt-4">
<div className="text-center">
<p className="text-2xl font-bold text-primary">
{executiveSummary.financialProjections.year3}
</p>
<p className="text-sm text-muted-foreground">Year 3 Revenue</p>
</div>
</CardContent>
</Card>

</div>

<h3 className="text-lg font-semibold mb-3">Funding Requirements</h3>

<p className="text-muted-foreground mb-4">
{executiveSummary.fundingRequirements}
</p>

</div>

) : (

<p className="text-muted-foreground">
Generate a business plan to see the executive summary.
</p>

)}

<div className="flex gap-2">

<Button className="flex-1" onClick={exportPDF}>
<Download className="w-4 h-4 mr-2" />
Export as PDF
</Button>

<Button
variant="outline"
className="flex-1 bg-transparent"
onClick={createPitchDeck}
>
<FileText className="w-4 h-4 mr-2" />
Create Pitch Deck
</Button>

</div>

</CardContent>

</Card>

</TabsContent>
</Tabs>
</div>
)
}