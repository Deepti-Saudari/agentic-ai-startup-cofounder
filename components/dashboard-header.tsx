"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Bell,
  Settings,
  Search,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Database,
  Server,
  RefreshCw,
  ExternalLink,
  Check,
  XCircle,
  Key,
  Eye,
  EyeOff,
  Cpu,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useStartup } from "@/context/startup-context"
import { getApiUrl, getBaseApiUrl, getStoredGroqKey, setStoredGroqKey, apiFetch } from "@/lib/api"

const pageNames: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Command Center",
    description: "Multi-agent startup orchestration and overview",
  },
  "/ai-cofounder": {
    title: "AI Co-Founder",
    description: "24/7 strategic advisor, feedback, and execution guidance",
  },
  "/idea-generator": {
    title: "Idea Generator & Evaluator",
    description: "Deep venture opportunity discovery and 8-layer strategic scoring",
  },
  "/market-research": {
    title: "Market Research & Competitors",
    description: "Competitive intelligence, customer personas, and industry trends",
  },
  "/business-plan": {
    title: "Business Plan & Lean Canvas",
    description: "Live 9-block Lean Canvas, SWOT analysis, and printable PDF plan",
  },
  "/financial-model": {
    title: "Financial Model & Projections",
    description: "Dynamic unit economics, interactive runway, and 3-year ARR forecasts",
  },
  "/pitch-deck": {
    title: "Pitch Deck Narrative Architect",
    description: "VC-grade 9-slide investor storyline with slide-by-slide copy",
  },
  "/product-development": {
    title: "Product Roadmap & Tech Stack",
    description: "MVP feature prioritization, architecture choices, and development phases",
  },
  "/marketing-strategy": {
    title: "Marketing & GTM Strategy",
    description: "Multi-channel customer acquisition funnels and launch milestones",
  },
  "/funding-strategy": {
    title: "Funding Strategy & Investor Finder",
    description: "Capital requirements, valuation benchmarks, and matched active investors",
  },
  "/team-hiring": {
    title: "Team Structure & Hiring Plan",
    description: "Core founding team sequence, compensation, and equity guidelines",
  },
  "/roadmap": {
    title: "Execution Roadmap",
    description: "Timeline orchestration, milestone progress, and venture risk tracker",
  },
  "/operations": {
    title: "Operations & Governance",
    description: "Team workflows, cloud infrastructure, and operational KPIs",
  },
  "/startup-builder": {
    title: "One-Click Startup Builder",
    description: "Generate end-to-end launch plan in a single autonomous run",
  },
  "/legal-documents": {
    title: "Legal & Corporate Generator",
    description: "Founder agreements, NDAs, and corporate resolutions with PDF export",
  },
}

export function DashboardHeader() {
  const pathname = usePathname()
  const pageInfo = pageNames[pathname] || {
    title: "AI Startup Co-Founder",
    description: "Your autonomous venture building companion",
  }

  const { project, updateProject, resetProject, exportProjectJson, importProjectJson, isHydrated } =
    useStartup()

  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking")
  const [activeBackendUrl, setActiveBackendUrl] = useState<string>("/api")
  const [modalOpen, setModalOpen] = useState(false)
  const [inputUrl, setInputUrl] = useState("")
  const [isTesting, setIsTesting] = useState(false)
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null)

  // Groq API Key state
  const [groqKey, setGroqKey] = useState("")
  const [showGroqKey, setShowGroqKey] = useState(false)
  const [isTestingGroq, setIsTestingGroq] = useState(false)
  const [groqStatusMsg, setGroqStatusMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [serverGroqConfigured, setServerGroqConfigured] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasLiveGroq = Boolean(groqKey || serverGroqConfigured)

  const checkBackend = async () => {
    try {
      const currentUrl = getBaseApiUrl()
      setActiveBackendUrl(currentUrl)

      const stored = getStoredGroqKey()
      const headers: Record<string, string> = {}
      if (stored) headers["x-groq-api-key"] = stored

      const res = await fetch(getApiUrl("/health"), {
        signal: AbortSignal.timeout(12000),
        headers,
      })

      if (res.ok) {
        setBackendStatus("online")
        const data = await res.json().catch(() => ({}))
        if (data.groq_configured) {
          setServerGroqConfigured(true)
        }
      } else {
        setBackendStatus("offline")
      }
    } catch {
      setBackendStatus("offline")
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      setInputUrl(localStorage.getItem("ai_startup_custom_backend") || "")
      setGroqKey(getStoredGroqKey())
    }
    checkBackend()
    const timer = setInterval(checkBackend, 30000)
    return () => clearInterval(timer)
  }, [])

  const handleTestGroqKey = async () => {
    const key = groqKey.trim()
    if (!key) {
      setGroqStatusMsg({
        text: "Please enter your Groq API key before testing.",
        ok: false,
      })
      return
    }

    setIsTestingGroq(true)
    setGroqStatusMsg(null)

    try {
      const res = await apiFetch("/test-groq", {
        method: "POST",
        headers: { "x-groq-api-key": key },
        body: JSON.stringify({ key }),
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok && data.success) {
        setStoredGroqKey(key)
        setGroqStatusMsg({
          text: data.message || "Groq connection verified! Live AI responses are active.",
          ok: true,
        })
        setServerGroqConfigured(true)
      } else {
        setGroqStatusMsg({
          text: data.message || `Groq test failed (HTTP ${res.status}). Verify your key at console.groq.com.`,
          ok: false,
        })
      }
    } catch (err: any) {
      setGroqStatusMsg({
        text: err?.message || "Failed to reach test endpoint. Make sure your network or backend is online.",
        ok: false,
      })
    } finally {
      setIsTestingGroq(false)
    }
  }

  const handleSaveGroqKeyOnly = () => {
    const key = groqKey.trim()
    setStoredGroqKey(key)
    setGroqStatusMsg({
      text: key ? "Groq key saved in browser storage." : "Groq key cleared. Running in demo fallback mode.",
      ok: true,
    })
  }

  const handleClearGroqKey = () => {
    setStoredGroqKey("")
    setGroqKey("")
    setGroqStatusMsg({
      text: "Groq key removed. Operating in demo fallback mode.",
      ok: false,
    })
  }

  const handleTestAndConnect = async () => {
    setIsTesting(true)
    setDiagnosticResult(null)

    const targetUrl = inputUrl.trim().replace(/\/+$/, "")
    const healthEndpoint = targetUrl ? `${targetUrl}/health` : "/api/health"
    const groqTestEndpoint = targetUrl ? `${targetUrl}/test-groq` : "/api/test-groq"

    const headers: Record<string, string> = {}
    if (groqKey.trim()) {
      headers["x-groq-api-key"] = groqKey.trim()
    }

    try {
      const healthRes = await fetch(healthEndpoint, {
        signal: AbortSignal.timeout(15000),
        headers,
      })
      if (!healthRes.ok) {
        throw new Error(`Endpoint returned HTTP ${healthRes.status}`)
      }
      const healthData = await healthRes.json()

      let groqData = null
      try {
        const groqRes = await fetch(groqTestEndpoint, {
          signal: AbortSignal.timeout(15000),
          headers,
        })
        if (groqRes.ok) {
          groqData = await groqRes.json()
        }
      } catch {}

      setDiagnosticResult({
        success: true,
        health: healthData,
        groq: groqData,
        message: targetUrl ? `Successfully connected to ${targetUrl}` : "Connected to built-in Vercel AI routes",
      })

      if (typeof window !== "undefined") {
        if (targetUrl) {
          localStorage.setItem("ai_startup_custom_backend", targetUrl)
        } else {
          localStorage.removeItem("ai_startup_custom_backend")
        }
      }
      setActiveBackendUrl(targetUrl || "/api")
      setBackendStatus("online")
    } catch (err: any) {
      setDiagnosticResult({
        success: false,
        error: err?.message || "Failed to reach backend",
        suggestion: "If using Render, it may be waking up from sleep (wait ~40s) or check your Render URL.",
      })
      setBackendStatus("offline")
    } finally {
      setIsTesting(false)
    }
  }

  const handleResetToVercel = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ai_startup_custom_backend")
    }
    setInputUrl("")
    setActiveBackendUrl("/api")
    setDiagnosticResult(null)
    checkBackend()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        const success = importProjectJson(content)
        if (success) {
          alert("Project data imported successfully!")
        } else {
          alert("Invalid project file format.")
        }
      }
    }
    reader.readAsText(file)
  }

  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="flex items-center justify-between px-6 py-3.5 gap-4">
        {/* Page Title & Active Startup Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 min-w-0">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {pageInfo.title}
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {pageInfo.description}
            </p>
          </div>

          {/* Active Project Tag */}
          {isHydrated && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
              <Sparkles className="w-3 h-3 text-primary animate-pulse" />
              <span className="truncate max-w-[180px] font-semibold">{project.startupName}</span>
            </div>
          )}
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Mode & Backend Status Indicators */}
          <div className="hidden md:flex items-center gap-2">
            {/* Live Groq AI Indicator Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(true)}
              className={`h-7 px-2.5 gap-1.5 text-[11px] font-medium border ${
                hasLiveGroq
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
              }`}
              title="Click to configure or test your Groq API Key"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  hasLiveGroq
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                    : "bg-amber-500 animate-pulse"
                }`}
              />
              <Cpu className="w-3 h-3" />
              <span>{hasLiveGroq ? "Groq Live AI" : "AI: Demo Mode (Add Key)"}</span>
            </Button>

            {/* Backend Connectivity Status Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(true)}
              className="h-7 px-2.5 gap-1.5 text-[11px] font-normal border-border/80 bg-muted/30 hover:bg-muted/60"
              title="Click to configure or test Backend API connection"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === "online"
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                    : backendStatus === "checking"
                    ? "bg-amber-400 animate-pulse"
                    : "bg-red-400"
                }`}
              />
              <span className="font-medium">
                {backendStatus === "online" ? "API Live" : backendStatus === "checking" ? "Checking API..." : "API Offline"}
              </span>
              <Settings className="w-3 h-3 text-muted-foreground ml-0.5" />
            </Button>

            {/* Storage Auto-Save Indicator */}
            <Badge
              variant="outline"
              className="gap-1.5 text-[11px] font-normal border-border/80 bg-muted/30"
              title={
                project.lastSavedAt
                  ? `Saved locally at ${new Date(project.lastSavedAt).toLocaleTimeString()}`
                  : "Auto-saves locally in browser"
              }
            >
              <Database className="w-3 h-3 text-primary" />
              <span>Auto-saved</span>
            </Badge>
          </div>

          {/* Project Persistence Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs font-medium h-9 border-border/80 hover:bg-muted/60"
              >
                <Database className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">Project Data</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs font-semibold">Workspace Storage</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={exportProjectJson} className="gap-2 text-xs cursor-pointer">
                <Download className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Export Project JSON</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 text-xs cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Import Project JSON</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={resetProject}
                className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Workspace</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Hidden File Input for JSON restore */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Dark / Light Theme Toggle */}
          <ThemeToggle />

          {/* Founder Avatar */}
          <Avatar className="w-9 h-9 border border-border/80">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {project.startupName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Backend API Configuration & AI Diagnostics Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Cpu className="w-4 h-4 text-primary" /> AI Engine & Backend Diagnostics
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure your Groq API key for live dynamic AI generation and set your backend destination.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Section 1: Groq API Key Configuration */}
            <div className="p-3.5 rounded-lg border border-border/70 bg-muted/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-primary" /> Groq API Key (Live AI)
                </label>
                <Badge
                  variant={hasLiveGroq ? "default" : "secondary"}
                  className={`text-[10px] ${
                    hasLiveGroq ? "bg-emerald-600 text-white" : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {hasLiveGroq ? "Live AI Active" : "Demo Fallback Mode"}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showGroqKey ? "text" : "password"}
                    placeholder="gsk_..."
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    className="text-xs h-9 font-mono pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGroqKey(!showGroqKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    title={showGroqKey ? "Hide key" : "Show key"}
                  >
                    {showGroqKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleTestGroqKey}
                  disabled={isTestingGroq || !groqKey.trim()}
                  className="text-xs h-9 font-medium gap-1 shrink-0"
                >
                  {isTestingGroq ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Check className="w-3 h-3" />
                      Test & Save
                    </>
                  )}
                </Button>

                {groqKey && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleClearGroqKey}
                    className="text-xs h-9 text-muted-foreground hover:text-destructive px-2 shrink-0"
                    title="Remove key"
                  >
                    Clear
                  </Button>
                )}
              </div>

              {groqStatusMsg && (
                <div
                  className={`text-[11px] p-2 rounded border leading-tight ${
                    groqStatusMsg.ok
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                      : "bg-destructive/10 border-destructive/30 text-destructive"
                  }`}
                >
                  {groqStatusMsg.text}
                </div>
              )}

              <p className="text-[11px] text-muted-foreground flex items-center justify-between">
                <span>Your key is stored only in your browser and passed to Groq via encrypted headers.</span>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium inline-flex items-center gap-0.5 ml-1 shrink-0"
                >
                  Get free Groq key <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </p>
            </div>

            {/* Section 2: Backend URL Configuration */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-primary" /> Backend API URL (Optional)
                </label>
                <Badge variant={backendStatus === "online" ? "default" : "secondary"} className="text-[10px]">
                  {backendStatus === "online" ? "Online" : "Offline"}
                </Badge>
              </div>
              <Input
                placeholder="https://your-backend.onrender.com (or leave empty for built-in /api)"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="text-xs h-9 font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Leave empty to use built-in Next.js serverless routes, or paste your Render FastAPI service URL.
              </p>
            </div>

            {/* Test Results Output */}
            {diagnosticResult && (
              <div
                className={`p-3 rounded-lg text-xs space-y-1.5 border ${
                  diagnosticResult.success
                    ? "bg-emerald-500/10 border-emerald-500/30 text-foreground"
                    : "bg-destructive/10 border-destructive/30 text-destructive"
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold">
                  {diagnosticResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                  <span>{diagnosticResult.success ? "Backend Connection Verified!" : "Backend Connection Failed"}</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {diagnosticResult.message || diagnosticResult.error}
                </p>
                {diagnosticResult.groq && (
                  <div className="pt-1 text-[11px] border-t border-border/40 font-mono">
                    Groq Status: {diagnosticResult.groq.status || (diagnosticResult.groq.success ? "Connected" : "Check API Key")}
                  </div>
                )}
                {diagnosticResult.suggestion && (
                  <p className="text-[11px] text-muted-foreground">
                    Tip: {diagnosticResult.suggestion}
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="flex sm:justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetToVercel}
              className="text-xs"
            >
              Reset Backend to /api
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
                className="text-xs"
              >
                Done
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isTesting}
                onClick={handleTestAndConnect}
                className="text-xs gap-1.5 font-semibold"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Testing Backend...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Connect Backend
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
