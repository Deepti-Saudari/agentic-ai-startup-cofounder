"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

export interface StartupProjectState {
  startupName: string
  startupIdea: string
  industry: string
  targetMarket: string
  skills: string
  interests: string
  experience: string
  
  // Stored outputs from agents
  ideas: any[]
  marketResearch: any | null
  businessPlan: any | null
  financialData: any | null
  pitchDeck: any | null
  productPlan: any | null
  marketingPlan: any | null
  fundingPlan: any | null
  teamPlan: any | null
  roadmap: any | null
  operationsPlan: any | null
  chatMessages: any[]
  legalDocuments: any[]
  
  // Metadata
  lastSavedAt: string | null
}

const DEFAULT_STATE: StartupProjectState = {
  startupName: "My Next Startup",
  startupIdea: "AI-powered automated workflow assistant for high-growth tech teams",
  industry: "B2B SaaS / Productivity",
  targetMarket: "Tech startups and remote teams",
  skills: "Product Design, Next.js, Python, AI APIs",
  interests: "Generative AI, Workflow Automation, Developer Tools",
  experience: "Tech Founder & Full Stack Engineer",
  
  ideas: [],
  marketResearch: null,
  businessPlan: null,
  financialData: null,
  pitchDeck: null,
  productPlan: null,
  marketingPlan: null,
  fundingPlan: null,
  teamPlan: null,
  roadmap: null,
  operationsPlan: null,
  chatMessages: [],
  legalDocuments: [],
  
  lastSavedAt: null,
}

const STORAGE_KEY = "startup_cofounder_project_v1"

interface StartupContextType {
  project: StartupProjectState
  updateProject: (updates: Partial<StartupProjectState>) => void
  resetProject: () => void
  exportProjectJson: () => void
  importProjectJson: (jsonData: string) => boolean
  isHydrated: boolean
}

const StartupContext = createContext<StartupContextType | undefined>(undefined)

export function StartupProvider({ children }: { children: React.ReactNode }) {
  const [project, setProject] = useState<StartupProjectState>(DEFAULT_STATE)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setProject(prev => ({
          ...prev,
          ...parsed,
        }))
      }
    } catch (e) {
      console.warn("Failed to load project from localStorage:", e)
    } finally {
      setIsHydrated(true)
    }
  }, [])

  // Auto-save changes to localStorage
  const updateProject = useCallback((updates: Partial<StartupProjectState>) => {
    setProject(prev => {
      const updated: StartupProjectState = {
        ...prev,
        ...updates,
        lastSavedAt: new Date().toISOString(),
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (err) {
        console.warn("Failed to save project to localStorage:", err)
      }
      return updated
    })
  }, [])

  // Reset to default
  const resetProject = useCallback(() => {
    if (confirm("Are you sure you want to reset all project data? This cannot be undone.")) {
      setProject({
        ...DEFAULT_STATE,
        lastSavedAt: new Date().toISOString(),
      })
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  // Export as downloadable JSON
  const exportProjectJson = useCallback(() => {
    const dataStr = JSON.stringify(project, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${project.startupName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-workspace.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [project])

  // Import from JSON string
  const importProjectJson = useCallback((jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData)
      if (typeof parsed !== "object" || parsed === null) return false
      const updated = {
        ...DEFAULT_STATE,
        ...parsed,
        lastSavedAt: new Date().toISOString(),
      }
      setProject(updated)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return true
    } catch (e) {
      console.error("Invalid JSON file:", e)
      return false
    }
  }, [])

  return (
    <StartupContext.Provider
      value={{
        project,
        updateProject,
        resetProject,
        exportProjectJson,
        importProjectJson,
        isHydrated,
      }}
    >
      {children}
    </StartupContext.Provider>
  )
}

export function useStartup() {
  const context = useContext(StartupContext)
  if (!context) {
    throw new Error("useStartup must be used within a <StartupProvider />")
  }
  return context
}
