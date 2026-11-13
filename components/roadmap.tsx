"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Lightbulb,
  FileText,
  RefreshCw,
  Edit,
  Trash2,
  Save,
  XCircle,
  Rocket,
  Award,
  BarChart,
  PieChart,
  Download,
  Share2,
  Settings,
  ChevronDown,
  ChevronUp,
  GanttChart,
  ListChecks,
  Timer,
  Flag,
  Layers,
  Brain,
  Zap,
  AlertCircle,
  CheckSquare
} from "lucide-react"
import { apiFetch } from "@/lib/api"

// ============= INTERFACES =============
interface Task {
  id: string
  title: string
  completed: boolean
  assignee?: string
  dueDate?: string
  priority?: "low" | "medium" | "high"
}

interface Milestone {
  id: string
  title: string
  description: string
  category: "product" | "business" | "funding" | "team" | "legal"
  status: "not-started" | "in-progress" | "completed" | "blocked"
  priority: "low" | "medium" | "high" | "critical"
  dueDate: string
  progress: number
  tasks: Task[]
  dependencies?: string[]
  notes?: string
  createdAt: string
  completedAt?: string
}

interface TimelinePhase {
  id: string
  name: string
  duration: string
  milestones: string[]
  description: string
  startDate?: string
  endDate?: string
  status: "not-started" | "in-progress" | "completed"
}

interface RoadmapAnalytics {
  totalMilestones: number
  completedMilestones: number
  inProgressMilestones: number
  blockedMilestones: number
  notStartedMilestones: number
  averageProgress: number
  tasksCompleted: number
  totalTasks: number
  criticalMilestones: number
  highPriorityMilestones: number
  mediumPriorityMilestones: number
  lowPriorityMilestones: number
  overdueMilestones: number
  upcomingDeadlines: number
  completedOnTime: number
  completedLate: number
  productMilestones: number
  businessMilestones: number
  fundingMilestones: number
  teamMilestones: number
  legalMilestones: number
  completedPhases: number
  totalPhases: number
}

interface RoadmapData {
  startup_idea: string
  industry: string
  milestones: Milestone[]
  timeline: TimelinePhase[]
  analytics: RoadmapAnalytics
  lastUpdated?: string
}

// ============= MAIN COMPONENT =============
export function Roadmap() {
  const [startupIdea, setStartupIdea] = useState("")
  const [industry, setIndustry] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasData, setHasData] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("milestones")
  const [expandedMilestones, setExpandedMilestones] = useState<string[]>([])
  
  // Add milestone modal state
  const [isAddingMilestone, setIsAddingMilestone] = useState(false)
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    category: "product" as const,
    priority: "medium" as const,
    dueDate: "",
    phaseId: ""
  })

  // Add task modal state
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [selectedMilestoneForTask, setSelectedMilestoneForTask] = useState<string>("")
  const [newTask, setNewTask] = useState({
    title: "",
    priority: "medium" as const,
    dueDate: ""
  })

  // Edit states
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTask, setEditingTask] = useState<{milestoneId: string, task: Task} | null>(null)
  const [showEditTaskModal, setShowEditTaskModal] = useState(false)

  // Filter states
  const [filterCategory, setFilterCategory] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("")
  const [filterPriority, setFilterPriority] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")

  // Roadmap data state
  const [roadmapData, setRoadmapData] = useState<RoadmapData>({
    startup_idea: "",
    industry: "",
    milestones: [],
    timeline: [],
    analytics: {
      totalMilestones: 0,
      completedMilestones: 0,
      inProgressMilestones: 0,
      blockedMilestones: 0,
      notStartedMilestones: 0,
      averageProgress: 0,
      tasksCompleted: 0,
      totalTasks: 0,
      criticalMilestones: 0,
      highPriorityMilestones: 0,
      mediumPriorityMilestones: 0,
      lowPriorityMilestones: 0,
      overdueMilestones: 0,
      upcomingDeadlines: 0,
      completedOnTime: 0,
      completedLate: 0,
      productMilestones: 0,
      businessMilestones: 0,
      fundingMilestones: 0,
      teamMilestones: 0,
      legalMilestones: 0,
      completedPhases: 0,
      totalPhases: 0
    },
    lastUpdated: undefined
  })

  // ============= HELPER FUNCTIONS =============

  // Process API response into our data structure
  const processRoadmapData = (apiData: any): RoadmapData => {
    const today = new Date();
    
    // Generate milestones from API or use samples
    let milestones: Milestone[] = [];
    
    if (apiData.milestones && apiData.milestones.length > 0) {
      milestones = apiData.milestones.map((m: any, index: number) => ({
        id: `milestone-${Date.now()}-${index}`,
        title: m.title || `Milestone ${index + 1}`,
        description: m.description || "",
        category: m.category || "product",
        status: "not-started",
        priority: m.priority || "medium",
        dueDate: m.dueDate || new Date(today.getTime() + (index * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        progress: 0,
        tasks: (m.tasks || []).map((t: any, taskIndex: number) => ({
          id: `task-${Date.now()}-${index}-${taskIndex}`,
          title: t.title || t || `Task ${taskIndex + 1}`,
          completed: false
        })),
        dependencies: m.dependencies || [],
        createdAt: new Date().toISOString()
      }));
    } else {
      milestones = generateSampleMilestones();
    }

    // Generate timeline phases
    let timeline: TimelinePhase[] = [];
    if (apiData.timeline && apiData.timeline.length > 0) {
      timeline = apiData.timeline.map((phase: any, index: number) => ({
        id: `phase-${Date.now()}-${index}`,
        name: phase.phase || phase.name || `Phase ${index + 1}`,
        duration: phase.duration || "3 months",
        milestones: phase.milestones || [],
        description: phase.description || phase.goals?.join(", ") || "",
        startDate: phase.startDate,
        endDate: phase.endDate,
        status: phase.status || "not-started"
      }));
    } else {
      timeline = generateSampleTimeline();
    }

    // Calculate analytics
    const analytics = calculateAnalytics(milestones, timeline);

    return {
      startup_idea: startupIdea,
      industry: industry,
      milestones,
      timeline,
      analytics,
      lastUpdated: new Date().toISOString()
    };
  };

  // Generate sample milestones
  const generateSampleMilestones = (): Milestone[] => {
    const today = new Date();
    
    return [
      {
        id: "ms-1",
        title: "Market Research & Validation",
        description: "Conduct comprehensive market research and validate problem-solution fit",
        category: "business",
        status: "completed",
        priority: "high",
        dueDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        progress: 100,
        tasks: [
          { id: "t1-1", title: "Interview 50 potential customers", completed: true },
          { id: "t1-2", title: "Analyze competitor landscape", completed: true },
          { id: "t1-3", title: "Create market sizing report", completed: true },
          { id: "t1-4", title: "Validate pricing model", completed: true }
        ],
        createdAt: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "ms-2",
        title: "Legal Entity & IP Protection",
        description: "Establish legal foundation and protect intellectual property",
        category: "legal",
        status: "completed",
        priority: "critical",
        dueDate: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        progress: 100,
        tasks: [
          { id: "t2-1", title: "Incorporate company (Delaware C-Corp)", completed: true },
          { id: "t2-2", title: "File provisional patents", completed: true },
          { id: "t2-3", title: "Trademark company name", completed: true },
          { id: "t2-4", title: "Create founder agreements", completed: true }
        ],
        createdAt: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "ms-3",
        title: "MVP Development",
        description: "Build and launch minimum viable product with core features",
        category: "product",
        status: "in-progress",
        priority: "critical",
        dueDate: new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        progress: 65,
        tasks: [
          { id: "t3-1", title: "Design UI/UX wireframes", completed: true },
          { id: "t3-2", title: "Set up development environment", completed: true },
          { id: "t3-3", title: "Build authentication system", completed: true },
          { id: "t3-4", title: "Develop core features", completed: true },
          { id: "t3-5", title: "Implement payment processing", completed: false },
          { id: "t3-6", title: "Conduct internal testing", completed: false },
          { id: "t3-7", title: "Fix critical bugs", completed: false }
        ],
        createdAt: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "ms-4",
        title: "Initial Team Hiring",
        description: "Hire key team members to scale development and operations",
        category: "team",
        status: "in-progress",
        priority: "high",
        dueDate: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        progress: 40,
        tasks: [
          { id: "t4-1", title: "Create job descriptions", completed: true },
          { id: "t4-2", title: "Post jobs on relevant platforms", completed: true },
          { id: "t4-3", title: "Screen initial candidates", completed: true },
          { id: "t4-4", title: "Conduct technical interviews", completed: false },
          { id: "t4-5", title: "Extend offers", completed: false },
          { id: "t4-6", title: "Onboard new hires", completed: false }
        ],
        createdAt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "ms-5",
        title: "Seed Funding Preparation",
        description: "Prepare materials and pitch to investors for seed round",
        category: "funding",
        status: "not-started",
        priority: "high",
        dueDate: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        progress: 15,
        tasks: [
          { id: "t5-1", title: "Create investor pitch deck", completed: true },
          { id: "t5-2", title: "Build financial projections", completed: false },
          { id: "t5-3", title: "Compile investor list", completed: false },
          { id: "t5-4", title: "Prepare data room", completed: false },
          { id: "t5-5", title: "Practice pitch", completed: false }
        ],
        createdAt: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "ms-6",
        title: "Beta Launch",
        description: "Launch beta version to首批 100 users for feedback",
        category: "product",
        status: "not-started",
        priority: "high",
        dueDate: new Date(today.getTime() + 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        progress: 0,
        tasks: [
          { id: "t6-1", title: "Set up beta program", completed: false },
          { id: "t6-2", title: "Recruit beta testers", completed: false },
          { id: "t6-3", title: "Create feedback system", completed: false },
          { id: "t6-4", title: "Monitor and collect feedback", completed: false }
        ],
        createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "ms-7",
        title: "API Integration Issue",
        description: "Third-party API integration blocked due to vendor issues",
        category: "product",
        status: "blocked",
        priority: "critical",
        dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        progress: 30,
        tasks: [
          { id: "t7-1", title: "Contact vendor support", completed: true },
          { id: "t7-2", title: "Review API documentation", completed: true },
          { id: "t7-3", title: "Implement fallback solution", completed: false },
          { id: "t7-4", title: "Test integration", completed: false }
        ],
        createdAt: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Waiting for vendor to fix authentication issue"
      }
    ];
  };

  // Generate sample timeline
  const generateSampleTimeline = (): TimelinePhase[] => {
    const today = new Date();
    
    return [
      {
        id: "phase-1",
        name: "Foundation Phase",
        duration: "3 months",
        description: "Establish legal structure, validate idea, and build foundation",
        milestones: ["ms-1", "ms-2"],
        startDate: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: "completed"
      },
      {
        id: "phase-2",
        name: "MVP Development Phase",
        duration: "3 months",
        description: "Build MVP, hire initial team, prepare for beta",
        milestones: ["ms-3", "ms-4", "ms-7"],
        startDate: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: "in-progress"
      },
      {
        id: "phase-3",
        name: "Launch & Growth Phase",
        duration: "4 months",
        description: "Beta launch, secure funding, scale operations",
        milestones: ["ms-5", "ms-6"],
        startDate: new Date(today.getTime() + 46 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 166 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: "not-started"
      }
    ];
  };

  // Calculate comprehensive analytics
  const calculateAnalytics = (milestones: Milestone[], timeline: TimelinePhase[]): RoadmapAnalytics => {
    const today = new Date();
    
    // Milestone counts by status
    const completed = milestones.filter(m => m.status === "completed").length;
    const inProgress = milestones.filter(m => m.status === "in-progress").length;
    const blocked = milestones.filter(m => m.status === "blocked").length;
    const notStarted = milestones.filter(m => m.status === "not-started").length;
    
    // Progress stats
    const totalProgress = milestones.reduce((sum, m) => sum + m.progress, 0);
    const averageProgress = milestones.length > 0 ? Math.round(totalProgress / milestones.length) : 0;
    
    const totalTasks = milestones.reduce((sum, m) => sum + m.tasks.length, 0);
    const tasksCompleted = milestones.reduce((sum, m) => 
      sum + m.tasks.filter(t => t.completed).length, 0
    );
    
    // Priority stats
    const critical = milestones.filter(m => m.priority === "critical").length;
    const high = milestones.filter(m => m.priority === "high").length;
    const medium = milestones.filter(m => m.priority === "medium").length;
    const low = milestones.filter(m => m.priority === "low").length;
    
    // Timeline stats
    const overdue = milestones.filter(m => {
      if (m.status === "completed") return false;
      const dueDate = new Date(m.dueDate);
      return dueDate < today;
    }).length;
    
    const upcoming = milestones.filter(m => {
      if (m.status === "completed") return false;
      const dueDate = new Date(m.dueDate);
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 14;
    }).length;
    
    const completedOnTime = milestones.filter(m => {
      if (m.status !== "completed" || !m.completedAt) return false;
      const dueDate = new Date(m.dueDate);
      const completedDate = new Date(m.completedAt);
      return completedDate <= dueDate;
    }).length;
    
    const completedLate = milestones.filter(m => {
      if (m.status !== "completed" || !m.completedAt) return false;
      const dueDate = new Date(m.dueDate);
      const completedDate = new Date(m.completedAt);
      return completedDate > dueDate;
    }).length;
    
    // Category stats
    const product = milestones.filter(m => m.category === "product").length;
    const business = milestones.filter(m => m.category === "business").length;
    const funding = milestones.filter(m => m.category === "funding").length;
    const team = milestones.filter(m => m.category === "team").length;
    const legal = milestones.filter(m => m.category === "legal").length;
    
    // Phase stats
    const completedPhases = timeline.filter(p => p.status === "completed").length;
    const totalPhases = timeline.length;

    return {
      totalMilestones: milestones.length,
      completedMilestones: completed,
      inProgressMilestones: inProgress,
      blockedMilestones: blocked,
      notStartedMilestones: notStarted,
      averageProgress,
      tasksCompleted,
      totalTasks,
      criticalMilestones: critical,
      highPriorityMilestones: high,
      mediumPriorityMilestones: medium,
      lowPriorityMilestones: low,
      overdueMilestones: overdue,
      upcomingDeadlines: upcoming,
      completedOnTime,
      completedLate,
      productMilestones: product,
      businessMilestones: business,
      fundingMilestones: funding,
      teamMilestones: team,
      legalMilestones: legal,
      completedPhases,
      totalPhases
    };
  };

  // Generate comprehensive sample roadmap
  const generateSampleRoadmap = (idea: string, ind: string): RoadmapData => {
    const milestones = generateSampleMilestones();
    const timeline = generateSampleTimeline();
    const analytics = calculateAnalytics(milestones, timeline);

    return {
      startup_idea: idea,
      industry: ind,
      milestones,
      timeline,
      analytics,
      lastUpdated: new Date().toISOString()
    };
  };

  // Generate roadmap from backend
  const generateRoadmap = async () => {
    if (!startupIdea || !industry) {
      alert("Please enter both startup idea and industry");
      return;
    }

    setIsGenerating(true);
    setHasData(false);
    setError(null);

    try {
      const response = await apiFetch("/startup-roadmap", {
        method: "POST",
        body: JSON.stringify({
          startup_idea: startupIdea,
          industry: industry
        })
      });

      const data = await response.json();
      
      if (data.roadmap) {
        const completeRoadmap = processRoadmapData(data.roadmap);
        setRoadmapData(completeRoadmap);
        setHasData(true);
      } else {
        throw new Error("Invalid response format");
      }
      
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to generate roadmap. Using sample data.');
      
      // Fallback to comprehensive sample data
      const sampleRoadmap = generateSampleRoadmap(startupIdea, industry);
      setRoadmapData(sampleRoadmap);
      setHasData(true);
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle milestone expansion
  const toggleMilestone = (milestoneId: string) => {
    setExpandedMilestones(prev => 
      prev.includes(milestoneId)
        ? prev.filter(id => id !== milestoneId)
        : [...prev, milestoneId]
    );
  };

  // Toggle task completion
  const toggleTask = (milestoneId: string, taskId: string) => {
    setRoadmapData(prev => {
      const updatedMilestones = prev.milestones.map(milestone => {
        if (milestone.id === milestoneId) {
          const updatedTasks = milestone.tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          );
          
          const completedCount = updatedTasks.filter(t => t.completed).length;
          const progress = Math.round((completedCount / updatedTasks.length) * 100);
          
          let status: Milestone["status"] = "not-started";
          if (progress === 100) status = "completed";
          else if (progress > 0) status = "in-progress";
          
          return {
            ...milestone,
            tasks: updatedTasks,
            progress,
            status,
            completedAt: progress === 100 ? new Date().toISOString() : milestone.completedAt
          };
        }
        return milestone;
      });

      return {
        ...prev,
        milestones: updatedMilestones,
        analytics: calculateAnalytics(updatedMilestones, prev.timeline)
      };
    });
  };

  // Update milestone status
  const updateMilestoneStatus = (milestoneId: string, newStatus: Milestone["status"]) => {
    setRoadmapData(prev => {
      const updatedMilestones = prev.milestones.map(milestone =>
        milestone.id === milestoneId
          ? { 
              ...milestone, 
              status: newStatus,
              completedAt: newStatus === "completed" ? new Date().toISOString() : milestone.completedAt
            }
          : milestone
      );

      return {
        ...prev,
        milestones: updatedMilestones,
        analytics: calculateAnalytics(updatedMilestones, prev.timeline)
      };
    });
  };

  // Add new milestone
  const addMilestone = () => {
    if (!newMilestone.title.trim()) return;

    const milestone: Milestone = {
      id: `ms-${Date.now()}`,
      title: newMilestone.title,
      description: newMilestone.description,
      category: newMilestone.category,
      status: "not-started",
      priority: newMilestone.priority,
      dueDate: newMilestone.dueDate || new Date().toISOString().split('T')[0],
      progress: 0,
      tasks: [],
      createdAt: new Date().toISOString()
    };

    setRoadmapData(prev => {
      const updatedMilestones = [...prev.milestones, milestone];
      
      // Add milestone to appropriate phase if phaseId provided
      let updatedTimeline = prev.timeline;
      if (newMilestone.phaseId) {
        updatedTimeline = prev.timeline.map(phase => 
          phase.id === newMilestone.phaseId
            ? { ...phase, milestones: [...phase.milestones, milestone.id] }
            : phase
        );
      }

      return {
        ...prev,
        milestones: updatedMilestones,
        timeline: updatedTimeline,
        analytics: calculateAnalytics(updatedMilestones, updatedTimeline)
      };
    });

    setNewMilestone({
      title: "",
      description: "",
      category: "product",
      priority: "medium",
      dueDate: "",
      phaseId: ""
    });
    setIsAddingMilestone(false);
  };

  // Add task to milestone
  const addTask = () => {
    if (!newTask.title.trim() || !selectedMilestoneForTask) return;

    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      completed: false,
      priority: newTask.priority,
      dueDate: newTask.dueDate
    };

    setRoadmapData(prev => {
      const updatedMilestones = prev.milestones.map(milestone => 
        milestone.id === selectedMilestoneForTask
          ? { ...milestone, tasks: [...milestone.tasks, task] }
          : milestone
      );

      return {
        ...prev,
        milestones: updatedMilestones,
        analytics: calculateAnalytics(updatedMilestones, prev.timeline)
      };
    });

    setNewTask({
      title: "",
      priority: "medium",
      dueDate: ""
    });
    setIsAddingTask(false);
    setSelectedMilestoneForTask("");
  };

  // Edit milestone
  const saveMilestoneEdit = () => {
    if (!editingMilestone) return;

    setRoadmapData(prev => {
      const updatedMilestones = prev.milestones.map(m =>
        m.id === editingMilestone.id ? editingMilestone : m
      );

      return {
        ...prev,
        milestones: updatedMilestones,
        analytics: calculateAnalytics(updatedMilestones, prev.timeline)
      };
    });

    setShowEditModal(false);
    setEditingMilestone(null);
  };

  // Edit task
  const saveTaskEdit = () => {
    if (!editingTask) return;

    setRoadmapData(prev => {
      const updatedMilestones = prev.milestones.map(milestone => {
        if (milestone.id === editingTask.milestoneId) {
          const updatedTasks = milestone.tasks.map(task =>
            task.id === editingTask.task.id ? editingTask.task : task
          );
          return { ...milestone, tasks: updatedTasks };
        }
        return milestone;
      });

      return {
        ...prev,
        milestones: updatedMilestones,
        analytics: calculateAnalytics(updatedMilestones, prev.timeline)
      };
    });

    setShowEditTaskModal(false);
    setEditingTask(null);
  };

  // Delete milestone
  const deleteMilestone = (milestoneId: string) => {
    if (!confirm("Are you sure you want to delete this milestone?")) return;

    setRoadmapData(prev => {
      const updatedMilestones = prev.milestones.filter(m => m.id !== milestoneId);
      
      // Remove milestone from all phases
      const updatedTimeline = prev.timeline.map(phase => ({
        ...phase,
        milestones: phase.milestones.filter(id => id !== milestoneId)
      }));

      return {
        ...prev,
        milestones: updatedMilestones,
        timeline: updatedTimeline,
        analytics: calculateAnalytics(updatedMilestones, updatedTimeline)
      };
    });
  };

  // Delete task
  const deleteTask = (milestoneId: string, taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    setRoadmapData(prev => {
      const updatedMilestones = prev.milestones.map(milestone => {
        if (milestone.id === milestoneId) {
          const updatedTasks = milestone.tasks.filter(t => t.id !== taskId);
          const completedCount = updatedTasks.filter(t => t.completed).length;
          const progress = Math.round((completedCount / updatedTasks.length) * 100) || 0;
          
          let status: Milestone["status"] = "not-started";
          if (progress === 100) status = "completed";
          else if (progress > 0) status = "in-progress";

          return {
            ...milestone,
            tasks: updatedTasks,
            progress,
            status
          };
        }
        return milestone;
      });

      return {
        ...prev,
        milestones: updatedMilestones,
        analytics: calculateAnalytics(updatedMilestones, prev.timeline)
      };
    });
  };

  // Filter milestones
  const filteredMilestones = roadmapData.milestones.filter(milestone => {
  if (filterCategory && filterCategory !== "all" && milestone.category !== filterCategory) return false;
  if (filterStatus && filterStatus !== "all" && milestone.status !== filterStatus) return false;
  if (filterPriority && filterPriority !== "all" && milestone.priority !== filterPriority) return false;
  if (searchQuery && !milestone.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
      !milestone.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
  return true;
});

  // Get milestone for phase
  const getMilestoneForPhase = (milestoneId: string) => {
    return roadmapData.milestones.find(m => m.id === milestoneId);
  };

  // Helper functions for styling
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "product": return <Lightbulb className="w-4 h-4" />
      case "business": return <TrendingUp className="w-4 h-4" />
      case "funding": return <DollarSign className="w-4 h-4" />
      case "team": return <Users className="w-4 h-4" />
      case "legal": return <FileText className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200"
      case "in-progress": return "bg-blue-100 text-blue-800 border-blue-200"
      case "blocked": return "bg-red-100 text-red-800 border-red-200"
      case "not-started": return "bg-gray-100 text-gray-800 border-gray-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 border-red-200"
      case "high": return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-green-600" />
      case "in-progress": return <RefreshCw className="w-4 h-4 text-blue-600" />
      case "blocked": return <AlertTriangle className="w-4 h-4 text-red-600" />
      case "not-started": return <Clock className="w-4 h-4 text-gray-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Startup Roadmap & Progress</h1>
          <p className="text-muted-foreground">
            Track milestones, manage tasks, and visualize your startup journey from idea to scale.
          </p>
        </div>
        {hasData && (
          <div className="flex gap-2">
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

      {/* Input Section */}
      {!hasData && (
        <Card className="border-2 border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Rocket className="w-6 h-6 text-primary" />
              Generate Your Roadmap
            </CardTitle>
            <CardDescription>
              Tell us about your startup to generate a personalized roadmap with milestones and timeline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="idea" className="text-sm font-medium">Startup Idea</Label>
                <Input
                  id="idea"
                  placeholder="e.g., AI-powered code review platform"
                  value={startupIdea}
                  onChange={(e) => setStartupIdea(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry" className="text-sm font-medium">Industry</Label>
                <Input
                  id="industry"
                  placeholder="e.g., Developer Tools, AI/ML"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
            <Button 
              onClick={generateRoadmap} 
              disabled={isGenerating} 
              size="lg"
              className="mt-6 w-full md:w-auto"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating Roadmap...
                </>
              ) : (
                <>
                  <GanttChart className="w-4 h-4 mr-2" />
                  Generate Roadmap
                </>
              )}
            </Button>
            {error && (
              <div className="flex items-center gap-2 text-red-500 mt-4 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Roadmap Display */}
      {hasData && (
        <div className="space-y-6">
          {/* Progress Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {roadmapData.analytics.totalMilestones} total
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-blue-700">{roadmapData.analytics.averageProgress}%</p>
                <p className="text-xs text-blue-600">Overall Progress</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {roadmapData.analytics.completedOnTime} on time
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-green-700">{roadmapData.analytics.completedMilestones}</p>
                <p className="text-xs text-green-600">Completed Milestones</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {roadmapData.analytics.upcomingDeadlines} upcoming
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-orange-700">{roadmapData.analytics.inProgressMilestones}</p>
                <p className="text-xs text-orange-600">In Progress</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    {roadmapData.analytics.overdueMilestones} overdue
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-red-700">{roadmapData.analytics.blockedMilestones}</p>
                <p className="text-xs text-red-600">Blocked</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-600">Critical Items</p>
              <p className="text-xl font-bold text-purple-700">{roadmapData.analytics.criticalMilestones}</p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
              <p className="text-xs text-indigo-600">Tasks Done</p>
              <p className="text-xl font-bold text-indigo-700">{roadmapData.analytics.tasksCompleted}/{roadmapData.analytics.totalTasks}</p>
            </div>
            <div className="bg-pink-50 p-3 rounded-lg border border-pink-200">
              <p className="text-xs text-pink-600">Completed Phases</p>
              <p className="text-xl font-bold text-pink-700">{roadmapData.analytics.completedPhases}/{roadmapData.analytics.totalPhases}</p>
            </div>
            <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-200">
              <p className="text-xs text-cyan-600">Completed Late</p>
              <p className="text-xl font-bold text-cyan-700">{roadmapData.analytics.completedLate}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
              <p className="text-xs text-emerald-600">Not Started</p>
              <p className="text-xl font-bold text-emerald-700">{roadmapData.analytics.notStartedMilestones}</p>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="flex flex-wrap gap-3 items-center justify-between bg-muted/30 p-4 rounded-lg">
            <div className="flex flex-wrap gap-3">
              <Input
                placeholder="Search milestones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px]"
              />
              <Select value={filterCategory} onValueChange={setFilterCategory}>
  <SelectTrigger className="w-[130px]">
    <SelectValue placeholder="Category" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Categories</SelectItem> {/* ✅ Fixed: use "all" instead of empty string */}
    <SelectItem value="product">Product</SelectItem>
    <SelectItem value="business">Business</SelectItem>
    <SelectItem value="funding">Funding</SelectItem>
    <SelectItem value="team">Team</SelectItem>
    <SelectItem value="legal">Legal</SelectItem>
  </SelectContent>
</Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
  <SelectTrigger className="w-[130px]">
    <SelectValue placeholder="Status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Statuses</SelectItem> {/* ✅ Fixed */}
    <SelectItem value="not-started">Not Started</SelectItem>
    <SelectItem value="in-progress">In Progress</SelectItem>
    <SelectItem value="completed">Completed</SelectItem>
    <SelectItem value="blocked">Blocked</SelectItem>
  </SelectContent>
</Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
  <SelectTrigger className="w-[130px]">
    <SelectValue placeholder="Priority" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Priorities</SelectItem> {/* ✅ Fixed */}
    <SelectItem value="low">Low</SelectItem>
    <SelectItem value="medium">Medium</SelectItem>
    <SelectItem value="high">High</SelectItem>
    <SelectItem value="critical">Critical</SelectItem>
  </SelectContent>
</Select>

              <Button variant="outline" onClick={() => {
                setFilterCategory("all");
                setFilterStatus("all");
                setFilterPriority("all");
                setSearchQuery("");
              }}>
                Clear Filters
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setIsAddingMilestone(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Milestone
              </Button>
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="milestones" className="flex items-center gap-2">
                <ListChecks className="w-4 h-4" />
                Milestones
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <GanttChart className="w-4 h-4" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Milestones Tab */}
            <TabsContent value="milestones" className="space-y-4">
              <div className="grid gap-4">
                {filteredMilestones.length > 0 ? filteredMilestones.map((milestone) => (
                  <Card key={milestone.id} className="border-2 hover:border-primary/50 transition-all">
                    <CardHeader className="cursor-pointer" onClick={() => toggleMilestone(milestone.id)}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="text-primary mt-1">{getCategoryIcon(milestone.category)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-lg">{milestone.title}</CardTitle>
                              {getStatusIcon(milestone.status)}
                              {expandedMilestones.includes(milestone.id) ? 
                                <ChevronUp className="w-4 h-4" /> : 
                                <ChevronDown className="w-4 h-4" />
                              }
                            </div>
                            <CardDescription>{milestone.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(milestone.priority)}>{milestone.priority}</Badge>
                          <Badge className={getStatusColor(milestone.status)}>{milestone.status}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {expandedMilestones.includes(milestone.id) && (
                      <CardContent className="space-y-4">
                        {/* Progress and Due Date */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className={`text-sm ${
                                new Date(milestone.dueDate) < new Date() && milestone.status !== "completed" 
                                  ? "text-red-600 font-medium" 
                                  : "text-muted-foreground"
                              }`}>
                                Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                {new Date(milestone.dueDate) < new Date() && milestone.status !== "completed" && " (Overdue)"}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {milestone.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{milestone.progress}%</span>
                            <Progress value={milestone.progress} className="w-20 h-2" />
                          </div>
                        </div>

                        {/* Status Update Buttons */}
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            size="sm" 
                            variant={milestone.status === "not-started" ? "default" : "outline"}
                            onClick={() => updateMilestoneStatus(milestone.id, "not-started")}
                            className={milestone.status === "not-started" ? "bg-gray-600" : ""}
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            Not Started
                          </Button>
                          <Button 
                            size="sm" 
                            variant={milestone.status === "in-progress" ? "default" : "outline"}
                            onClick={() => updateMilestoneStatus(milestone.id, "in-progress")}
                            className={milestone.status === "in-progress" ? "bg-blue-600" : ""}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            In Progress
                          </Button>
                          <Button 
                            size="sm" 
                            variant={milestone.status === "completed" ? "default" : "outline"}
                            className={milestone.status === "completed" ? "bg-green-600" : ""}
                            onClick={() => updateMilestoneStatus(milestone.id, "completed")}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Button>
                          <Button 
                            size="sm" 
                            variant={milestone.status === "blocked" ? "default" : "outline"}
                            className={milestone.status === "blocked" ? "bg-red-600" : ""}
                            onClick={() => updateMilestoneStatus(milestone.id, "blocked")}
                          >
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Blocked
                          </Button>
                        </div>

                        {/* Blocked Reason (if blocked) */}
                        {milestone.status === "blocked" && milestone.notes && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                            <div>
                              <p className="text-xs font-medium text-red-800">Blocked Reason:</p>
                              <p className="text-xs text-red-700">{milestone.notes}</p>
                            </div>
                          </div>
                        )}

                        <Separator />

                        {/* Tasks Section */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-sm">
                              Tasks ({milestone.tasks.filter(t => t.completed).length}/{milestone.tasks.length})
                            </h4>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedMilestoneForTask(milestone.id);
                                setIsAddingTask(true);
                              }}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Task
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {milestone.tasks.map((task) => (
                              <div key={task.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 group">
                                <button
                                  onClick={() => toggleTask(milestone.id, task.id)}
                                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                    task.completed
                                      ? "bg-green-600 border-green-600 text-white"
                                      : "border-gray-400 hover:border-green-600"
                                  }`}
                                >
                                  {task.completed && <CheckCircle className="w-3 h-3" />}
                                </button>
                                <span className={`text-sm flex-1 ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                                  {task.title}
                                </span>
                                {task.priority && (
                                  <Badge variant="outline" className={
                                    task.priority === "high" ? "bg-orange-50 text-orange-700" :
                                    task.priority === "medium" ? "bg-yellow-50 text-yellow-700" :
                                    "bg-green-50 text-green-700"
                                  }>
                                    {task.priority}
                                  </Badge>
                                )}
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() => {
                                      setEditingTask({ milestoneId: milestone.id, task });
                                      setShowEditTaskModal(true);
                                    }}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-red-500"
                                    onClick={() => deleteTask(milestone.id, task.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Milestone Actions */}
                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingMilestone(milestone);
                              setShowEditModal(true);
                            }}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => deleteMilestone(milestone.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )) : (
                  <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
                    <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Milestones Found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery || filterCategory || filterStatus || filterPriority 
                        ? "Try adjusting your filters" 
                        : "Add your first milestone to get started"}
                    </p>
                    <Button onClick={() => setIsAddingMilestone(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Milestone
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-4">
              <div className="space-y-6">
                {roadmapData.timeline.map((phase, index) => {
                  const phaseMilestones = phase.milestones
                    .map(id => getMilestoneForPhase(id))
                    .filter((m): m is Milestone => m !== undefined);
                  
                  const completedMilestones = phaseMilestones.filter(m => m.status === "completed").length;
                  const phaseProgress = phaseMilestones.length > 0 
                    ? Math.round((completedMilestones / phaseMilestones.length) * 100) 
                    : 0;

                  return (
                    <Card key={phase.id} className="border-2 overflow-hidden">
                      <CardHeader className={`${
                        phase.status === "completed" ? "bg-green-50" :
                        phase.status === "in-progress" ? "bg-blue-50" : "bg-gray-50"
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-lg">{phase.name}</CardTitle>
                              <Badge variant="outline">{phase.duration}</Badge>
                              <Badge className={
                                phase.status === "completed" ? "bg-green-100 text-green-800" :
                                phase.status === "in-progress" ? "bg-blue-100 text-blue-800" :
                                "bg-gray-100 text-gray-800"
                              }>
                                {phase.status}
                              </Badge>
                            </div>
                            <CardDescription>{phase.description}</CardDescription>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{phaseProgress}% Complete</p>
                            <Progress value={phaseProgress} className="w-24 h-2 mt-1" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        {phaseMilestones.length > 0 ? (
                          <div className="space-y-3">
                            {phaseMilestones.map((milestone) => (
                              <div 
                                key={milestone.id} 
                                className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:border-primary/50 transition-colors"
                                onClick={() => {
                                  setActiveTab("milestones");
                                  toggleMilestone(milestone.id);
                                }}
                              >
                                <div className="text-primary">{getCategoryIcon(milestone.category)}</div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{milestone.title}</p>
                                    {getStatusIcon(milestone.status)}
                                  </div>
                                  <p className="text-xs text-muted-foreground">{milestone.description}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">{milestone.progress}%</p>
                                  <p className="text-xs text-muted-foreground">
                                    Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No milestones planned for this phase yet
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Analytics Tab - DYNAMIC */}
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Distribution - DYNAMIC */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-4 h-4" />
                      Milestones by Category
                    </CardTitle>
                    <CardDescription>Breakdown of {roadmapData.analytics.totalMilestones} total milestones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { key: "product", label: "Product", count: roadmapData.analytics.productMilestones, color: "bg-blue-500" },
                        { key: "business", label: "Business", count: roadmapData.analytics.businessMilestones, color: "bg-green-500" },
                        { key: "funding", label: "Funding", count: roadmapData.analytics.fundingMilestones, color: "bg-purple-500" },
                        { key: "team", label: "Team", count: roadmapData.analytics.teamMilestones, color: "bg-orange-500" },
                        { key: "legal", label: "Legal", count: roadmapData.analytics.legalMilestones, color: "bg-red-500" }
                      ].map((item) => {
                        const percentage = Math.round((item.count / roadmapData.analytics.totalMilestones) * 100) || 0;
                        return (
                          <div key={item.key} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{item.label}</span>
                              <span className="font-medium">{item.count} ({percentage}%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={percentage} className={`h-2 ${item.color}`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Priority Breakdown - DYNAMIC */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Flag className="w-4 h-4" />
                      Milestones by Priority
                    </CardTitle>
                    <CardDescription>Priority distribution across milestones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { key: "critical", label: "Critical", count: roadmapData.analytics.criticalMilestones, color: "bg-red-500" },
                        { key: "high", label: "High", count: roadmapData.analytics.highPriorityMilestones, color: "bg-orange-500" },
                        { key: "medium", label: "Medium", count: roadmapData.analytics.mediumPriorityMilestones, color: "bg-yellow-500" },
                        { key: "low", label: "Low", count: roadmapData.analytics.lowPriorityMilestones, color: "bg-green-500" }
                      ].map((item) => {
                        const percentage = Math.round((item.count / roadmapData.analytics.totalMilestones) * 100) || 0;
                        return (
                          <div key={item.key} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <Badge className={getPriorityColor(item.key)}>{item.label}</Badge>
                              <span className="font-medium">{item.count} ({percentage}%)</span>
                            </div>
                            <Progress value={percentage} className={`h-2 ${item.color}`} />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Status Overview - DYNAMIC */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Status Overview
                    </CardTitle>
                    <CardDescription>Current progress status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { status: "completed", label: "Completed", count: roadmapData.analytics.completedMilestones, color: "bg-green-500" },
                        { status: "in-progress", label: "In Progress", count: roadmapData.analytics.inProgressMilestones, color: "bg-blue-500" },
                        { status: "blocked", label: "Blocked", count: roadmapData.analytics.blockedMilestones, color: "bg-red-500" },
                        { status: "not-started", label: "Not Started", count: roadmapData.analytics.notStartedMilestones, color: "bg-gray-500" }
                      ].map((item) => {
                        const percentage = Math.round((item.count / roadmapData.analytics.totalMilestones) * 100) || 0;
                        return (
                          <div key={item.status} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{item.label}</span>
                              <span className="font-medium">{item.count}</span>
                            </div>
                            <Progress value={percentage} className={`h-2 ${item.color}`} />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline Performance - DYNAMIC */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Timer className="w-4 h-4" />
                      Timeline Performance
                    </CardTitle>
                    <CardDescription>Deadline tracking metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-50 p-3 rounded text-center">
                          <p className="text-xs text-green-600">On Time</p>
                          <p className="text-xl font-bold text-green-700">{roadmapData.analytics.completedOnTime}</p>
                        </div>
                        <div className="bg-red-50 p-3 rounded text-center">
                          <p className="text-xs text-red-600">Late</p>
                          <p className="text-xl font-bold text-red-700">{roadmapData.analytics.completedLate}</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-orange-50 p-3 rounded text-center">
                          <p className="text-xs text-orange-600">Overdue</p>
                          <p className="text-xl font-bold text-orange-700">{roadmapData.analytics.overdueMilestones}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded text-center">
                          <p className="text-xs text-blue-600">Upcoming</p>
                          <p className="text-xl font-bold text-blue-700">{roadmapData.analytics.upcomingDeadlines}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Task Completion - DYNAMIC */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4" />
                      Task Completion Overview
                    </CardTitle>
                    <CardDescription>
                      {roadmapData.analytics.tasksCompleted} of {roadmapData.analytics.totalTasks} tasks completed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Progress 
                        value={(roadmapData.analytics.tasksCompleted / roadmapData.analytics.totalTasks) * 100} 
                        className="h-3" 
                      />
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-green-600">{roadmapData.analytics.tasksCompleted}</p>
                          <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-blue-600">
                            {roadmapData.analytics.totalTasks - roadmapData.analytics.tasksCompleted}
                          </p>
                          <p className="text-xs text-muted-foreground">Remaining</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-primary">
                            {Math.round((roadmapData.analytics.tasksCompleted / roadmapData.analytics.totalTasks) * 100) || 0}%
                          </p>
                          <p className="text-xs text-muted-foreground">Completion Rate</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Insights Card - DYNAMIC */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Progress Insights & Recommendations
                  </CardTitle>
                  <CardDescription>AI-powered analysis of your roadmap progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-primary/5 rounded">
                      <p className="text-2xl font-bold text-primary">{roadmapData.analytics.averageProgress}%</p>
                      <p className="text-sm">Average Progress</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded">
                      <p className="text-2xl font-bold text-green-600">{roadmapData.analytics.completedMilestones}</p>
                      <p className="text-sm">Completed</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded">
                      <p className="text-2xl font-bold text-blue-600">{roadmapData.analytics.inProgressMilestones}</p>
                      <p className="text-sm">In Progress</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Smart Recommendations</h4>
                    <div className="space-y-2">
                      {roadmapData.analytics.blockedMilestones > 0 && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 rounded border border-red-200">
                          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-800">🚨 Address Blocked Milestones</p>
                            <p className="text-xs text-red-700">
                              You have {roadmapData.analytics.blockedMilestones} blocked milestone
                              {roadmapData.analytics.blockedMilestones > 1 ? "s" : ""} that need immediate attention.
                              {roadmapData.analytics.blockedMilestones > 0 && " Schedule a team sync to unblock them."}
                            </p>
                          </div>
                        </div>
                      )}

                      {roadmapData.analytics.overdueMilestones > 0 && (
                        <div className="flex items-start gap-2 p-3 bg-orange-50 rounded border border-orange-200">
                          <Clock className="w-4 h-4 text-orange-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-orange-800">⚠️ Overdue Milestones</p>
                            <p className="text-xs text-orange-700">
                              {roadmapData.analytics.overdueMilestones} milestone
                              {roadmapData.analytics.overdueMilestones > 1 ? "s are" : " is"} past due date.
                              Prioritize these to get back on track.
                            </p>
                          </div>
                        </div>
                      )}

                      {roadmapData.analytics.upcomingDeadlines > 0 && (
                        <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded border border-yellow-200">
                          <Calendar className="w-4 h-4 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">📅 Upcoming Deadlines</p>
                            <p className="text-xs text-yellow-700">
                              {roadmapData.analytics.upcomingDeadlines} milestone
                              {roadmapData.analytics.upcomingDeadlines > 1 ? "s have" : " has"} deadlines in the next 14 days.
                              Make sure resources are allocated.
                            </p>
                          </div>
                        </div>
                      )}

                      {roadmapData.analytics.criticalMilestones > 0 && roadmapData.analytics.inProgressMilestones === 0 && (
                        <div className="flex items-start gap-2 p-3 bg-purple-50 rounded border border-purple-200">
                          <Target className="w-4 h-4 text-purple-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-purple-800">🎯 Critical Path Items</p>
                            <p className="text-xs text-purple-700">
                              You have {roadmapData.analytics.criticalMilestones} critical milestone
                              {roadmapData.analytics.criticalMilestones > 1 ? "s" : ""} not started.
                              These should be your top priority.
                            </p>
                          </div>
                        </div>
                      )}

                      {roadmapData.analytics.completedOnTime < roadmapData.analytics.completedMilestones * 0.7 && roadmapData.analytics.completedMilestones > 0 && (
                        <div className="flex items-start gap-2 p-3 bg-indigo-50 rounded border border-indigo-200">
                          <TrendingUp className="w-4 h-4 text-indigo-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-indigo-800">📊 Timeline Accuracy</p>
                            <p className="text-xs text-indigo-700">
                              Only {Math.round((roadmapData.analytics.completedOnTime / roadmapData.analytics.completedMilestones) * 100)}% of milestones completed on time.
                              Consider more realistic deadline setting.
                            </p>
                          </div>
                        </div>
                      )}

                      {roadmapData.analytics.averageProgress > 75 && (
                        <div className="flex items-start gap-2 p-3 bg-green-50 rounded border border-green-200">
                          <Rocket className="w-4 h-4 text-green-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-green-800">🚀 Great Progress!</p>
                            <p className="text-xs text-green-700">
                              You're making excellent progress ({roadmapData.analytics.averageProgress}% complete).
                              Time to plan the next phase of your roadmap!
                            </p>
                          </div>
                        </div>
                      )}

                      {roadmapData.analytics.notStartedMilestones > roadmapData.analytics.totalMilestones * 0.5 && (
                        <div className="flex items-start gap-2 p-3 bg-gray-50 rounded border border-gray-200">
                          <Clock className="w-4 h-4 text-gray-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">⏳ Getting Started</p>
                            <p className="text-xs text-gray-700">
                              You have {roadmapData.analytics.notStartedMilestones} milestones not started.
                              Focus on breaking down the first few into actionable tasks.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Add Milestone Modal */}
      <Dialog open={isAddingMilestone} onOpenChange={setIsAddingMilestone}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Milestone</DialogTitle>
            <DialogDescription>Create a new milestone to track your startup progress.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Milestone Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Launch Beta Version"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this milestone involves..."
                value={newMilestone.description}
                onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
  value={newMilestone.priority}
  onValueChange={(value: any) => setNewMilestone({ ...newMilestone, priority: value })}
>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="low">Low</SelectItem>
    <SelectItem value="medium">Medium</SelectItem>
    <SelectItem value="high">High</SelectItem>
    <SelectItem value="critical">Critical</SelectItem>
  </SelectContent>
</Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={newMilestone.priority}
                  onValueChange={(value: any) => setNewMilestone({ ...newMilestone, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={newMilestone.dueDate}
                  onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Timeline Phase</Label>
                <Select
  value={newMilestone.phaseId}
  onValueChange={(value) => setNewMilestone({ ...newMilestone, phaseId: value })}
>
  <SelectTrigger>
    <SelectValue placeholder="Select phase" />
  </SelectTrigger>
  <SelectContent>
    {roadmapData.timeline.map(phase => (
      <SelectItem key={phase.id} value={phase.id}>{phase.name}</SelectItem>
    ))}
  </SelectContent>
</Select>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={addMilestone} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Add Milestone
              </Button>
              <Button variant="outline" onClick={() => setIsAddingMilestone(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Task Modal */}
      <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Add a task to the milestone.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Task Title *</Label>
              <Input
                placeholder="e.g., Complete user research"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
  value={newTask.priority}
  onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="low">Low</SelectItem>
    <SelectItem value="medium">Medium</SelectItem>
    <SelectItem value="high">High</SelectItem>
  </SelectContent>
</Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={addTask} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
              <Button variant="outline" onClick={() => setIsAddingTask(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Milestone Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Milestone</DialogTitle>
          </DialogHeader>
          {editingMilestone && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editingMilestone.title}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingMilestone.description}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
  value={editingMilestone.category}
  onValueChange={(value: any) => setEditingMilestone({ ...editingMilestone, category: value })}
>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="product">Product</SelectItem>
    <SelectItem value="business">Business</SelectItem>
    <SelectItem value="funding">Funding</SelectItem>
    <SelectItem value="team">Team</SelectItem>
    <SelectItem value="legal">Legal</SelectItem>
  </SelectContent>
</Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
  value={editingMilestone.priority}
  onValueChange={(value: any) => setEditingMilestone({ ...editingMilestone, priority: value })}
>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="low">Low</SelectItem>
    <SelectItem value="medium">Medium</SelectItem>
    <SelectItem value="high">High</SelectItem>
    <SelectItem value="critical">Critical</SelectItem>
  </SelectContent>
</Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={editingMilestone.dueDate}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, dueDate: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={saveMilestoneEdit} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog open={showEditTaskModal} onOpenChange={setShowEditTaskModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Task Title</Label>
                <Input
                  value={editingTask.task.title}
                  onChange={(e) => setEditingTask({
                    ...editingTask,
                    task: { ...editingTask.task, title: e.target.value }
                  })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
  value={editingTask.task.priority || "medium"}
  onValueChange={(value: any) => setEditingTask({
    ...editingTask,
    task: { ...editingTask.task, priority: value }
  })}
>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="low">Low</SelectItem>
    <SelectItem value="medium">Medium</SelectItem>
    <SelectItem value="high">High</SelectItem>
  </SelectContent>
</Select>
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={editingTask.task.dueDate || ""}
                    onChange={(e) => setEditingTask({
                      ...editingTask,
                      task: { ...editingTask.task, dueDate: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={saveTaskEdit} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setShowEditTaskModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}