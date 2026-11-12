"use client"

import { useState, useEffect } from "react"
import { callAPI } from "@/lib/api"
import { useStartup } from "@/context/startup-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  TrendingUp,
  Users,
  Target,
  Search,
  BarChart3,
  Globe,
  Star,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react"

interface Competitor {
  name: string
  website: string
  description: string
  marketShare: number
  funding: string
  strengths: string[]
  weaknesses: string[]
  pricing: string
  threatLevel: "Low" | "Medium" | "High"
}

interface CustomerPersona {
  name: string
  age: string
  occupation: string
  income: string
  painPoints: string[]
  goals: string[]
  channels: string[]
  buyingBehavior: string
}

interface MarketTrend {
  trend: string
  impact: "Positive" | "Negative" | "Neutral"
  description: string
  timeframe: string
  confidence: number
}

const sampleCompetitors: Competitor[] = [
  {
    name: "TechFlow Solutions",
    website: "techflow.com",
    description: "AI-powered workflow automation platform for enterprises",
    marketShare: 25,
    funding: "$50M Series B",
    strengths: ["Strong enterprise sales", "Robust integrations", "Proven track record"],
    weaknesses: ["High pricing", "Complex setup", "Limited SMB focus"],
    pricing: "$500-2000/month",
    threatLevel: "High",
  },
  {
    name: "FlowMaster",
    website: "flowmaster.io",
    description: "Simple workflow automation for small businesses",
    marketShare: 15,
    funding: "$8M Series A",
    strengths: ["User-friendly interface", "Affordable pricing", "Good customer support"],
    weaknesses: ["Limited features", "Scalability issues", "Small team"],
    pricing: "$29-99/month",
    threatLevel: "Medium",
  },
  {
    name: "AutoPilot Pro",
    website: "autopilotpro.com",
    description: "No-code automation platform with AI capabilities",
    marketShare: 12,
    funding: "$15M Seed",
    strengths: ["No-code approach", "AI features", "Growing community"],
    weaknesses: ["New to market", "Limited integrations", "Unproven at scale"],
    pricing: "$99-499/month",
    threatLevel: "Medium",
  },
]

const samplePersonas: CustomerPersona[] = [
  {
    name: "Sarah - Operations Manager",
    age: "32-45",
    occupation: "Operations Manager at mid-size company",
    income: "$70K-90K",
    painPoints: [
      "Manual processes are time-consuming",
      "Difficulty tracking team productivity",
      "Budget constraints for new tools",
    ],
    goals: ["Increase team efficiency", "Reduce operational costs", "Improve reporting"],
    channels: ["LinkedIn", "Industry blogs", "Webinars", "Peer recommendations"],
    buyingBehavior: "Research-heavy, needs ROI justification, involves team in decision",
  },
  {
    name: "Mike - Tech Startup Founder",
    age: "28-38",
    occupation: "Startup Founder/CTO",
    income: "$80K-120K",
    painPoints: ["Limited resources and time", "Need to scale quickly", "Technical complexity of solutions"],
    goals: ["Rapid scaling", "Cost efficiency", "Technical flexibility"],
    channels: ["Product Hunt", "Tech Twitter", "Startup communities", "Y Combinator network"],
    buyingBehavior: "Quick decision maker, values innovation, price-sensitive",
  },
  {
    name: "Jennifer - Enterprise IT Director",
    age: "40-55",
    occupation: "IT Director at Fortune 500 company",
    income: "$120K-180K",
    painPoints: [
      "Security and compliance requirements",
      "Integration with legacy systems",
      "Vendor management complexity",
    ],
    goals: ["Enterprise-grade security", "Seamless integrations", "Vendor consolidation"],
    channels: ["Industry conferences", "Gartner reports", "Vendor presentations", "IT publications"],
    buyingBehavior: "Long sales cycles, committee decisions, requires extensive evaluation",
  },
]

const sampleTrends: MarketTrend[] = [
  {
    trend: "AI-First Automation",
    impact: "Positive",
    description: "Growing demand for AI-powered automation tools that can learn and adapt",
    timeframe: "Next 2-3 years",
    confidence: 85,
  },
  {
    trend: "No-Code/Low-Code Adoption",
    impact: "Positive",
    description: "Businesses prefer solutions that don't require technical expertise",
    timeframe: "Current trend",
    confidence: 90,
  },
  {
    trend: "Remote Work Optimization",
    impact: "Positive",
    description: "Increased focus on tools that support distributed teams",
    timeframe: "Ongoing",
    confidence: 80,
  },
  {
    trend: "Economic Uncertainty",
    impact: "Negative",
    description: "Companies may reduce spending on new software tools",
    timeframe: "Next 12-18 months",
    confidence: 70,
  },
  {
    trend: "Data Privacy Regulations",
    impact: "Neutral",
    description: "Stricter regulations may create barriers but also opportunities",
    timeframe: "Next 1-2 years",
    confidence: 75,
  },
]

export function MarketResearch() {
  const { project, updateProject } = useStartup()
  const [industry, setIndustry] = useState(project.industry || "")
  const [targetMarket, setTargetMarket] = useState(project.targetMarket || "")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasResults, setHasResults] = useState(Boolean(project.marketResearch))
  const [analysis, setAnalysis] = useState<any>(project.marketResearch)

  useEffect(() => {
    if (project.industry && !industry) setIndustry(project.industry)
    if (project.targetMarket && !targetMarket) setTargetMarket(project.targetMarket)
    if (project.marketResearch && !analysis) {
      setAnalysis(project.marketResearch)
      setHasResults(true)
    }
  }, [project.industry, project.targetMarket, project.marketResearch])

  const runAnalysis = async () => {
    setIsAnalyzing(true)

    try {
      const result = await callAPI("/market-research", {
        industry: industry,
        target_market: targetMarket,
      })

      if (result && result.analysis) {
        setAnalysis(result.analysis)
        setHasResults(true)
        updateProject({
          industry,
          targetMarket,
          marketResearch: result.analysis,
        })
      }
    } catch (error) {
      console.error("Market research error:", error)
    }

    setIsAnalyzing(false)
  }

  const getThreatColor = (level: string) => {
    switch (level) {
      case "Low":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "High":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "Positive":
        return "text-green-600"
      case "Negative":
        return "text-red-600"
      case "Neutral":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "Positive":
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case "Negative":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case "Neutral":
        return <BarChart3 className="w-4 h-4 text-yellow-600" />
      default:
        return <BarChart3 className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Market Research & Analysis</h1>
        <p className="text-muted-foreground">
          Analyze your market, competitors, and customer personas to validate your startup idea.
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Market Analysis Setup
          </CardTitle>
          <CardDescription>Define your industry and target market to get comprehensive analysis.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry/Sector</Label>
              <Input
                id="industry"
                placeholder="e.g., SaaS, FinTech, HealthTech, E-commerce..."
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-market">Target Market</Label>
              <Input
                id="target-market"
                placeholder="e.g., Small businesses, Enterprise, Consumers..."
                value={targetMarket}
                onChange={(e) => setTargetMarket(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={runAnalysis} disabled={isAnalyzing} className="w-full md:w-auto">
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Market...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                Run Market Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {hasResults && (
        <Tabs defaultValue="competitors" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
            <TabsTrigger value="personas">Customer Personas</TabsTrigger>
            <TabsTrigger value="trends">Market Trends</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="competitors" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Competitor Analysis</h2>
              <Badge variant="secondary">{analysis?.competitors?.length || 0} competitors found</Badge>
            </div>

            <div className="grid gap-4">
              {analysis?.competitors?.map((competitor: Competitor, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{competitor.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Globe className="w-4 h-4" />
                          {competitor.website}
                        </CardDescription>
                      </div>
                      <Badge className={getThreatColor(competitor.threatLevel)}>{competitor.threatLevel} Threat</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{competitor.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Market Share</h4>
                        <div className="flex items-center gap-2">
                          <Progress value={competitor.marketShare} className="flex-1" />
                          <span className="text-sm font-medium">{competitor.marketShare}%</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Funding</h4>
                        <p className="text-sm text-muted-foreground">{competitor.funding}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Pricing</h4>
                        <p className="text-sm font-semibold text-primary">{competitor.pricing}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-green-600 mb-2">Strengths</h4>
                        <ul className="space-y-1">
                          {competitor.strengths.map((strength: string, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-red-600 mb-2">Weaknesses</h4>
                        <ul className="space-y-1">
                          {competitor.weaknesses.map((weakness: string, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                              <AlertTriangle className="w-3 h-3 text-red-500" />
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="personas" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Customer Personas</h2>
              <Badge variant="secondary">{analysis?.personas?.length || 0} personas identified</Badge>
            </div>

            <div className="grid gap-4">
              {analysis?.personas?.map((persona: CustomerPersona, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      {persona.name}
                    </CardTitle>
                    <CardDescription>
                      {persona.age} • {persona.occupation} • {persona.income}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-red-600 mb-2">Pain Points</h4>
                        <ul className="space-y-1">
                          {persona.painPoints.map((point: string, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-green-600 mb-2">Goals</h4>
                        <ul className="space-y-1">
                          {persona.goals.map((goal: string, i: number) => (
  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
    <Target className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
    {goal}
  </li>
))}
                        </ul>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Preferred Channels</h4>
                        <div className="flex flex-wrap gap-1">
                          {persona.channels.map((channel: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Buying Behavior</h4>
                        <p className="text-sm text-muted-foreground">{persona.buyingBehavior}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Market Trends</h2>
              <Badge variant="secondary">{analysis?.trends?.length || 0} trends analyzed</Badge>
            </div>

            <div className="grid gap-4">
              {analysis?.trends?.map((trend: MarketTrend, index: number) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getImpactIcon(trend.impact)}
                        <h3 className="font-semibold">{trend.trend}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getImpactColor(trend.impact)}`}>{trend.impact}</span>
                        <Badge variant="outline" className="text-xs">
                          {trend.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{trend.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Timeframe: {trend.timeframe}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <h2 className="text-2xl font-semibold">Market Analysis Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Market Size</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">$2.8B</p>
                  <p className="text-xs text-muted-foreground">Total Addressable Market</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">Growth Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">23%</p>
                  <p className="text-xs text-muted-foreground">Annual growth (CAGR)</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold">Competition</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">Medium</p>
                  <p className="text-xs text-muted-foreground">Overall threat level</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Opportunity</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">High</p>
                  <p className="text-xs text-muted-foreground">Market opportunity score</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Key Insights & Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm">Strong Market Demand</h4>
                      <p className="text-sm text-muted-foreground">
                        Growing demand for AI-powered automation solutions with 23% annual growth rate.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm">Competitive Landscape</h4>
                      <p className="text-sm text-muted-foreground">
                        Medium competition with established players, but opportunities in SMB segment.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm">Target Opportunity</h4>
                      <p className="text-sm text-muted-foreground">
                        Focus on operations managers and startup founders who need affordable, easy-to-use solutions.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
