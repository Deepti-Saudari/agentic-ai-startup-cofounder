// @ts-nocheck
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Lightbulb, Sparkles, Brain, RefreshCw, CheckCircle, AlertCircle, 
  Download, Copy, Check, TrendingUp, Users, DollarSign, Clock,
  History, Network, Microscope, Scale, Globe, Target, Rocket,
  Zap, Shield, Award
} from "lucide-react"
import { API_BASE } from "@/lib/api"

const API_BASE_URL = API_BASE

const getSafeString = (value) => {
  if (!value) return ""
  if (typeof value === "string") return value
  if (typeof value === "object") {
    if (value.description) return value.description
    if (value.statement) return value.statement
    return JSON.stringify(value)
  }
  return String(value)
}

export function IdeaGenerator() {
  const [currentMode, setCurrentMode] = useState("generate")
  const [userSkills, setUserSkills] = useState("")
  const [userInterests, setUserInterests] = useState("")
  const [userExperience, setUserExperience] = useState("")
  const [userIdea, setUserIdea] = useState("")
  
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [ideaItems, setIdeaItems] = useState([])
  const [activeIdeaIndex, setActiveIdeaIndex] = useState(0)
  const [currentTab, setCurrentTab] = useState("analysis")
  const [isCopied, setIsCopied] = useState(false)
  const [errorText, setErrorText] = useState(null)

  const currentIdea = ideaItems[activeIdeaIndex]

  const generateIdeas = async () => {
    if (currentMode === "generate") {
      if (!userSkills.trim()) {
        alert("Please describe your skills and expertise")
        return
      }
      if (!userInterests.trim()) {
        alert("Please specify your industries of interest")
        return
      }
    }
    if (currentMode === "enhance" && !userIdea.trim()) {
      alert("Please describe your startup idea")
      return
    }

    setIsLoading(true)
    setErrorText(null)
    
    try {
      const requestData = currentMode === "generate" 
        ? { skills: userSkills, interests: userInterests, experience: userExperience, mode: "generate" }
        : { idea: userIdea, mode: "enhance" }

      const response = await fetch(`${API_BASE_URL}/generate-ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()
      
      if (responseData.error) {
        throw new Error(responseData.error)
      }

      setAnalysis(responseData.analysis)
      
      let ideasArray = []
      if (responseData.ideas && Array.isArray(responseData.ideas)) {
        ideasArray = responseData.ideas
      }

      setIdeaItems(ideasArray)
      setActiveIdeaIndex(0)
    } catch (err) {
      console.error("Error:", err)
      setErrorText(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  // Helper to render detailed content
  const renderDetailedContent = (content) => {
    if (!content) return <p className="text-sm text-muted-foreground">Information not available</p>
    if (typeof content === "string") return <p className="text-sm">{content}</p>
    if (typeof content === "object") {
      if (content.statement) return <p className="text-sm">{content.statement}</p>
      if (content.description) return <p className="text-sm">{content.description}</p>
      return <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(content, null, 2)}</pre>
    }
    return <p className="text-sm">{String(content)}</p>
  }

  const getOverallScore = () => {
    if (!currentIdea) return 75
    if (currentIdea.scoring?.overall) return currentIdea.scoring.overall
    return 75
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Strategic Idea Intelligence
          </h1>
          <p className="text-muted-foreground text-lg">
            {currentMode === "generate" 
              ? "Deep industry analysis + VC-grade startup opportunities"
              : "Transform your idea with comprehensive strategic analysis"}
          </p>
        </div>
      </div>

      {/* Input Section */}
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex gap-2 mb-6">
            <Button 
              variant={currentMode === "generate" ? "default" : "outline"} 
              onClick={() => setCurrentMode("generate")}
              className="flex-1"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate New Ideas
            </Button>
            <Button 
              variant={currentMode === "enhance" ? "default" : "outline"} 
              onClick={() => setCurrentMode("enhance")}
              className="flex-1"
            >
              <Brain className="w-4 h-4 mr-2" />
              Enhance Existing Idea
            </Button>
          </div>
          
          {currentMode === "generate" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Your Skills & Expertise</Label>
                <Textarea
                  placeholder="e.g., Full-stack development, Product management, Growth marketing..."
                  value={userSkills}
                  onChange={(e) => setUserSkills(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Industries of Interest</Label>
                <Textarea
                  placeholder="e.g., Climate tech, Healthcare AI, Fintech, EdTech..."
                  value={userInterests}
                  onChange={(e) => setUserInterests(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Previous Experience</Label>
                <Input
                  placeholder="e.g., 5 years at Google, Founded 2 startups..."
                  value={userExperience}
                  onChange={(e) => setUserExperience(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Your Startup Idea</Label>
              <Textarea
                placeholder="Describe your idea in detail: What problem does it solve? Who is it for? What makes it unique?"
                value={userIdea}
                onChange={(e) => setUserIdea(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
          )}

          {errorText && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errorText}</p>
            </div>
          )}

          <Button 
            onClick={generateIdeas} 
            disabled={isLoading} 
            size="lg"
            className="w-full mt-6 h-12"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Industry & Generating Ideas...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                {currentMode === "generate" ? "Generate Strategic Analysis" : "Enhance My Idea"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {analysis && ideaItems.length > 0 && currentIdea && (
        <div className="space-y-6">
          {/* Analysis Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <History className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{analysis.industry?.history?.timeline?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Historical Milestones</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <Network className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{(analysis.ecosystem?.majorPlayers?.length || 0) + (analysis.ecosystem?.startups?.length || 0)}</p>
                <p className="text-xs text-muted-foreground">Active Players</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <Microscope className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{analysis.technology?.emerging?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Emerging Tech</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{analysis.problems?.problems?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Key Problems</p>
              </CardContent>
            </Card>
          </div>

          {/* Idea Selector */}
          <div className="flex flex-wrap gap-2">
            {ideaItems.map((idea, idx) => (
              <Button
                key={idx}
                variant={activeIdeaIndex === idx ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setActiveIdeaIndex(idx)}
              >
                {idea.title || `Idea ${idx + 1}`}
                {idea.scoring?.overall && (
                  <Badge variant="secondary" className="ml-2">{idea.scoring.overall}%</Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Main Tabs */}
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analysis">Industry Analysis</TabsTrigger>
              <TabsTrigger value="problems">Key Problems</TabsTrigger>
              <TabsTrigger value="startup">Startup Opportunity</TabsTrigger>
              <TabsTrigger value="scoring">Scoring & Strategy</TabsTrigger>
            </TabsList>

            {/* Industry Analysis Tab */}
            <TabsContent value="analysis" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Industry History & Evolution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{analysis.industry?.history?.evolution}</p>
                    <div className="space-y-2">
                      {(analysis.industry?.history?.timeline || []).map((event, i) => (
                        <div key={i} className="flex gap-2 text-sm border-b pb-2">
                          <Badge variant="outline" className="w-16">{event.year}</Badge>
                          <span>{event.event}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Past Startup Outcomes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(analysis.industry?.history?.pastStartups || []).map((startup, i) => (
                      <div key={i} className="p-3 border rounded mb-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{startup.name}</span>
                          <Badge variant="outline">{startup.outcome}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{startup.year}</p>
                        <p className="text-xs font-medium">Lessons:</p>
                        <ul className="list-disc list-inside text-xs">
                          {startup.lessons?.map((lesson, j) => <li key={j}>{lesson}</li>)}
                        </ul>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Technology Landscape</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-2">Emerging Technologies</p>
                        {(analysis.technology?.emerging || []).map((tech, i) => (
                          <div key={i} className="p-2 border rounded mb-2">
                            <span className="font-medium">{tech.name}</span>
                            <Badge variant="outline" className="ml-2">{tech.maturity}</Badge>
                            <p className="text-xs mt-1">Timeframe: {tech.timeframe}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Regulatory Environment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(analysis.regulation?.opportunities || []).map((opp, i) => (
                      <div key={i} className="p-3 border rounded mb-3">
                        <p className="font-medium text-sm">{opp.change}</p>
                        <p className="text-xs text-green-600">{opp.opportunity}</p>
                        <Badge variant="outline" className="mt-1">{opp.status}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Key Ecosystem Players</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Major Companies</p>
                        {(analysis.ecosystem?.majorPlayers || []).map((player, i) => (
                          <div key={i} className="p-2 border rounded mb-2">
                            <span className="font-medium">{player.name}</span>
                            <Badge variant="outline" className="ml-2">{player.type}</Badge>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Active Investors</p>
                        {(analysis.ecosystem?.investors || []).map((investor, i) => (
                          <div key={i} className="p-2 border rounded mb-2">
                            <span className="font-medium">{investor.name}</span>
                            <p className="text-xs text-muted-foreground">{investor.focus?.join(", ")}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Problems Tab */}
            <TabsContent value="problems" className="space-y-4">
              {(analysis.problems?.problems || []).map((problem, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl">{problem.title}</CardTitle>
                      <Badge className={
                        problem.painLevel === "critical" ? "bg-red-100 text-red-700" :
                        problem.painLevel === "high" ? "bg-orange-100 text-orange-700" :
                        "bg-yellow-100 text-yellow-700"
                      }>
                        {problem.painLevel} pain
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {renderDetailedContent(problem.description)}
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Affected Users</p>
                        <div className="flex flex-wrap gap-1">
                          {problem.affectedUsers?.map((user, i) => (
                            <Badge key={i} variant="outline">{user}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Current Solutions & Gaps</p>
                        {problem.currentSolutions?.map((sol, i) => (
                          <div key={i} className="text-sm mb-2">
                            <span className="font-medium">{sol.name}</span> by {sol.provider}
                            <p className="text-xs text-red-600">Gap: {sol.gap}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Market Evidence</p>
                      {problem.evidence?.map((ev, i) => (
                        <div key={i} className="p-2 bg-muted/30 rounded mb-2">
                          <p className="text-sm italic">"{ev.finding}"</p>
                          <p className="text-xs text-muted-foreground">- {ev.source}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Startup Tab - RICH DETAILED CONTENT */}
            <TabsContent value="startup" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{currentIdea.title}</CardTitle>
                  <CardDescription className="text-base">{currentIdea.tagline}</CardDescription>
                  <p className="text-muted-foreground mt-2">{currentIdea.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Problem & Solution */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-red-600 mb-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Problem
                      </h3>
                      {renderDetailedContent(currentIdea.problem)}
                      {currentIdea.problem?.severity && (
                        <div className="mt-2">
                          <Badge variant="outline">Severity: {currentIdea.problem.severity}</Badge>
                          <span className="text-xs text-muted-foreground ml-2">Frequency: {currentIdea.problem.frequency}</span>
                        </div>
                      )}
                      {currentIdea.problem?.whyNow && (
                        <p className="text-xs text-muted-foreground mt-2">Why now: {currentIdea.problem.whyNow}</p>
                      )}
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-green-600 mb-2 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Solution
                      </h3>
                      {renderDetailedContent(currentIdea.solution)}
                      {currentIdea.solution?.uniqueValue && (
                        <p className="text-sm mt-2 font-medium">Unique Value: {currentIdea.solution.uniqueValue}</p>
                      )}
                      {currentIdea.solution?.whyBetter && (
                        <p className="text-xs text-muted-foreground mt-1">Why better: {currentIdea.solution.whyBetter}</p>
                      )}
                    </div>
                  </div>

                  {/* Key Features */}
                  {currentIdea.solution?.keyFeatures && currentIdea.solution.keyFeatures.length > 0 && (
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Key Features</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {currentIdea.solution.keyFeatures.map((feature, i) => (
                          <li key={i} className="text-sm">{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Target Customers */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Target Customers</h3>
                    {currentIdea.targetCustomers && Array.isArray(currentIdea.targetCustomers) ? (
                      <div className="space-y-2">
                        {currentIdea.targetCustomers.map((customer, i) => (
                          <div key={i} className="p-2 bg-muted/30 rounded">
                            <p className="font-medium text-sm">{customer.segment || customer}</p>
                            {customer.description && <p className="text-xs text-muted-foreground">{customer.description}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm">{getSafeString(currentIdea.targetCustomers)}</p>
                    )}
                  </div>

                  {/* Market Opportunity */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Market Opportunity</h3>
                    {currentIdea.marketOpportunity && (
                      <div className="space-y-2">
                        <p className="text-sm"><span className="font-medium">Market Size:</span> {currentIdea.marketOpportunity.size}</p>
                        <p className="text-sm"><span className="font-medium">Growth:</span> {currentIdea.marketOpportunity.growth}</p>
                        <p className="text-sm"><span className="font-medium">Key Trend:</span> {currentIdea.marketOpportunity.trend}</p>
                        {currentIdea.marketOpportunity.drivers && (
                          <div>
                            <p className="text-sm font-medium">Growth Drivers:</p>
                            <ul className="list-disc list-inside text-sm">
                              {currentIdea.marketOpportunity.drivers.map((driver, i) => (
                                <li key={i}>{driver}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Technology Stack */}
                  {currentIdea.technologyStack && currentIdea.technologyStack.length > 0 && (
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Technology Stack</h3>
                      <div className="space-y-2">
                        {currentIdea.technologyStack.map((tech, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="text-sm">{typeof tech === 'object' ? tech.name : tech}</span>
                            {tech.purpose && <span className="text-xs text-muted-foreground">- {tech.purpose}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Business Model */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Business Model</h3>
                    {currentIdea.businessModel && (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium">Revenue Streams</p>
                          {currentIdea.businessModel.revenueStreams ? (
                            currentIdea.businessModel.revenueStreams.map((stream, i) => (
                              <div key={i} className="text-sm ml-4">
                                • {typeof stream === 'object' ? `${stream.source}: ${stream.description}` : stream}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm ml-4">{getSafeString(currentIdea.businessModel.revenueStreams)}</p>
                          )}
                        </div>
                        {currentIdea.businessModel.pricing && (
                          <div>
                            <p className="text-sm font-medium">Pricing Tiers</p>
                            <div className="grid md:grid-cols-3 gap-2 mt-2">
                              {currentIdea.businessModel.pricing.map((tier, i) => (
                                <div key={i} className="p-2 border rounded">
                                  <p className="font-medium text-sm">{tier.tier}</p>
                                  <p className="text-lg font-bold">{tier.price}</p>
                                  <ul className="text-xs list-disc list-inside">
                                    {tier.features?.map((f, j) => <li key={j}>{f}</li>)}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Competitive Landscape */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Competitive Landscape</h3>
                    {currentIdea.competitiveLandscape && (
                      <div className="space-y-3">
                        {currentIdea.competitiveLandscape.directCompetitors && (
                          <div>
                            <p className="text-sm font-medium">Direct Competitors</p>
                            <div className="grid md:grid-cols-2 gap-2 mt-1">
                              {currentIdea.competitiveLandscape.directCompetitors.map((comp, i) => (
                                <div key={i} className="p-2 border rounded">
                                  <p className="font-medium text-sm">{comp.name}</p>
                                  <p className="text-xs text-green-600">Strength: {comp.strength}</p>
                                  <p className="text-xs text-red-600">Weakness: {comp.weakness}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">Differentiation</p>
                          <p className="text-sm">{currentIdea.competitiveLandscape.differentiation}</p>
                        </div>
                        {currentIdea.competitiveLandscape.moat && (
                          <div>
                            <p className="text-sm font-medium">Competitive Moat</p>
                            <div className="flex flex-wrap gap-1">
                              {currentIdea.competitiveLandscape.moat.map((m, i) => (
                                <Badge key={i} className="bg-purple-100 text-purple-700">{m}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* MVP Roadmap */}
                  {currentIdea.mvpRoadmap && currentIdea.mvpRoadmap.length > 0 && (
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">MVP Roadmap</h3>
                      <div className="space-y-3">
                        {currentIdea.mvpRoadmap.map((phase, i) => (
                          <div key={i} className="relative pl-6 pb-3 border-l-2 border-primary/30 last:pb-0">
                            <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-primary" />
                            <p className="font-medium text-sm">{phase.phase} ({phase.duration})</p>
                            <ul className="list-disc list-inside text-xs mt-1">
                              {phase.features?.map((f, j) => <li key={j}>{f}</li>)}
                            </ul>
                            {phase.successMetrics && (
                              <div className="mt-1">
                                <p className="text-xs font-medium">Success Metrics:</p>
                                <ul className="list-disc list-inside text-xs">
                                  {phase.successMetrics.map((m, j) => <li key={j}>{m}</li>)}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Risks */}
                  {currentIdea.keyRisks && currentIdea.keyRisks.length > 0 && (
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Key Risks & Mitigations</h3>
                      <div className="space-y-2">
                        {currentIdea.keyRisks.map((risk, i) => (
                          <div key={i} className="p-2 border rounded">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm">{risk.risk}</p>
                              <div className="flex gap-1">
                                <Badge variant="outline" className={
                                  risk.probability === "High" ? "bg-red-100" :
                                  risk.probability === "Medium" ? "bg-yellow-100" :
                                  "bg-green-100"
                                }>
                                  {risk.probability}
                                </Badge>
                                <Badge variant="outline" className={
                                  risk.impact === "High" ? "bg-red-100" :
                                  risk.impact === "Medium" ? "bg-yellow-100" :
                                  "bg-green-100"
                                }>
                                  {risk.impact}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Mitigation: {risk.mitigation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Exit Opportunities */}
                  {currentIdea.exitOpportunities && currentIdea.exitOpportunities.length > 0 && (
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Exit Opportunities</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {currentIdea.exitOpportunities.map((exit, i) => (
                          <div key={i} className="p-3 border rounded">
                            <Badge variant="outline" className="mb-2">{exit.type}</Badge>
                            <p className="text-sm font-medium">Potential Buyers:</p>
                            <p className="text-xs">{exit.potentialBuyers?.join(", ")}</p>
                            <p className="text-sm mt-2">Valuation: {exit.valuation}</p>
                            <p className="text-xs text-muted-foreground">Timeline: {exit.timeline}</p>
                            {exit.rationale && <p className="text-xs mt-1">{exit.rationale}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Scoring Tab */}
            <TabsContent value="scoring" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Investment Thesis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(currentIdea.scoring || {}).map(([key, value]) => {
                      if (key === "overall") return null
                      return (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="text-lg font-bold">{value.score}%</span>
                          </div>
                          <Progress value={value.score} className="h-2" />
                          <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                            {value.reasoning}
                          </p>
                        </div>
                      )
                    })}
                    
                    <div className="mt-6 pt-4 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-lg">Overall Score</span>
                        <span className="text-3xl font-bold text-primary">{currentIdea.scoring?.overall || 0}%</span>
                      </div>
                      <Progress value={currentIdea.scoring?.overall || 0} className="h-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Strategic Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(currentIdea.strategicRecommendations || []).map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 border rounded">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                          {i + 1}
                        </div>
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Export Button */}
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(JSON.stringify(currentIdea, null, 2))}>
              {isCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {isCopied ? "Copied!" : "Export Analysis"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}