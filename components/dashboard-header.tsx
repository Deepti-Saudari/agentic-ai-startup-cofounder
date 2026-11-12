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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useStartup } from "@/context/startup-context"
import { getApiUrl } from "@/lib/api"

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check backend health periodically
  useEffect(() => {
    let isMounted = true
    const checkBackend = async () => {
      try {
        const res = await fetch(getApiUrl("/health"), { signal: AbortSignal.timeout(3000) })
        if (res.ok && isMounted) {
          setBackendStatus("online")
        } else if (isMounted) {
          setBackendStatus("offline")
        }
      } catch {
        if (isMounted) setBackendStatus("offline")
      }
    }
    checkBackend()
    const timer = setInterval(checkBackend, 30000)
    return () => {
      isMounted = false
      clearInterval(timer)
    }
  }, [])

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

            {/* Backend Connectivity Status */}
            <Badge
              variant="outline"
              className="gap-1.5 text-[11px] font-normal border-border/80 bg-muted/30"
              title="FastAPI Backend Connectivity"
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
              <span className="capitalize">{backendStatus === "online" ? "API Live" : backendStatus}</span>
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

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-border/80">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    CF
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>
                <p className="text-xs font-medium text-foreground">AI Co-Founder Suite</p>
                <p className="text-[11px] text-muted-foreground font-normal truncate">
                  {project.startupName}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  const newName = prompt("Rename your startup:", project.startupName)
                  if (newName?.trim()) updateProject({ startupName: newName.trim() })
                }}
                className="text-xs cursor-pointer"
              >
                Rename Startup
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportProjectJson} className="text-xs cursor-pointer">
                Download Backup
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
