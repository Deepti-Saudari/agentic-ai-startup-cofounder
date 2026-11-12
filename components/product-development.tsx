"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  RefreshCw, Code, Layers, Rocket, CheckCircle, 
  AlertCircle, Calendar, Clock, Users, DollarSign,
  Download, Share2, Star, GitBranch,
  Zap, Shield, TrendingUp, Target, Brain, Cpu,
  GanttChart, LineChart, Boxes, Network
} from "lucide-react"
import { API_BASE } from "@/lib/api"

interface ProductDevData {
  mvp_features: {
    name: string
    description: string
    priority: "Critical" | "High" | "Medium" | "Nice to have"
    complexity: "Low" | "Medium" | "High"
    estimated_days: number
    dependencies: string[]
  }[]
  
  tech_stack: {
    category: string
    technologies: {
      name: string
      purpose: string
      alternatives: string[]
      learning_curve: "Easy" | "Medium" | "Steep"
    }[]
  }[]
  
  development_phases: {
    phase: string
    duration: string
    start_date: string
    end_date: string
    tasks: {
      task: string
      completed: boolean
      assignee?: string
    }[]
    milestones: string[]
  }[]
  
  timeline: {
    milestone: string
    date: string
    quarter: string
    type: "Product" | "Technical" | "Business" | "Team"
    completed?: boolean
  }[]
  
  resources: {
    team_size: number
    roles: {
      role: string
      count: number
      skills: string[]
    }[]
    budget_estimate: string
    infrastructure: string[]
  }
  
  risks: {
    risk: string
    impact: "Low" | "Medium" | "High"
    probability: "Low" | "Medium" | "High"
    mitigation: string
  }[]
  
  metrics: {
    kpi: string
    target: string
    measurement: string
  }[]
}

export function ProductDevelopment() {
  const [startupIdea, setStartupIdea] = useState("")
  const [industry, setIndustry] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasPlan, setHasPlan] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [taskCompletion, setTaskCompletion] = useState<{[key: string]: boolean}>({})

  const [plan, setPlan] = useState<ProductDevData>({
    mvp_features: [],
    tech_stack: [],
    development_phases: [],
    timeline: [],
    resources: {
      team_size: 0,
      roles: [],
      budget_estimate: "",
      infrastructure: []
    },
    risks: [],
    metrics: []
  })

  const handleTaskToggle = (phaseIndex: number, taskIndex: number) => {
    const key = `${phaseIndex}-${taskIndex}`;
    setTaskCompletion(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    
    setPlan(prev => {
      const updated = {...prev};
      if (updated.development_phases[phaseIndex]?.tasks[taskIndex]) {
        updated.development_phases[phaseIndex].tasks[taskIndex].completed = !prev.development_phases[phaseIndex].tasks[taskIndex].completed;
      }
      return updated;
    });
  };

  const calculateProgress = (phaseIndex: number) => {
    if (!plan.development_phases || !plan.development_phases[phaseIndex]) return 0;
    const tasks = plan.development_phases[phaseIndex].tasks;
    if (!tasks || tasks.length === 0) return 0;
    
    let completedCount = 0;
    tasks.forEach((_, taskIndex) => {
      const key = `${phaseIndex}-${taskIndex}`;
      if (taskCompletion[key]) {
        completedCount++;
      }
    });
    
    return (completedCount / tasks.length) * 100;
  };

  const resetAllTasks = () => {
    setTaskCompletion({});
    
    setPlan(prev => {
      const updated = {...prev};
      updated.development_phases = updated.development_phases.map(phase => ({
        ...phase,
        tasks: phase.tasks.map(task => ({...task, completed: false}))
      }));
      return updated;
    });
  };

  const generatePlan = async () => {
    if (!startupIdea || !industry) {
      alert("Please enter both startup idea and industry");
      return;
    }

    setIsGenerating(true);
    setHasPlan(false);
    setError(null);
    setTaskCompletion({});

    try {
      const API_URL = API_BASE;
      const response = await fetch(`${API_URL}/product-development`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startup_idea: startupIdea,
          industry: industry,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate product plan");
      }

      const data = await response.json();
      
      if (data.product_plan) {
        if (data.product_plan.mvp_features && 
            Array.isArray(data.product_plan.mvp_features) && 
            data.product_plan.mvp_features.length > 0 &&
            typeof data.product_plan.mvp_features[0] === 'object') {
          setPlan(data.product_plan);
          setHasPlan(true);
        } else {
          transformSimplePlan(data.product_plan);
        }
      } else {
        throw new Error("Invalid response format");
      }
      
    } catch (error) {
      console.error("Error generating plan:", error);
      setError(error instanceof Error ? error.message : "Failed to generate product plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const transformSimplePlan = (simplePlan: any) => {
    const today = new Date();
    
    const mvpFeatures = simplePlan?.mvp_features || [];
    const techStack = simplePlan?.tech_stack || [];
    const devPhases = simplePlan?.development_phases || [];
    const milestones = simplePlan?.milestones || [];
    
    const allTechItems = techStack.map((t: string) => t?.toLowerCase() || "");
    
    const getTechForCategory = (keywords: string[], defaults: string[]) => {
      const matched = techStack.filter((t: string) => 
        keywords.some(keyword => t?.toLowerCase().includes(keyword))
      );
      
      if (matched.length > 0) {
        return matched.map((t: string) => ({
          name: t.split(":")[1]?.trim() || t,
          purpose: getPurposeForTech(t),
          alternatives: getAlternativesForTech(t),
          learning_curve: getLearningCurveForTech(t)
        }));
      }
      
      return defaults.map((name: string) => ({
        name,
        purpose: getPurposeForName(name),
        alternatives: getAlternativesForName(name),
        learning_curve: getLearningCurveForName(name)
      }));
    };

    const getPurposeForTech = (tech: string) => {
      const t = tech.toLowerCase();
      if (t.includes('react') || t.includes('vue') || t.includes('angular')) 
        return "Building interactive user interfaces";
      if (t.includes('node') || t.includes('python') || t.includes('fastapi')) 
        return "Server-side logic and API development";
      if (t.includes('postgres') || t.includes('mysql') || t.includes('mongodb')) 
        return "Data persistence and management";
      if (t.includes('docker') || t.includes('aws') || t.includes('cloud')) 
        return "Deployment, scaling, and infrastructure";
      return "Core technology for your application";
    };

    const getPurposeForName = (name: string) => {
      if (name === "React" || name === "Next.js") return "Building interactive user interfaces";
      if (name === "Node.js" || name === "FastAPI") return "Server-side logic and API development";
      if (name === "PostgreSQL") return "Data persistence and management";
      if (name === "Docker + AWS") return "Deployment, scaling, and infrastructure";
      return "Core technology for your application";
    };

    const getAlternativesForTech = (tech: string) => {
      const t = tech.toLowerCase();
      if (t.includes('react')) return ["Vue.js", "Angular", "Svelte"];
      if (t.includes('node')) return ["Python FastAPI", "Go", ".NET Core"];
      if (t.includes('python')) return ["Node.js", "Java Spring", "Ruby on Rails"];
      if (t.includes('postgres')) return ["MySQL", "MongoDB", "MariaDB"];
      if (t.includes('mongodb')) return ["PostgreSQL", "Firebase", "DynamoDB"];
      if (t.includes('docker')) return ["Kubernetes", "Podman", "Vagrant"];
      if (t.includes('aws')) return ["Google Cloud", "Azure", "DigitalOcean"];
      return ["Alternative 1", "Alternative 2", "Alternative 3"];
    };

    const getAlternativesForName = (name: string) => {
      if (name === "React") return ["Vue.js", "Angular", "Svelte"];
      if (name === "Next.js") return ["Gatsby", "Nuxt.js", "Remix"];
      if (name === "Node.js") return ["Python FastAPI", "Go", ".NET Core"];
      if (name === "FastAPI") return ["Node.js", "Flask", "Django"];
      if (name === "PostgreSQL") return ["MySQL", "MongoDB", "MariaDB"];
      if (name === "Docker + AWS") return ["Kubernetes", "Google Cloud", "Azure"];
      return ["Alternative 1", "Alternative 2", "Alternative 3"];
    };

    const getLearningCurveForTech = (tech: string) => {
      const t = tech.toLowerCase();
      if (t.includes('react') || t.includes('vue')) return "Medium";
      if (t.includes('angular')) return "Steep";
      if (t.includes('python') || t.includes('node')) return "Easy";
      if (t.includes('docker') || t.includes('kubernetes')) return "Steep";
      if (t.includes('aws')) return "Steep";
      if (t.includes('postgres') || t.includes('mysql')) return "Easy";
      return "Medium";
    };

    const getLearningCurveForName = (name: string) => {
      if (name === "React" || name === "Vue.js") return "Medium";
      if (name === "Angular") return "Steep";
      if (name === "Node.js" || name === "Python") return "Easy";
      if (name === "Docker + AWS") return "Steep";
      if (name === "PostgreSQL") return "Easy";
      return "Medium";
    };

    const getDefaultTechForIndustry = () => {
      const ind = industry.toLowerCase();
      
      if (ind.includes('ai') || ind.includes('ml') || ind.includes('machine learning')) {
        return {
          frontend: ["React", "TypeScript", "Tailwind CSS"],
          backend: ["Python", "FastAPI", "TensorFlow", "PyTorch"],
          database: ["PostgreSQL", "Redis", "Pinecone"],
          infrastructure: ["Docker", "AWS SageMaker", "Kubernetes"]
        };
      }
      
      if (ind.includes('fintech') || ind.includes('finance') || ind.includes('banking')) {
        return {
          frontend: ["React", "TypeScript", "Material-UI"],
          backend: ["Java Spring", "Python", "Node.js"],
          database: ["PostgreSQL", "Oracle", "Redis"],
          infrastructure: ["Docker", "AWS", "Kubernetes", "PCI Compliance tools"]
        };
      }
      
      if (ind.includes('health') || ind.includes('medical') || ind.includes('healthcare')) {
        return {
          frontend: ["React", "TypeScript", "Material-UI"],
          backend: ["Python", "FastAPI", "Node.js"],
          database: ["PostgreSQL", "MongoDB", "FHIR Server"],
          infrastructure: ["Docker", "AWS", "HIPAA compliant hosting"]
        };
      }
      
      return {
        frontend: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
        backend: ["Node.js", "Python", "FastAPI", "PostgreSQL"],
        database: ["PostgreSQL", "Redis", "MongoDB"],
        infrastructure: ["Docker", "AWS/GCP/Azure", "CI/CD Pipeline"]
      };
    };

    const getTeamSizeForIndustry = (industry: string) => {
      const ind = industry.toLowerCase();
      if (ind.includes('ai') || ind.includes('ml')) return 6;
      if (ind.includes('fintech')) return 7;
      if (ind.includes('health')) return 5;
      return 5;
    };

    const getRolesForIndustry = (industry: string) => {
      const ind = industry.toLowerCase();
      
      if (ind.includes('ai') || ind.includes('ml')) {
        return [
          { role: "Product Manager", count: 1, skills: ["AI Product Strategy", "Agile", "User Research"] },
          { role: "Frontend Developer", count: 1, skills: ["React", "TypeScript", "UI/UX"] },
          { role: "Backend Developer", count: 1, skills: ["Python", "APIs", "Microservices"] },
          { role: "AI/ML Engineer", count: 2, skills: ["Machine Learning", "TensorFlow", "Data Science"] },
          { role: "Data Engineer", count: 1, skills: ["Data Pipelines", "ETL", "Big Data"] }
        ];
      }
      
      if (ind.includes('fintech')) {
        return [
          { role: "Product Manager", count: 1, skills: ["FinTech", "Agile", "Compliance"] },
          { role: "Frontend Developer", count: 2, skills: ["React", "TypeScript", "Security"] },
          { role: "Backend Developer", count: 2, skills: ["Java/Node.js", "APIs", "Security"] },
          { role: "Security Engineer", count: 1, skills: ["Encryption", "Compliance", "Pen Testing"] },
          { role: "QA Engineer", count: 1, skills: ["Automated Testing", "Security Testing"] }
        ];
      }
      
      return [
        { role: "Product Manager", count: 1, skills: ["Product Strategy", "Agile", "User Research"] },
        { role: "Frontend Developer", count: 2, skills: ["React", "TypeScript", "UI/UX"] },
        { role: "Backend Developer", count: 1, skills: ["Node.js/Python", "APIs", "Databases"] },
        { role: "Full Stack Developer", count: 1, skills: ["React", "Node.js", "MongoDB"] }
      ];
    };

    const getBudgetForIndustry = (industry: string) => {
      const ind = industry.toLowerCase();
      if (ind.includes('ai') || ind.includes('ml')) return "$200,000 - $300,000 for MVP";
      if (ind.includes('fintech')) return "$250,000 - $400,000 for MVP (includes compliance)";
      if (ind.includes('health')) return "$180,000 - $250,000 for MVP";
      return "$150,000 - $200,000 for MVP";
    };

    const getInfrastructureForIndustry = (industry: string) => {
      const ind = industry.toLowerCase();
      
      if (ind.includes('ai') || ind.includes('ml')) {
        return ["GPU/TPU Resources", "Development Environment", "CI/CD Pipeline", "Model Registry", "ML Ops Tools"];
      }
      
      if (ind.includes('fintech')) {
        return ["Development Environment", "CI/CD Pipeline", "Cloud Services (AWS/Azure)", "Security Tools", "Compliance Monitoring"];
      }
      
      return ["Development Environment", "CI/CD Pipeline", "Cloud Services", "Monitoring Tools", "Testing Infrastructure"];
    };

    const getRisksForIndustry = (industry: string, idea: string) => {
      return [
        {
          risk: `Technical complexity of ${idea || 'core features'}`,
          impact: "High" as const,
          probability: "Medium" as const,
          mitigation: "Start with simple MVP, iterate based on feedback"
        },
        {
          risk: "Market adoption slower than expected",
          impact: "Medium" as const,
          probability: "Medium" as const,
          mitigation: "Early beta program with key users"
        },
        {
          risk: "Team skill gaps",
          impact: "Medium" as const,
          probability: "Low" as const,
          mitigation: "Training budget and mentorship program"
        }
      ];
    };

    const getMetricsForIndustry = (industry: string) => {
      return [
        { kpi: "Development Velocity", target: "Complete 80% of planned features", measurement: "Story points per sprint" },
        { kpi: "Code Quality", target: "90% test coverage", measurement: "Automated testing reports" },
        { kpi: "Time to Market", target: "MVP in 4 months", measurement: "Milestone completion dates" }
      ];
    };

    const defaultTech = getDefaultTechForIndustry();

    const comprehensivePlan: ProductDevData = {
      mvp_features: mvpFeatures.length > 0 ? mvpFeatures.map((f: string, i: number) => ({
        name: f || `Feature ${i+1}`,
        description: `Core feature for ${startupIdea || 'your startup'}`,
        priority: i < 2 ? "Critical" : i < 4 ? "High" : "Medium",
        complexity: i < 2 ? "High" : i < 4 ? "Medium" : "Low",
        estimated_days: i < 2 ? 14 : i < 4 ? 10 : 7,
        dependencies: i > 0 && mvpFeatures[i-1] ? [mvpFeatures[i-1]] : []
      })) : [
        {
          name: "User Authentication",
          description: "Secure login and user management",
          priority: "Critical",
          complexity: "Medium",
          estimated_days: 10,
          dependencies: []
        },
        {
          name: "Core Dashboard",
          description: "Main user interface",
          priority: "Critical",
          complexity: "High",
          estimated_days: 14,
          dependencies: ["User Authentication"]
        },
        {
          name: "Data Integration",
          description: "Connect to external data sources",
          priority: "High",
          complexity: "High",
          estimated_days: 12,
          dependencies: ["Core Dashboard"]
        }
      ],
      
      tech_stack: [
        {
          category: "Frontend",
          technologies: getTechForCategory(
            ["react", "vue", "angular", "frontend", "next.js", "ui", "typescript"],
            defaultTech.frontend
          )
        },
        {
          category: "Backend",
          technologies: getTechForCategory(
            ["backend", "api", "node", "python", "fastapi", "django", "flask", "spring", "go", "rust"],
            defaultTech.backend
          )
        },
        {
          category: "Database",
          technologies: getTechForCategory(
            ["database", "postgres", "mysql", "mongodb", "redis", "sql", "nosql", "db"],
            defaultTech.database
          )
        },
        {
          category: "Infrastructure",
          technologies: getTechForCategory(
            ["docker", "kubernetes", "aws", "azure", "gcp", "cloud", "devops", "ci/cd", "infrastructure"],
            defaultTech.infrastructure
          )
        }
      ],
      
      development_phases: devPhases.length > 0 ? devPhases.map((phase: string, i: number) => ({
        phase: phase || `Phase ${i+1}`,
        duration: `${i === 0 ? 4 : i === 1 ? 6 : i === 2 ? 8 : 4} weeks`,
        start_date: new Date(today.getTime() + (i * 30 * 24 * 60 * 60 * 1000)).toLocaleDateString(),
        end_date: new Date(today.getTime() + ((i + 1) * 30 * 24 * 60 * 60 * 1000)).toLocaleDateString(),
        tasks: [
          { task: `Planning and requirements for ${phase || `Phase ${i+1}`}`, completed: i === 0 },
          { task: `Development sprint 1`, completed: false },
          { task: `Testing and validation`, completed: false },
          { task: `Deployment preparation`, completed: false }
        ],
        milestones: [`Complete ${phase || `Phase ${i+1}`}`, `Review and sign-off`]
      })) : [
        {
          phase: "Discovery & Planning",
          duration: "4 weeks",
          start_date: new Date().toLocaleDateString(),
          end_date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          tasks: [
            { task: "Market research and validation", completed: false },
            { task: "User interviews", completed: false },
            { task: "Technical architecture design", completed: false },
            { task: "MVP feature prioritization", completed: false }
          ],
          milestones: ["Product requirements doc", "Technical specifications"]
        },
        {
          phase: "MVP Development",
          duration: "8 weeks",
          start_date: new Date(today.getTime() + 31 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          end_date: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          tasks: [
            { task: "Core feature development", completed: false },
            { task: "UI/UX implementation", completed: false },
            { task: "API development", completed: false },
            { task: "Database setup", completed: false }
          ],
          milestones: ["Working MVP", "Internal testing complete"]
        }
      ],
      
      timeline: milestones.length > 0 ? milestones.map((m: string, i: number) => ({
        milestone: m || `Milestone ${i+1}`,
        date: new Date(today.getTime() + (i * 45 * 24 * 60 * 60 * 1000)).toLocaleDateString(),
        quarter: `Q${Math.floor(i/3) + 1} 2024`,
        type: i % 2 === 0 ? "Product" : "Technical",
        completed: i === 0
      })) : [
        {
          milestone: "MVP Launch",
          date: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          quarter: "Q2 2024",
          type: "Product",
          completed: false
        },
        {
          milestone: "Beta Testing",
          date: new Date(today.getTime() + 120 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          quarter: "Q2 2024",
          type: "Product",
          completed: false
        },
        {
          milestone: "Public Release",
          date: new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          quarter: "Q3 2024",
          type: "Business",
          completed: false
        }
      ],
      
      resources: {
        team_size: getTeamSizeForIndustry(industry),
        roles: getRolesForIndustry(industry),
        budget_estimate: getBudgetForIndustry(industry),
        infrastructure: getInfrastructureForIndustry(industry)
      },
      
      risks: getRisksForIndustry(industry, startupIdea),
      
      metrics: getMetricsForIndustry(industry)
    };
    
    setPlan(comprehensivePlan);
    setHasPlan(true);
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "Critical": return "bg-red-100 text-red-800 border-red-200"
      case "High": return "bg-orange-100 text-orange-800 border-orange-200"
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default: return "bg-green-100 text-green-800 border-green-200"
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch(complexity) {
      case "High": return "bg-red-100 text-red-800"
      case "Medium": return "bg-yellow-100 text-yellow-800"
      case "Low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getRiskColor = (level: string) => {
    switch(level) {
      case "High": return "text-red-600"
      case "Medium": return "text-yellow-600"
      case "Low": return "text-green-600"
      default: return "text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Product Development Planner</h1>
          <p className="text-muted-foreground">
            Comprehensive product planning with timeline, resources, and risk management
          </p>
        </div>
        {hasPlan && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetAllTasks}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Progress
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        )}
      </div>

      <Card className="border-2 border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Brain className="w-6 h-6 text-primary" />
            AI-Powered Product Planning
          </CardTitle>
          <CardDescription>
            Our AI will generate a comprehensive product roadmap with MVP features, tech stack, timeline, and risk assessment
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="idea" className="text-sm font-medium">Startup Idea</Label>
              <Input
                id="idea"
                placeholder="e.g., AI-powered code review platform for enterprise teams"
                value={startupIdea}
                onChange={(e) => setStartupIdea(e.target.value)}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">Be specific about your product concept</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry" className="text-sm font-medium">Target Industry</Label>
              <Input
                id="industry"
                placeholder="e.g., Developer Tools, Healthcare, Fintech"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">Select the primary industry</p>
            </div>
          </div>

          <Button 
            onClick={generatePlan} 
            disabled={isGenerating} 
            size="lg"
            className="mt-6 w-full md:w-auto"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing & Generating Comprehensive Plan...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate AI Product Plan
              </>
            )}
          </Button>

          {error && (
            <div className="flex items-center gap-2 text-red-500 mt-4 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {hasPlan && (
        <div className="space-y-6">
          {/* Overall Progress Summary */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Project Progress</p>
                    <p className="text-2xl font-bold">
                      {Math.round(
                        plan.development_phases?.reduce((acc, phase, idx) => 
                          acc + calculateProgress(idx), 0
                        ) / (plan.development_phases?.length || 1)
                      )}%
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Tasks Completed</p>
                    <p className="text-xl font-semibold">
                      {Object.values(taskCompletion).filter(Boolean).length} / {
                        plan.development_phases?.reduce((acc, phase) => 
                          acc + (phase.tasks?.length || 0), 0
                        )
                      }
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Phases</p>
                    <p className="text-xl font-semibold">
                      {plan.development_phases?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Features</p>
                    <p className="text-2xl font-bold">{plan.mvp_features?.length || 0}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Layers className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tech Stack</p>
                    <p className="text-2xl font-bold">
                      {plan.tech_stack?.reduce((acc, cat) => 
                        acc + (cat.technologies?.length || 0), 0) || 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Code className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Team Size</p>
                    <p className="text-2xl font-bold">{plan.resources?.team_size || 0}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Timeline</p>
                    <p className="text-2xl font-bold">{plan.development_phases?.length || 0} phases</p>
                  </div>
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Features
              </TabsTrigger>
              <TabsTrigger value="tech" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Tech Stack
              </TabsTrigger>
              <TabsTrigger value="roadmap" className="flex items-center gap-2">
                <GanttChart className="w-4 h-4" />
                Roadmap
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Resources
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Product Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {plan.timeline?.map((item, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <div className={`w-2 h-2 mt-2 rounded-full ${item.completed ? 'bg-green-500' : 'bg-blue-500'}`} />
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <p className="font-medium">{item.milestone}</p>
                              <Badge variant="outline">{item.quarter}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Target: {item.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.risks?.map((risk, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{risk.risk}</p>
                          <div className="flex gap-2">
                            <Badge className={getRiskColor(risk.impact)} variant="outline">
                              {risk.impact} Impact
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{risk.mitigation}</p>
                        {i < plan.risks.length - 1 && <Separator className="mt-2" />}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="w-5 h-5 text-primary" />
                      Key Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.metrics?.map((metric, i) => (
                      <div key={i} className="space-y-1">
                        <p className="font-medium text-sm">{metric.kpi}</p>
                        <p className="text-xs text-muted-foreground">Target: {metric.target}</p>
                        <p className="text-xs text-muted-foreground">Measurement: {metric.measurement}</p>
                        {i < plan.metrics.length - 1 && <Separator className="mt-2" />}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <div className="grid gap-4">
                {plan.mvp_features?.map((feature, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold text-lg">{feature.name}</h3>
                            <Badge className={getPriorityColor(feature.priority)}>
                              {feature.priority} Priority
                            </Badge>
                            <Badge variant="outline" className={getComplexityColor(feature.complexity)}>
                              {feature.complexity} Complexity
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-4">{feature.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>Est. {feature.estimated_days} days</span>
                            </div>
                            {feature.dependencies?.length > 0 && (
                              <div className="flex items-center gap-2 text-sm">
                                <GitBranch className="w-4 h-4 text-muted-foreground" />
                                <span>Depends on: {feature.dependencies.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tech" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {plan.tech_stack?.map((category, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {category.category === "Frontend" && <Layers className="w-5 h-5 text-primary" />}
                        {category.category === "Backend" && <Network className="w-5 h-5 text-primary" />}
                        {category.category === "Database" && <Boxes className="w-5 h-5 text-primary" />}
                        {category.category === "Infrastructure" && <Cpu className="w-5 h-5 text-primary" />}
                        {category.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {category.technologies && category.technologies.length > 0 ? (
                        category.technologies.map((tech, i) => (
                          <div key={i} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{tech.name}</p>
                              <Badge variant="outline">{tech.learning_curve} Learning</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{tech.purpose}</p>
                            <p className="text-xs text-muted-foreground">
                              Alternatives: {tech.alternatives?.join(', ') || 'None listed'}
                            </p>
                            {i < category.technologies.length - 1 && <Separator />}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <p>No technologies listed for this category</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="roadmap" className="space-y-4">
              <div className="grid gap-4">
                {plan.development_phases?.map((phase, idx) => (
                  <Card key={idx} className="overflow-hidden">
                    <CardHeader className="bg-muted/50">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Rocket className="w-5 h-5 text-primary" />
                            {phase.phase}
                          </CardTitle>
                          <CardDescription>
                            {phase.duration} • {phase.start_date} - {phase.end_date}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-sm">
                            Progress: {Math.round(calculateProgress(idx))}%
                          </Badge>
                          <Badge variant={calculateProgress(idx) === 100 ? "default" : "secondary"}>
                            {calculateProgress(idx) === 100 ? "Completed" : "In Progress"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <Progress value={calculateProgress(idx)} className="mb-4" />
                      
                      <div className="space-y-3">
                        <p className="font-medium text-sm flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          Tasks:
                        </p>
                        {phase.tasks?.map((task, taskIdx) => {
                          const taskKey = `${idx}-${taskIdx}`;
                          const isCompleted = taskCompletion[taskKey] || false;
                          
                          return (
                            <div 
                              key={taskIdx} 
                              className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer ${
                                isCompleted ? 'bg-green-50' : 'hover:bg-muted/50'
                              }`}
                              onClick={() => handleTaskToggle(idx, taskIdx)}
                            >
                              <div className="relative flex items-center">
                                <input 
                                  type="checkbox" 
                                  checked={isCompleted}
                                  onChange={() => handleTaskToggle(idx, taskIdx)}
                                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <span className={`flex-1 text-sm ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                {task.task}
                                {task.assignee && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    👤 {task.assignee}
                                  </span>
                                )}
                              </span>
                              {isCompleted && (
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                  Done
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="mt-6">
                        <p className="font-medium text-sm flex items-center gap-2 mb-3">
                          <Target className="w-4 h-4 text-primary" />
                          Milestones:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {phase.milestones?.map((m, mIdx) => {
                            const milestoneKey = `milestone-${idx}-${mIdx}`;
                            const isMilestoneCompleted = taskCompletion[milestoneKey] || false;
                            
                            return (
                              <Badge 
                                key={mIdx} 
                                variant={isMilestoneCompleted ? "default" : "secondary"}
                                className={`cursor-pointer px-3 py-1 ${
                                  isMilestoneCompleted ? 'bg-green-600' : ''
                                }`}
                                onClick={() => {
                                  const key = `milestone-${idx}-${mIdx}`;
                                  setTaskCompletion(prev => ({
                                    ...prev,
                                    [key]: !prev[key]
                                  }));
                                }}
                              >
                                {m}
                                {isMilestoneCompleted && ' ✓'}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Team Structure
                    </CardTitle>
                    <CardDescription>Total Team Size: {plan.resources?.team_size || 0}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.resources?.roles?.map((role, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{role.role}</p>
                          <Badge>{role.count} {role.count > 1 ? 'members' : 'member'}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Skills: {role.skills?.join(', ')}
                        </p>
                        {idx < plan.resources.roles.length - 1 && <Separator />}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      Budget & Infrastructure
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-medium">Budget Estimate</p>
                      <p className="text-2xl font-bold text-primary mt-1">{plan.resources?.budget_estimate || "Not specified"}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium mb-2">Infrastructure</p>
                      <div className="flex flex-wrap gap-2">
                        {plan.resources?.infrastructure?.map((item, idx) => (
                          <Badge key={idx} variant="outline">{item}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}