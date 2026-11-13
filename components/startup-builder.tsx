"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Rocket,
  Sparkles,
  TrendingUp,
  FileText,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Zap,
} from "lucide-react"
import { apiFetch } from "@/lib/api"
import { useStartup } from "@/context/startup-context"

export default function StartupBuilder() {
  const { project, updateProject } = useStartup()

  const [skills, setSkills] = useState(project.skills || "AI, Next.js, Python, Automation")
  const [interests, setInterests] = useState(project.interests || "B2B SaaS, Healthcare, Workflow tools")
  const [experience, setExperience] = useState(project.experience || "Senior Developer & Tech Founder")

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runStartupBuilder = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiFetch("/startup-builder", {
        method: "POST",
        body: JSON.stringify({
          skills,
          interests,
          experience,
        }),
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`)
      }

      const data = await response.json()

      if (data.startup) {
        setResult(data.startup)
        // Store generated data into unified startup context
        updateProject({
          skills,
          interests,
          experience,
          startupIdea: data.startup.selected_idea || project.startupIdea,
          marketResearch: data.startup.market_research || project.marketResearch,
          businessPlan: data.startup.business_plan || project.businessPlan,
        })
      } else if (data.error) {
        setError(data.error)
      }
    } catch (err: any) {
      console.error("Startup Builder Error:", err)
      setError("Failed to run full startup builder. Ensure backend is running.")
    }

    setLoading(false)
  }

  return (
    <Card className="border border-border/80 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/40 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs gap-1">
                <Sparkles className="w-3 h-3" /> Multi-Agent Orchestration
              </Badge>
              <span className="text-xs text-muted-foreground">Automated Venture Blueprint</span>
            </div>
            <CardTitle className="text-xl font-bold tracking-tight">Full-Stack Startup Generator</CardTitle>
            <CardDescription className="text-xs">
              Synthesize 13 AI agents in one click: generate the optimal idea, market research, and business plan.
            </CardDescription>
          </div>
          <Button
            onClick={runStartupBuilder}
            disabled={loading}
            className="h-10 px-5 gap-2 font-semibold shadow-sm transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Orchestrating 13 Agents...</span>
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                <span>Launch Full Venture Plan</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Custom Founder Profile Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="founder-skills" className="text-xs font-semibold text-foreground">
              Core Skills & Strengths
            </Label>
            <Input
              id="founder-skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. AI Engineering, Sales, Product"
              className="h-9 text-xs bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="founder-interests" className="text-xs font-semibold text-foreground">
              Target Industries / Interests
            </Label>
            <Input
              id="founder-interests"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. Fintech, Healthcare, Robotics"
              className="h-9 text-xs bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="founder-experience" className="text-xs font-semibold text-foreground">
              Background & Experience
            </Label>
            <Input
              id="founder-experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g. 5+ years in Enterprise B2B"
              className="h-9 text-xs bg-background"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
            {error}
          </div>
        )}

        {/* Results Presentation */}
        {result && (
          <div className="space-y-4 pt-2">
            {/* Top Selected Idea Card */}
            <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
              <div className="flex items-center justify-between">
                <Badge className="bg-primary text-primary-foreground text-xs gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> High-Conviction Opportunity
                </Badge>
                <Link href="/ideas" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
                  Explore More Ideas <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <h3 className="text-lg font-bold text-foreground">
                {result.selected_idea || "Autonomous Operations Platform"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Identified as your top market opportunity based on founder skill-market synergy and defensibility.
              </p>
            </div>

            {/* Structured Tabs for Research & Business Plan */}
            <Tabs defaultValue="market" className="w-full">
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <TabsList className="h-9">
                  <TabsTrigger value="market" className="text-xs gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Market Intelligence
                  </TabsTrigger>
                  <TabsTrigger value="plan" className="text-xs gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Business Plan & Model
                  </TabsTrigger>
                  <TabsTrigger value="raw" className="text-xs gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Complete Payload
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Market Intelligence Tab */}
              <TabsContent value="market" className="pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border border-border/60 bg-muted/20">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-sm font-semibold flex items-center justify-between">
                        <span>Market Validation Overview</span>
                        <Link href="/market" className="text-xs text-primary hover:underline">
                          View Full Research &rarr;
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed">
                      {typeof result.market_research === "string" ? (
                        <div className="whitespace-pre-wrap">{result.market_research}</div>
                      ) : (
                        <div className="space-y-2">
                          <p>
                            Comprehensive competitor analysis and customer persona mappings have been created and saved to your workspace.
                          </p>
                          <div className="p-3 bg-background rounded-lg border text-[11px] font-mono overflow-auto max-h-48">
                            {JSON.stringify(result.market_research, null, 2)}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border border-border/60 bg-muted/20">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-sm font-semibold flex items-center justify-between">
                        <span>Strategic Positioning</span>
                        <Badge variant="outline" className="text-[10px]">Validated</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 text-xs space-y-3">
                      <div className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground">Defensible Moat</p>
                          <p className="text-muted-foreground text-[11px]">Specialized fine-tuned agentic models integrated with domain workflows.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground">Go-To-Market Vector</p>
                          <p className="text-muted-foreground text-[11px]">Product-led growth addressing high-friction manual operational bottlenecks.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Business Plan Tab */}
              <TabsContent value="plan" className="pt-4 space-y-4">
                <Card className="border border-border/60 bg-muted/20">
                  <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold">Executive Strategy & Lean Canvas</CardTitle>
                      <CardDescription className="text-xs">Generated business model elements</CardDescription>
                    </div>
                    <Link href="/business-plan" className="text-xs text-primary hover:underline">
                      Open Lean Canvas &rarr;
                    </Link>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 text-xs text-muted-foreground">
                    {typeof result.business_plan === "string" ? (
                      <div className="whitespace-pre-wrap">{result.business_plan}</div>
                    ) : (
                      <div className="p-3 bg-background rounded-lg border text-[11px] font-mono overflow-auto max-h-56">
                        {JSON.stringify(result.business_plan, null, 2)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Raw Payload Tab */}
              <TabsContent value="raw" className="pt-4">
                <div className="p-4 bg-muted/30 rounded-xl border text-[11px] font-mono overflow-auto max-h-64">
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
