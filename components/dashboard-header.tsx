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
import { getApiUrl, getBaseApiUrl } from "@/lib/api"

const pageNames: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Command Center",
    description: "Multi-agent startup orchestration and overview",
  },
  "/ideas": {
    title: "Idea Generator",
    description: "Generate and evaluate strategic venture opportunities",
  },
  "/market": {
    title: "Market Research",
    description: "Competitor intelligence, personas, and market sizing",
  },
  "/business-plan": {
    title: "Business Plan",
    description: "Lean canvas, SWOT analysis, and executive strategy",
  },
  "/financials": {
    title: "Financial Model",
    description: "Unit economics, cash runway, and revenue projections",
  },
  "/legal": {
    title: "Legal Documents",
    description: "Founders agreements, NDAs, and contract generation",
  },
  "/pitch-deck": {
    title: "Pitch Deck",
    description: "Investor presentation slides and narrative structure",
  },
  "/product": {
    title: "Product Development",
    description: "MVP feature scope, tech stack, and sprint planning",
  },
  "/marketing": {
    title: "Marketing Strategy",
    description: "Go-to-market channels, CAC, and acquisition loops",
  },
  "/funding": {
    title: "Funding Strategy",
    description: "Cap table, investor matching, and valuation models",
  },
  "/team": {
    title: "Team & Hiring",
    description: "Organizational design, role profiles, and compensation",
  },
  "/roadmap": {
    title: "Startup Roadmap",
    description: "Milestone execution, quarterly goals, and KPI tracking",
  },
  "/operations": {
    title: "Operations & Scaling",
    description: "Operating system, tools stack, and risk management",
  },
  "/chat": {
    title: "AI Co-Founder Chat",
    description: "Real-time strategic guidance and venture decision support",
  },
}

export function DashboardHeader() {
  const pathname = usePathname()
  const pageInfo = pageNames[pathname] || {
    title: "Dashboard",
    description: "Your startup command center",
  }

  const { project, updateProject, resetProject, exportProjectJson, importProjectJson, isHydrated } =
    useStartup()

  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking")
  const [activeBackendUrl, setActiveBackendUrl] = useState<string>("/api")
  const [modalOpen, setModalOpen] = useState(false)
  const [inputUrl, setInputUrl] = useState("")
  const [isTesting, setIsTesting] = useState(false)
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const checkBackend = async () => {
    try {
      const currentUrl = getBaseApiUrl()
      setActiveBackendUrl(currentUrl)

      // Increased timeout to 12s so Render cold-starts don't instantly show false offline
      const res = await fetch(getApiUrl("/health"), { signal: AbortSignal.timeout(12000) })
      if (res.ok) {
        setBackendStatus("online")
      } else {
        setBackendStatus("offline")
      }
    } catch {
      setBackendStatus("offline")
    }
  }

  useEffect(() => {
    checkBackend()
    if (typeof window !== "undefined") {
      setInputUrl(localStorage.getItem("ai_startup_custom_backend") || "")
    }
    const timer = setInterval(checkBackend, 30000)
    return () => clearInterval(timer)
  }, [])

  const handleTestAndConnect = async () => {
    setIsTesting(true)
    setDiagnosticResult(null)

    const targetUrl = inputUrl.trim().replace(/\/+$/, "")
    const healthEndpoint = targetUrl ? `${targetUrl}/health` : "/api/health"
    const groqTestEndpoint = targetUrl ? `${targetUrl}/test-groq` : "/api/health"

    try {
      const healthRes = await fetch(healthEndpoint, { signal: AbortSignal.timeout(15000) })
      if (!healthRes.ok) {
        throw new Error(`Endpoint returned HTTP ${healthRes.status}`)
      }
      const healthData = await healthRes.json()

      let groqData = null
      try {
        const groqRes = await fetch(groqTestEndpoint, { signal: AbortSignal.timeout(15000) })
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
        suggestion: "If using Render, it may be waking up from sleep (wait 40s) or check your Render URL.",
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
          {/* Storage & Backend Status */}
          <div className="hidden md:flex items-center gap-2">
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

      {/* Backend API Configuration & Diagnostics Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Server className="w-4 h-4 text-primary" /> Backend API & AI Diagnostics
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure where the frontend routes AI requests (Render FastAPI or built-in Vercel functions).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Active Backend URL</label>
                <Badge variant={backendStatus === "online" ? "default" : "secondary"} className="text-[10px]">
                  {backendStatus === "online" ? "Connected" : "Offline"}
                </Badge>
              </div>
              <Input
                placeholder="https://your-backend.onrender.com (or leave empty for /api)"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="text-xs h-9 font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Paste your live Render URL (e.g. <code className="text-[10px] bg-muted px-1 py-0.5 rounded">https://agentic-ai-startup-cofounder-backend.onrender.com</code>).
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
                  <span>{diagnosticResult.success ? "Connection Verified!" : "Connection Failed"}</span>
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
              Reset to Vercel AI
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
                className="text-xs"
              >
                Close
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
                    Testing...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Connect & Save
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
