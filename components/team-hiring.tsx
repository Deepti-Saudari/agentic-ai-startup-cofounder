"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Users, RefreshCw, Briefcase, Target, Award,
  Calendar, Clock, CheckCircle, Zap, Sparkles,
  BarChart, PieChart, MessageCircle, Video, BookOpen,
  Rocket, Heart, Star, Flag, Filter, Layers,
  AlertCircle, DollarSign, Mail, Phone, MapPin,
  ExternalLink, Github, Linkedin, Twitter,
  PlusCircle, XCircle, Edit, Trash2, UserPlus,
  TrendingUp, Building, Globe, Network,
  Download, Share2, Code, PenTool, Megaphone,
  BarChart3, LineChart, PieChart as PieChartIcon,
  Smartphone, Laptop, Cloud, Shield, Key,
  Brain, Cpu, Database, Server, GitBranch,
  Users2, MessageSquare, ThumbsUp, HeartHandshake,
  Lightbulb, Sparkles as SparklesIcon, Settings, Save,
  ChevronDown, ChevronUp, Plus, Minus, Pencil
} from "lucide-react"
import { getApiUrl } from "@/lib/api"

// ============= INTERFACES =============
interface Skill {
  name: string;
  category: "Technical" | "Soft" | "Domain" | "Tools" | "Industry";
  importance: "Critical" | "Important" | "Nice to have";
  roles: string[];
  icon?: React.ReactNode;
}

interface TeamRole {
  id: string;
  title: string;
  department: "Engineering" | "Product" | "Design" | "Marketing" | "Sales" | "Operations" | "Leadership";
  seniority: "Entry" | "Mid" | "Senior" | "Lead" | "Head";
  salary_range: string;
  equity_range: string;
  hiring_timeline: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "Interviewing" | "Offer" | "Filled";
  description: string;
  requirements: string[];
  candidates?: Candidate[];
}

interface Candidate {
  id: string;
  name: string;
  role: string;
  experience: string;
  current_company?: string;
  match_score: number;
  status: "Applied" | "Screening" | "Interview" | "Offer" | "Hired" | "Rejected";
  interview_stage: number;
  total_stages: number;
  avatar?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
}

interface HiringPlan {
  phase: string;
  activities: string[];
  timeline: string;
  budget: string;
  status: "Not Started" | "In Progress" | "Completed";
}

interface TeamMetrics {
  total_headcount: number;
  current_headcount: number;
  open_positions: number;
  avg_time_to_hire: string;
  monthly_burn_rate: string;
  hiring_efficiency: number;
  cost_per_hire: string;
  target_hire_date?: string;
  monthly_hiring_goal?: number;
}

interface OrgRole {
  title: string;
  count: number;
  filled: number;
  reports_to?: string;
}

interface Department {
  department: string;
  roles: OrgRole[];
}

interface TeamPlan {
  startup_idea: string;
  industry: string;
  stage: string;
  key_roles: TeamRole[];
  candidates: Candidate[];
  hiring_plan: HiringPlan[];
  skills_required: Skill[];
  team_structure: Department[];
  metrics: TeamMetrics;
  last_updated?: string;
}

// ============= MAIN COMPONENT =============
export function TeamHiring() {
  const [startupIdea, setStartupIdea] = useState("")
  const [industry, setIndustry] = useState("")
  const [stage, setStage] = useState<"Idea" | "Pre-seed" | "Seed" | "Series A" | "Series B">("Seed")
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasPlan, setHasPlan] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditingMetrics, setIsEditingMetrics] = useState(false)
  const [isEditingStructure, setIsEditingStructure] = useState(false)
  const [expandedDepts, setExpandedDepts] = useState<string[]>([])
  
  // Hiring modal state
  const [showHiringModal, setShowHiringModal] = useState(false)
  const [selectedRoleForHiring, setSelectedRoleForHiring] = useState<TeamRole | null>(null)
  const [candidateName, setCandidateName] = useState("")
  const [candidateEmail, setCandidateEmail] = useState("")
  const [candidateExperience, setCandidateExperience] = useState("")
  
  // User-input metrics
  const [userMetrics, setUserMetrics] = useState<TeamMetrics>({
    total_headcount: 25,
    current_headcount: 5,
    open_positions: 20,
    avg_time_to_hire: "45 days",
    monthly_burn_rate: "$120,000",
    hiring_efficiency: 68,
    cost_per_hire: "$8,500",
    target_hire_date: "2024-12-31",
    monthly_hiring_goal: 4
  })

  // Interactive states
  const [selectedRole, setSelectedRole] = useState<TeamRole | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [showCandidateModal, setShowCandidateModal] = useState(false)
  const [filterDepartment, setFilterDepartment] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("")

  const [plan, setPlan] = useState<TeamPlan>({
    startup_idea: "",
    industry: "",
    stage: "Seed",
    key_roles: [],
    candidates: [],
    hiring_plan: [],
    skills_required: [],
    team_structure: [],
    metrics: userMetrics,
    last_updated: undefined
  })

  // Update metrics when userMetrics changes
  useEffect(() => {
    if (hasPlan) {
      setPlan(prev => ({
        ...prev,
        metrics: userMetrics
      }))
    }
  }, [userMetrics, hasPlan])

  const filteredRoles = plan.key_roles.filter((role: TeamRole) => {
    if (filterDepartment && role.department !== filterDepartment) return false;
    if (filterStatus && role.status !== filterStatus) return false;
    return true;
  });

  const handleMetricChange = (field: keyof TeamMetrics, value: string) => {
    setUserMetrics(prev => ({
      ...prev,
      [field]: field === 'total_headcount' || field === 'current_headcount' || field === 'open_positions' || field === 'hiring_efficiency' || field === 'monthly_hiring_goal'
        ? Number(value) || 0
        : value
    }))
  }

  const saveMetrics = () => {
    setIsEditingMetrics(false)
  }

  // Toggle department expansion
  const toggleDepartment = (deptName: string) => {
    setExpandedDepts(prev => 
      prev.includes(deptName) 
        ? prev.filter(d => d !== deptName)
        : [...prev, deptName]
    )
  }

  // Update role count in structure
  const updateRoleCount = (deptIndex: number, roleIndex: number, newCount: number) => {
    if (newCount < 0) return
    
    setPlan(prev => {
      const updated = { ...prev }
      if (updated.team_structure[deptIndex]?.roles[roleIndex]) {
        updated.team_structure[deptIndex].roles[roleIndex].count = newCount
        // Update open positions
        const totalHeadcount = updated.team_structure.reduce((acc, dept) => 
          acc + dept.roles.reduce((sum, role) => sum + role.count, 0), 0
        )
        const currentHeadcount = updated.team_structure.reduce((acc, dept) => 
          acc + dept.roles.reduce((sum, role) => sum + role.filled, 0), 0
        )
        updated.metrics = {
          ...updated.metrics,
          total_headcount: totalHeadcount,
          current_headcount: currentHeadcount,
          open_positions: totalHeadcount - currentHeadcount
        }
      }
      return updated
    })
  }

  // Update filled count in structure
  const updateFilledCount = (deptIndex: number, roleIndex: number, newFilled: number) => {
    if (newFilled < 0) return
    
    setPlan(prev => {
      const updated = { ...prev }
      if (updated.team_structure[deptIndex]?.roles[roleIndex]) {
        const role = updated.team_structure[deptIndex].roles[roleIndex]
        if (newFilled <= role.count) {
          role.filled = newFilled
          // Update open positions
          const totalHeadcount = updated.team_structure.reduce((acc, dept) => 
            acc + dept.roles.reduce((sum, role) => sum + role.count, 0), 0
          )
          const currentHeadcount = updated.team_structure.reduce((acc, dept) => 
            acc + dept.roles.reduce((sum, role) => sum + role.filled, 0), 0
          )
          updated.metrics = {
            ...updated.metrics,
            total_headcount: totalHeadcount,
            current_headcount: currentHeadcount,
            open_positions: totalHeadcount - currentHeadcount
          }
        }
      }
      return updated
    })
  }

  // Add new role to department
  const addRole = (deptIndex: number) => {
    const newRole: OrgRole = {
      title: "New Role",
      count: 1,
      filled: 0,
      reports_to: "CEO"
    }
    
    setPlan(prev => {
      const updated = { ...prev }
      updated.team_structure[deptIndex].roles.push(newRole)
      return updated
    })
  }

  // Delete role
  const deleteRole = (deptIndex: number, roleIndex: number) => {
    setPlan(prev => {
      const updated = { ...prev }
      updated.team_structure[deptIndex].roles.splice(roleIndex, 1)
      return updated
    })
  }

  // Update role title
  const updateRoleTitle = (deptIndex: number, roleIndex: number, newTitle: string) => {
    setPlan(prev => {
      const updated = { ...prev }
      if (updated.team_structure[deptIndex]?.roles[roleIndex]) {
        updated.team_structure[deptIndex].roles[roleIndex].title = newTitle
      }
      return updated
    })
  }

  // Start hiring process
  const startHiring = (role: TeamRole) => {
    setSelectedRoleForHiring(role)
    setShowHiringModal(true)
  }

  // Submit new candidate
  const submitCandidate = () => {
    if (!selectedRoleForHiring || !candidateName || !candidateEmail) return
    
    const newCandidate: Candidate = {
      id: `cand-${Date.now()}`,
      name: candidateName,
      role: selectedRoleForHiring.title,
      experience: candidateExperience || "Not specified",
      match_score: Math.floor(Math.random() * 30) + 70, // Random score between 70-99
      status: "Applied",
      interview_stage: 0,
      total_stages: 4,
      email: candidateEmail
    }
    
    setPlan(prev => ({
      ...prev,
      candidates: [...prev.candidates, newCandidate],
      key_roles: prev.key_roles.map(role => 
        role.id === selectedRoleForHiring.id
          ? { ...role, candidates: [...(role.candidates || []), newCandidate] }
          : role
      )
    }))
    
    // Reset and close modal
    setCandidateName("")
    setCandidateEmail("")
    setCandidateExperience("")
    setShowHiringModal(false)
    setSelectedRoleForHiring(null)
  }

  const generateTeamPlan = async () => {
    if (!startupIdea || !industry) {
      alert("Please enter both startup idea and industry");
      return;
    }

    setIsGenerating(true);
    setHasPlan(false);
    setError(null);

    try {
      const response = await fetch(getApiUrl("/team-hiring"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          startup_idea: startupIdea,
          industry: industry
        })
      });

      const data = await response.json();
      
      if (data.team_plan) {
        const completePlan = generateCompletePlan(data.team_plan);
        setPlan(completePlan);
        setHasPlan(true);
      }
      
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to generate team plan');
      
      const demoData = getDemoTeamData();
      const completePlan = generateCompletePlan(demoData);
      setPlan(completePlan);
      setHasPlan(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCompletePlan = (simplePlan: any): TeamPlan => {
    const timestamp = Date.now();
    
    // Detailed roles with complete data
    const roles: TeamRole[] = [
      {
        id: `role-1-${timestamp}`,
        title: "CTO / Head of Engineering",
        department: "Leadership",
        seniority: "Head",
        salary_range: "$150K - $200K",
        equity_range: "5-10%",
        hiring_timeline: "Immediate",
        priority: "Critical",
        status: "Interviewing",
        description: "Lead technical vision and engineering team. Architect scalable solutions.",
        requirements: [
          "10+ years software development",
          "5+ years in leadership",
          "Experience scaling teams",
          "Strong system design skills",
          "Cloud architecture expertise"
        ],
        candidates: [
          {
            id: `cand-1-${timestamp}`,
            name: "Sarah Chen",
            role: "CTO",
            experience: "12 years",
            current_company: "Tech Corp",
            match_score: 92,
            status: "Interview",
            interview_stage: 2,
            total_stages: 4,
            email: "sarah.chen@email.com",
            linkedin: "sarahchen",
            github: "sarahchen"
          }
        ]
      },
      {
        id: `role-2-${timestamp}`,
        title: "Lead Product Manager",
        department: "Product",
        seniority: "Lead",
        salary_range: "$130K - $170K",
        equity_range: "2-5%",
        hiring_timeline: "Month 1-2",
        priority: "High",
        status: "Open",
        description: "Define product vision and roadmap. Work closely with engineering and design.",
        requirements: [
          "7+ years product management",
          "Experience in B2B SaaS",
          "Strong user research skills",
          "Data-driven decision making",
          "Go-to-market experience"
        ],
        candidates: [
          {
            id: `cand-2-${timestamp}`,
            name: "Michael Rodriguez",
            role: "Product Manager",
            experience: "8 years",
            current_company: "Startup Inc",
            match_score: 85,
            status: "Screening",
            interview_stage: 1,
            total_stages: 4,
            email: "michael.r@email.com",
            linkedin: "mrodriguez"
          }
        ]
      },
      {
        id: `role-3-${timestamp}`,
        title: "Senior Full Stack Engineer",
        department: "Engineering",
        seniority: "Senior",
        salary_range: "$120K - $160K",
        equity_range: "1-2%",
        hiring_timeline: "Month 1-3",
        priority: "Critical",
        status: "Open",
        description: "Build core product features. Full stack development with modern tech stack.",
        requirements: [
          "5+ years full stack development",
          "React, Node.js, TypeScript",
          "Experience with cloud platforms",
          "Database design",
          "API development"
        ],
        candidates: [
          {
            id: `cand-3-${timestamp}`,
            name: "Jennifer Park",
            role: "Full Stack Engineer",
            experience: "6 years",
            current_company: "Dev Co",
            match_score: 78,
            status: "Applied",
            interview_stage: 0,
            total_stages: 4,
            email: "jennifer.p@email.com",
            github: "jenniferpark"
          },
          {
            id: `cand-4-${timestamp}`,
            name: "David Kumar",
            role: "Full Stack Engineer",
            experience: "5 years",
            current_company: "Tech Solutions",
            match_score: 88,
            status: "Interview",
            interview_stage: 3,
            total_stages: 4,
            email: "david.k@email.com",
            github: "davidkumar"
          }
        ]
      },
      {
        id: `role-4-${timestamp}`,
        title: "Lead Product Designer",
        department: "Design",
        seniority: "Lead",
        salary_range: "$110K - $150K",
        equity_range: "1-3%",
        hiring_timeline: "Month 2-3",
        priority: "High",
        status: "Open",
        description: "Own product design system and user experience.",
        requirements: [
          "6+ years product design",
          "Experience with Figma",
          "User research expertise",
          "Design systems",
          "Portfolio of shipped products"
        ]
      },
      {
        id: `role-5-${timestamp}`,
        title: "Marketing Lead",
        department: "Marketing",
        seniority: "Lead",
        salary_range: "$100K - $140K",
        equity_range: "1-2%",
        hiring_timeline: "Month 3-4",
        priority: "Medium",
        status: "Open",
        description: "Develop go-to-market strategy and lead marketing efforts.",
        requirements: [
          "5+ years B2B marketing",
          "Content marketing expertise",
          "Experience with product launches",
          "Analytics and ROI focus",
          "Team management"
        ]
      }
    ];

    // All candidates
    const candidates: Candidate[] = [
      {
        id: `cand-1-${timestamp}`,
        name: "Sarah Chen",
        role: "CTO",
        experience: "12 years",
        current_company: "Tech Corp",
        match_score: 92,
        status: "Interview",
        interview_stage: 2,
        total_stages: 4,
        email: "sarah.chen@email.com",
        linkedin: "sarahchen",
        github: "sarahchen"
      },
      {
        id: `cand-2-${timestamp}`,
        name: "Michael Rodriguez",
        role: "Product Manager",
        experience: "8 years",
        current_company: "Startup Inc",
        match_score: 85,
        status: "Screening",
        interview_stage: 1,
        total_stages: 4,
        email: "michael.r@email.com",
        linkedin: "mrodriguez"
      },
      {
        id: `cand-3-${timestamp}`,
        name: "Jennifer Park",
        role: "Full Stack Engineer",
        experience: "6 years",
        current_company: "Dev Co",
        match_score: 78,
        status: "Applied",
        interview_stage: 0,
        total_stages: 4,
        email: "jennifer.p@email.com",
        github: "jenniferpark"
      },
      {
        id: `cand-4-${timestamp}`,
        name: "David Kumar",
        role: "Full Stack Engineer",
        experience: "5 years",
        current_company: "Tech Solutions",
        match_score: 88,
        status: "Interview",
        interview_stage: 3,
        total_stages: 4,
        email: "david.k@email.com",
        github: "davidkumar"
      },
      {
        id: `cand-5-${timestamp}`,
        name: "Lisa Wong",
        role: "Product Designer",
        experience: "7 years",
        current_company: "Design Studio",
        match_score: 82,
        status: "Offer",
        interview_stage: 4,
        total_stages: 4,
        email: "lisa.w@email.com",
        linkedin: "lisawong"
      }
    ];

    // Skills with complete data
    const skills: Skill[] = [
      // Technical Skills
      {
        name: "Full Stack Development",
        category: "Technical",
        importance: "Critical",
        roles: ["CTO", "Senior Engineer", "Full Stack Engineer"],
        icon: <Code className="w-4 h-4" />
      },
      {
        name: "System Architecture",
        category: "Technical",
        importance: "Critical",
        roles: ["CTO", "Lead Engineer"],
        icon: <Cpu className="w-4 h-4" />
      },
      {
        name: "Cloud Infrastructure",
        category: "Technical",
        importance: "Important",
        roles: ["Engineers", "DevOps"],
        icon: <Cloud className="w-4 h-4" />
      },
      {
        name: "Database Design",
        category: "Technical",
        importance: "Important",
        roles: ["Backend Engineers"],
        icon: <Database className="w-4 h-4" />
      },
      {
        name: "API Development",
        category: "Technical",
        importance: "Important",
        roles: ["Backend Engineers"],
        icon: <GitBranch className="w-4 h-4" />
      },
      {
        name: "Frontend Development",
        category: "Technical",
        importance: "Important",
        roles: ["Frontend Engineers"],
        icon: <Laptop className="w-4 h-4" />
      },
      // Soft Skills
      {
        name: "Leadership",
        category: "Soft",
        importance: "Critical",
        roles: ["All leadership roles"],
        icon: <Users2 className="w-4 h-4" />
      },
      {
        name: "Communication",
        category: "Soft",
        importance: "Critical",
        roles: ["All roles"],
        icon: <MessageSquare className="w-4 h-4" />
      },
      {
        name: "Team Collaboration",
        category: "Soft",
        importance: "Critical",
        roles: ["All roles"],
        icon: <HeartHandshake className="w-4 h-4" />
      },
      {
        name: "Problem Solving",
        category: "Soft",
        importance: "Critical",
        roles: ["All roles"],
        icon: <Brain className="w-4 h-4" />
      },
      // Domain Skills
      {
        name: "Product Strategy",
        category: "Domain",
        importance: "Critical",
        roles: ["Product Manager", "CTO", "CEO"],
        icon: <Target className="w-4 h-4" />
      },
      {
        name: "User Research",
        category: "Domain",
        importance: "Important",
        roles: ["Product Manager", "Designer"],
        icon: <Users className="w-4 h-4" />
      },
      // Tools
      {
        name: "Figma",
        category: "Tools",
        importance: "Important",
        roles: ["Designers"],
        icon: <PenTool className="w-4 h-4" />
      },
      {
        name: "JIRA / Linear",
        category: "Tools",
        importance: "Important",
        roles: ["All roles"],
        icon: <CheckCircle className="w-4 h-4" />
      },
      {
        name: "Git / GitHub",
        category: "Tools",
        importance: "Important",
        roles: ["Engineers"],
        icon: <Github className="w-4 h-4" />
      },
      // Industry Specific
      {
        name: "AI/ML Knowledge",
        category: "Industry",
        importance: "Important",
        roles: ["Engineers", "Product"],
        icon: <Brain className="w-4 h-4" />
      },
      {
        name: "SaaS Business Models",
        category: "Industry",
        importance: "Important",
        roles: ["All roles"],
        icon: <Cloud className="w-4 h-4" />
      }
    ];

    // Hiring plan phases
    const hiringPlan: HiringPlan[] = [
      {
        phase: "Phase 1: Leadership & Core Team",
        activities: [
          "Hire CTO/Head of Engineering",
          "Hire Lead Product Manager",
          "Define engineering culture",
          "Set up hiring infrastructure"
        ],
        timeline: "Months 1-2",
        budget: "$50K - $80K",
        status: "In Progress"
      },
      {
        phase: "Phase 2: Engineering Team",
        activities: [
          "Hire 2-3 Senior Engineers",
          "Hire Lead Designer",
          "Establish development processes",
          "Begin candidate sourcing"
        ],
        timeline: "Months 3-4",
        budget: "$120K - $180K",
        status: "Not Started"
      },
      {
        phase: "Phase 3: Product & Design",
        activities: [
          "Hire Product Designers",
          "Hire QA Engineers",
          "Scale product team",
          "Build design system"
        ],
        timeline: "Months 5-6",
        budget: "$100K - $150K",
        status: "Not Started"
      },
      {
        phase: "Phase 4: Go-to-Market Team",
        activities: [
          "Hire Marketing Lead",
          "Hire Sales Development",
          "Build customer success team",
          "Scale operations"
        ],
        timeline: "Months 7-9",
        budget: "$150K - $200K",
        status: "Not Started"
      }
    ];

    // Team structure - EDITABLE
    const teamStructure: Department[] = [
      {
        department: "Leadership",
        roles: [
          { title: "CEO/Founder", count: 1, filled: 1, reports_to: "Board" },
          { title: "CTO", count: 1, filled: 0, reports_to: "CEO" },
          { title: "Head of Product", count: 1, filled: 0, reports_to: "CEO" },
          { title: "Head of Marketing", count: 1, filled: 0, reports_to: "CEO" }
        ]
      },
      {
        department: "Engineering",
        roles: [
          { title: "Senior Engineers", count: 3, filled: 0, reports_to: "CTO" },
          { title: "Full Stack Engineers", count: 4, filled: 0, reports_to: "CTO" },
          { title: "Frontend Engineers", count: 2, filled: 0, reports_to: "CTO" },
          { title: "Backend Engineers", count: 2, filled: 0, reports_to: "CTO" },
          { title: "QA Engineers", count: 2, filled: 0, reports_to: "CTO" },
          { title: "DevOps Engineers", count: 1, filled: 0, reports_to: "CTO" }
        ]
      },
      {
        department: "Product",
        roles: [
          { title: "Product Managers", count: 2, filled: 0, reports_to: "Head of Product" },
          { title: "Product Designers", count: 2, filled: 0, reports_to: "Head of Product" },
          { title: "UX Researchers", count: 1, filled: 0, reports_to: "Head of Product" }
        ]
      },
      {
        department: "Design",
        roles: [
          { title: "Lead Designer", count: 1, filled: 0, reports_to: "Head of Product" },
          { title: "UI Designers", count: 2, filled: 0, reports_to: "Lead Designer" },
          { title: "UX Designers", count: 2, filled: 0, reports_to: "Lead Designer" }
        ]
      },
      {
        department: "Marketing & Sales",
        roles: [
          { title: "Marketing Lead", count: 1, filled: 0, reports_to: "Head of Marketing" },
          { title: "Content Marketer", count: 2, filled: 0, reports_to: "Marketing Lead" },
          { title: "Sales Development", count: 3, filled: 0, reports_to: "Marketing Lead" },
          { title: "Customer Success", count: 2, filled: 0, reports_to: "Marketing Lead" }
        ]
      },
      {
        department: "Operations",
        roles: [
          { title: "Operations Manager", count: 1, filled: 0, reports_to: "CEO" },
          { title: "HR/Recruiting", count: 2, filled: 0, reports_to: "CEO" }
        ]
      }
    ];

    return {
      startup_idea: startupIdea,
      industry: industry,
      stage: stage,
      key_roles: roles,
      candidates: candidates,
      hiring_plan: hiringPlan,
      skills_required: skills,
      team_structure: teamStructure,
      metrics: userMetrics,
      last_updated: new Date().toISOString()
    };
  };

  const getDemoTeamData = () => {
    return {
      key_roles: ["CTO", "Lead Product Manager", "Senior Engineer", "Lead Designer", "Marketing Lead"],
      hiring_plan: ["Hire leadership", "Build engineering team", "Add product team", "Scale marketing"],
      skills_required: ["Technical", "Leadership", "Product", "Design"],
      team_structure: ["Flat organization", "Cross-functional teams", "Engineering-led", "Design-driven"]
    };
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Filled":
      case "Hired":
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200 font-medium";
      case "Interviewing":
      case "Interview":
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200 font-medium";
      case "Offer":
        return "bg-purple-100 text-purple-800 border-purple-200 font-medium";
      case "Open":
      case "Applied":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 font-medium";
      case "Screening":
        return "bg-orange-100 text-orange-800 border-orange-200 font-medium";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 font-medium";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "Critical": return "bg-red-100 text-red-800 border-red-200 font-medium";
      case "High": return "bg-orange-100 text-orange-800 border-orange-200 font-medium";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200 font-medium";
      case "Low": return "bg-green-100 text-green-800 border-green-200 font-medium";
      default: return "bg-gray-100 text-gray-800 border-gray-200 font-medium";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team & Hiring Planner</h1>
          <p className="text-muted-foreground">
            Plan your startup team structure, track candidates, and manage your hiring pipeline
          </p>
        </div>
        {hasPlan && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Org Chart
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share with Recruiters
            </Button>
          </div>
        )}
      </div>

      {/* Input Section */}
      <Card className="border-2 border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Users className="w-6 h-6 text-primary" />
            Team Planning Profile
          </CardTitle>
          <CardDescription>
            Tell us about your startup to generate a comprehensive hiring plan
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="idea" className="text-sm font-medium">Startup Idea</Label>
              <Input
                id="idea"
                placeholder="e.g., AI-powered code review platform"
                value={startupIdea}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartupIdea(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry" className="text-sm font-medium">Industry</Label>
              <Input
                id="industry"
                placeholder="e.g., Developer Tools, AI/ML"
                value={industry}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIndustry(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stage" className="text-sm font-medium">Current Stage</Label>
              <select
                id="stage"
                value={stage}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStage(e.target.value as any)}
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="Idea">Idea / Pre-seed</option>
                <option value="Pre-seed">Pre-seed</option>
                <option value="Seed">Seed</option>
                <option value="Series A">Series A</option>
                <option value="Series B">Series B</option>
              </select>
            </div>
          </div>

          <Button 
            onClick={generateTeamPlan} 
            disabled={isGenerating} 
            size="lg"
            className="mt-6 w-full md:w-auto"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating Team Plan...
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Generate Hiring Plan
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

      {/* Results */}
      {hasPlan && (
        <div className="space-y-6">
          {/* Team Metrics Input Section */}
          <Card className="border-2 border-primary/10 bg-primary/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Team Metrics Configuration
                </CardTitle>
                <div className="flex gap-2">
                  {isEditingMetrics ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => setIsEditingMetrics(false)}>
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={saveMetrics}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Metrics
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setIsEditingMetrics(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Metrics
                    </Button>
                  )}
                </div>
              </div>
              <CardDescription>
                Set your team's current and target metrics to track progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {isEditingMetrics ? (
                  // Editable inputs
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs">Total Headcount</Label>
                      <Input
                        type="number"
                        value={userMetrics.total_headcount}
                        onChange={(e) => handleMetricChange('total_headcount', e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Current Team</Label>
                      <Input
                        type="number"
                        value={userMetrics.current_headcount}
                        onChange={(e) => handleMetricChange('current_headcount', e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Open Positions</Label>
                      <Input
                        type="number"
                        value={userMetrics.open_positions}
                        onChange={(e) => handleMetricChange('open_positions', e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Avg Time to Hire</Label>
                      <Input
                        value={userMetrics.avg_time_to_hire}
                        onChange={(e) => handleMetricChange('avg_time_to_hire', e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Monthly Burn Rate</Label>
                      <Input
                        value={userMetrics.monthly_burn_rate}
                        onChange={(e) => handleMetricChange('monthly_burn_rate', e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Hiring Efficiency (%)</Label>
                      <Input
                        type="number"
                        value={userMetrics.hiring_efficiency}
                        onChange={(e) => handleMetricChange('hiring_efficiency', e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Cost per Hire</Label>
                      <Input
                        value={userMetrics.cost_per_hire}
                        onChange={(e) => handleMetricChange('cost_per_hire', e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Monthly Hiring Goal</Label>
                      <Input
                        type="number"
                        value={userMetrics.monthly_hiring_goal}
                        onChange={(e) => handleMetricChange('monthly_hiring_goal', e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </>
                ) : (
                  // Display mode
                  <>
                    <div className="bg-white p-3 rounded-lg shadow-sm border">
                      <p className="text-xs text-muted-foreground">Total Headcount</p>
                      <p className="text-2xl font-bold">{userMetrics.total_headcount}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border">
                      <p className="text-xs text-muted-foreground">Current Team</p>
                      <p className="text-2xl font-bold">{userMetrics.current_headcount}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border">
                      <p className="text-xs text-muted-foreground">Open Positions</p>
                      <p className="text-2xl font-bold">{userMetrics.open_positions}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border">
                      <p className="text-xs text-muted-foreground">Avg Time to Hire</p>
                      <p className="text-2xl font-bold">{userMetrics.avg_time_to_hire}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border">
                      <p className="text-xs text-muted-foreground">Monthly Burn</p>
                      <p className="text-2xl font-bold">{userMetrics.monthly_burn_rate}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border">
                      <p className="text-xs text-muted-foreground">Hiring Efficiency</p>
                      <p className="text-2xl font-bold">{userMetrics.hiring_efficiency}%</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border">
                      <p className="text-xs text-muted-foreground">Cost per Hire</p>
                      <p className="text-2xl font-bold">{userMetrics.cost_per_hire}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border">
                      <p className="text-xs text-muted-foreground">Monthly Goal</p>
                      <p className="text-2xl font-bold">{userMetrics.monthly_hiring_goal} hires</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Headcount</p>
                    <p className="text-2xl font-bold">{userMetrics.total_headcount}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Team</p>
                    <p className="text-2xl font-bold">{userMetrics.current_headcount}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Open Positions</p>
                    <p className="text-2xl font-bold">{userMetrics.open_positions}</p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Hiring Efficiency</p>
                    <p className="text-2xl font-bold">{userMetrics.hiring_efficiency}%</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Key Roles
              </TabsTrigger>
              <TabsTrigger value="pipeline" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Pipeline
              </TabsTrigger>
              <TabsTrigger value="structure" className="flex items-center gap-2">
                <Network className="w-4 h-4" />
                Org Structure
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Skills
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Hiring Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Hiring Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Current: {userMetrics.current_headcount}</span>
                          <span>Target: {userMetrics.total_headcount}</span>
                        </div>
                        <Progress 
                          value={(userMetrics.current_headcount / userMetrics.total_headcount) * 100} 
                          className="h-3" 
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round((userMetrics.current_headcount / userMetrics.total_headcount) * 100)}% Complete
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="text-center p-3 bg-muted rounded">
                          <p className="text-sm text-muted-foreground">Monthly Goal</p>
                          <p className="text-xl font-bold">{userMetrics.monthly_hiring_goal}</p>
                        </div>
                        <div className="text-center p-3 bg-muted rounded">
                          <p className="text-sm text-muted-foreground">Time to Hire</p>
                          <p className="text-xl font-bold">{userMetrics.avg_time_to_hire}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Hiring Efficiency */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="w-5 h-5 text-primary" />
                      Hiring Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Cost per Hire</span>
                          <span className="font-medium">{userMetrics.cost_per_hire}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Monthly Burn Rate</span>
                          <span className="font-medium">{userMetrics.monthly_burn_rate}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Hiring Efficiency</span>
                          <span className="font-medium">{userMetrics.hiring_efficiency}%</span>
                        </div>
                        <Progress value={userMetrics.hiring_efficiency} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Hiring Plan Timeline */}
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Hiring Plan Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {plan.hiring_plan.map((phase, i) => (
                        <div key={i} className="relative pl-6 pb-4 border-l-2 border-primary/30 last:pb-0">
                          <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary" />
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{phase.phase}</h3>
                              <p className="text-sm text-muted-foreground">{phase.timeline}</p>
                            </div>
                            <Badge className={getStatusColor(phase.status)}>
                              {phase.status}
                            </Badge>
                          </div>
                          <p className="text-sm mt-2">Budget: {phase.budget}</p>
                          <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                            {phase.activities.map((activity, j) => (
                              <li key={j}>{activity}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Key Roles Tab */}
            <TabsContent value="roles" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-primary" />
                      Key Positions
                    </CardTitle>
                    
                    {plan.last_updated && (
                      <Badge variant="outline" className="text-xs">
                        Updated: {new Date(plan.last_updated).toLocaleTimeString()}
                      </Badge>
                    )}
                  </div>
                  
                  <CardDescription>
                    {plan.key_roles.filter(r => r.status === "Open").length} open positions • {plan.key_roles.filter(r => r.status === "Interviewing").length} active interviews
                  </CardDescription>
                  
                  <div className="flex flex-wrap gap-3 mt-2">
                    <select
                      value={filterDepartment}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterDepartment(e.target.value)}
                      className="w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">All Departments</option>
                      <option value="Leadership">Leadership</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                    <select
                      value={filterStatus}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
                      className="w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">All Statuses</option>
                      <option value="Open">Open</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Offer">Offer</option>
                      <option value="Filled">Filled</option>
                    </select>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setFilterDepartment("");
                        setFilterStatus("");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid gap-4">
                    {filteredRoles.length > 0 ? filteredRoles.map((role) => (
                      <Card key={role.id} className="border-2 hover:border-primary/50 transition-all">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className="font-semibold text-lg">{role.title}</h3>
                                <Badge variant="outline" className="bg-gray-100">{role.department}</Badge>
                                <Badge variant="secondary" className="bg-purple-100 text-purple-800">{role.seniority}</Badge>
                                <Badge className={getPriorityColor(role.priority)}>
                                  {role.priority} Priority
                                </Badge>
                                <Badge className={getStatusColor(role.status)}>
                                  {role.status}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
                              
                              <div className="grid grid-cols-3 gap-4 mb-3">
                                <div>
                                  <p className="text-xs text-muted-foreground">Salary Range</p>
                                  <p className="font-medium text-sm">{role.salary_range}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Equity</p>
                                  <p className="font-medium text-sm">{role.equity_range}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Timeline</p>
                                  <p className="font-medium text-sm">{role.hiring_timeline}</p>
                                </div>
                              </div>
                              
                              <div className="mb-3">
                                <p className="text-xs font-semibold text-gray-700 mb-1">Requirements:</p>
                                <div className="flex flex-wrap gap-1">
                                  {role.requirements.map((req, idx) => (
                                    <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                                      {req}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {role.candidates && role.candidates.length > 0 && (
                                <div className="mt-4 pt-3 border-t">
                                  <p className="text-sm font-medium mb-2">Candidates ({role.candidates.length})</p>
                                  <div className="flex flex-wrap gap-2">
                                    {role.candidates.map((candidate) => (
                                      <Badge 
                                        key={candidate.id} 
                                        variant="outline"
                                        className="cursor-pointer hover:bg-muted bg-green-50 text-green-800 border-green-200"
                                        onClick={() => {
                                          setSelectedCandidate(candidate);
                                          setShowCandidateModal(true);
                                        }}
                                      >
                                        {candidate.name} • {candidate.match_score}% match
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col gap-2 ml-4">
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => startHiring(role)}
                              >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Start Hiring
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No roles match your filters</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pipeline Tab */}
            <TabsContent value="pipeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Candidate Pipeline
                  </CardTitle>
                  <CardDescription>
                    Track candidates through your hiring process
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4 mb-6">
                    {["Applied", "Screening", "Interview", "Offer", "Hired"].map((stage, idx) => (
                      <Card key={stage} className="text-center">
                        <CardContent className="pt-4 pb-3">
                          <p className="text-xs text-muted-foreground mb-1">{stage}</p>
                          <p className="text-2xl font-bold">
                            {plan.candidates?.filter(c => c.status === stage).length || 0}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    {plan.candidates && plan.candidates.length > 0 ? (
                      plan.candidates.map((candidate) => (
                        <Card 
                          key={candidate.id} 
                          className="border hover:border-primary/50 transition-all cursor-pointer hover:shadow-md"
                          onClick={() => {
                            setSelectedCandidate(candidate);
                            setShowCandidateModal(true);
                          }}
                        >
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 border-2 border-primary/20">
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {candidate.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-lg">{candidate.name}</p>
                                    <Badge className={getStatusColor(candidate.status)}>
                                      {candidate.status}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {candidate.role} • {candidate.experience}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-lg border-2 border-blue-200">
                                    {candidate.match_score}%
                                  </div>
                                  <p className="text-xs mt-1">Match</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No candidates in pipeline yet</p>
                        <p className="text-sm">Click "Start Hiring" on roles to add candidates</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Org Structure Tab - EDITABLE */}
            <TabsContent value="structure" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Network className="w-5 h-5 text-primary" />
                      Organization Structure
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsEditingStructure(!isEditingStructure)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {isEditingStructure ? "Done Editing" : "Edit Structure"}
                    </Button>
                  </div>
                  <CardDescription>
                    {isEditingStructure ? "Click on any value to edit" : "Visualize and edit your team hierarchy"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plan.team_structure.map((dept, deptIdx) => (
                      <Card key={deptIdx} className="border-2 overflow-hidden">
                        <CardHeader 
                          className="bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors py-3"
                          onClick={() => toggleDepartment(dept.department)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {expandedDepts.includes(dept.department) ? 
                                <ChevronUp className="w-4 h-4" /> : 
                                <ChevronDown className="w-4 h-4" />
                              }
                              <h3 className="font-semibold">{dept.department}</h3>
                              <Badge variant="outline" className="ml-2">
                                {dept.roles.reduce((acc, role) => acc + role.count, 0)} total
                              </Badge>
                            </div>
                            {isEditingStructure && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addRole(deptIdx);
                                }}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Role
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        
                        {expandedDepts.includes(dept.department) && (
                          <CardContent className="pt-4">
                            <div className="grid gap-3">
                              {dept.roles.map((role, roleIdx) => (
                                <div key={roleIdx} className="flex items-center gap-4 p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow">
                                  <div className="flex-1">
                                    {isEditingStructure ? (
                                      <Input
                                        value={role.title}
                                        onChange={(e) => updateRoleTitle(deptIdx, roleIdx, e.target.value)}
                                        className="font-medium mb-2"
                                      />
                                    ) : (
                                      <p className="font-medium">{role.title}</p>
                                    )}
                                    
                                    <div className="flex items-center gap-4 mt-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">Count:</span>
                                        {isEditingStructure ? (
                                          <div className="flex items-center gap-1">
                                            <Button 
                                              size="sm" 
                                              variant="outline" 
                                              className="h-6 w-6 p-0"
                                              onClick={() => updateRoleCount(deptIdx, roleIdx, role.count - 1)}
                                            >
                                              <Minus className="w-3 h-3" />
                                            </Button>
                                            <span className="w-8 text-center font-medium">{role.count}</span>
                                            <Button 
                                              size="sm" 
                                              variant="outline" 
                                              className="h-6 w-6 p-0"
                                              onClick={() => updateRoleCount(deptIdx, roleIdx, role.count + 1)}
                                            >
                                              <Plus className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        ) : (
                                          <span className="font-medium">{role.count}</span>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">Filled:</span>
                                        {isEditingStructure ? (
                                          <div className="flex items-center gap-1">
                                            <Button 
                                              size="sm" 
                                              variant="outline" 
                                              className="h-6 w-6 p-0"
                                              onClick={() => updateFilledCount(deptIdx, roleIdx, role.filled - 1)}
                                            >
                                              <Minus className="w-3 h-3" />
                                            </Button>
                                            <span className="w-8 text-center font-medium">{role.filled}</span>
                                            <Button 
                                              size="sm" 
                                              variant="outline" 
                                              className="h-6 w-6 p-0"
                                              onClick={() => updateFilledCount(deptIdx, roleIdx, role.filled + 1)}
                                            >
                                              <Plus className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        ) : (
                                          <span className="font-medium">{role.filled}</span>
                                        )}
                                      </div>
                                      
                                      {role.reports_to && (
                                        <div className="flex items-center gap-1">
                                          <span className="text-xs text-muted-foreground">Reports to:</span>
                                          <Badge variant="outline" className="text-xs">
                                            {role.reports_to}
                                          </Badge>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {isEditingStructure && (
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => deleteRole(deptIdx, roleIdx)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Required Skills Matrix
                  </CardTitle>
                  <CardDescription>
                    Skills needed across your organization by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Technical Skills */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Code className="w-4 h-4 text-blue-500" />
                          Technical Skills
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {plan.skills_required
                            .filter((s: Skill) => s.category === "Technical")
                            .map((skillItem: Skill, idx: number) => (
                              <div key={idx} className="space-y-1 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    {skillItem.icon}
                                    <p className="font-medium text-sm text-blue-900">{skillItem.name}</p>
                                  </div>
                                  <Badge className={
                                    skillItem.importance === "Critical" ? "bg-red-100 text-red-800 border-red-200" :
                                    skillItem.importance === "Important" ? "bg-orange-100 text-orange-800 border-orange-200" :
                                    "bg-green-100 text-green-800 border-green-200"
                                  }>
                                    {skillItem.importance}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 pl-6">
                                  Required for: {skillItem.roles.join(", ")}
                                </p>
                              </div>
                            ))}
                          {plan.skills_required.filter((s: Skill) => s.category === "Technical").length === 0 && (
                            <p className="text-sm text-muted-foreground">No technical skills listed</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Soft Skills */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users2 className="w-4 h-4 text-green-500" />
                          Soft Skills
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {plan.skills_required
                            .filter((s: Skill) => s.category === "Soft")
                            .map((skillItem: Skill, idx: number) => (
                              <div key={idx} className="space-y-1 p-3 bg-green-50/50 rounded-lg border border-green-100">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    {skillItem.icon}
                                    <p className="font-medium text-sm text-green-900">{skillItem.name}</p>
                                  </div>
                                  <Badge className={
                                    skillItem.importance === "Critical" ? "bg-red-100 text-red-800 border-red-200" :
                                    skillItem.importance === "Important" ? "bg-orange-100 text-orange-800 border-orange-200" :
                                    "bg-green-100 text-green-800 border-green-200"
                                  }>
                                    {skillItem.importance}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 pl-6">
                                  Required for: {skillItem.roles.join(", ")}
                                </p>
                              </div>
                            ))}
                          {plan.skills_required.filter((s: Skill) => s.category === "Soft").length === 0 && (
                            <p className="text-sm text-muted-foreground">No soft skills listed</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Domain Skills */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Target className="w-4 h-4 text-purple-500" />
                          Domain Skills
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {plan.skills_required
                            .filter((s: Skill) => s.category === "Domain")
                            .map((skillItem: Skill, idx: number) => (
                              <div key={idx} className="space-y-1 p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    {skillItem.icon}
                                    <p className="font-medium text-sm text-purple-900">{skillItem.name}</p>
                                  </div>
                                  <Badge className={
                                    skillItem.importance === "Critical" ? "bg-red-100 text-red-800 border-red-200" :
                                    skillItem.importance === "Important" ? "bg-orange-100 text-orange-800 border-orange-200" :
                                    "bg-green-100 text-green-800 border-green-200"
                                  }>
                                    {skillItem.importance}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 pl-6">
                                  Required for: {skillItem.roles.join(", ")}
                                </p>
                              </div>
                            ))}
                          {plan.skills_required.filter((s: Skill) => s.category === "Domain").length === 0 && (
                            <p className="text-sm text-muted-foreground">No domain skills listed</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tools & Technologies */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Layers className="w-4 h-4 text-orange-500" />
                          Tools & Technologies
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {plan.skills_required
                            .filter((s: Skill) => s.category === "Tools")
                            .map((skillItem: Skill, idx: number) => (
                              <div key={idx} className="space-y-1 p-3 bg-orange-50/50 rounded-lg border border-orange-100">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    {skillItem.icon}
                                    <p className="font-medium text-sm text-orange-900">{skillItem.name}</p>
                                  </div>
                                  <Badge className={
                                    skillItem.importance === "Critical" ? "bg-red-100 text-red-800 border-red-200" :
                                    skillItem.importance === "Important" ? "bg-orange-100 text-orange-800 border-orange-200" :
                                    "bg-green-100 text-green-800 border-green-200"
                                  }>
                                    {skillItem.importance}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 pl-6">
                                  Required for: {skillItem.roles.join(", ")}
                                </p>
                              </div>
                            ))}
                          {plan.skills_required.filter((s: Skill) => s.category === "Tools").length === 0 && (
                            <p className="text-sm text-muted-foreground">No tools listed</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Industry Specific */}
                    <Card className="md:col-span-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Globe className="w-4 h-4 text-indigo-500" />
                          Industry Specific Skills
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-3">
                          {plan.skills_required
                            .filter((s: Skill) => s.category === "Industry")
                            .map((skillItem: Skill, idx: number) => (
                              <div key={idx} className="space-y-1 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    {skillItem.icon}
                                    <p className="font-medium text-sm text-indigo-900">{skillItem.name}</p>
                                  </div>
                                  <Badge className={
                                    skillItem.importance === "Critical" ? "bg-red-100 text-red-800 border-red-200" :
                                    skillItem.importance === "Important" ? "bg-orange-100 text-orange-800 border-orange-200" :
                                    "bg-green-100 text-green-800 border-green-200"
                                  }>
                                    {skillItem.importance}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 pl-6">
                                  Required for: {skillItem.roles.join(", ")}
                                </p>
                              </div>
                            ))}
                          {plan.skills_required.filter((s: Skill) => s.category === "Industry").length === 0 && (
                            <p className="text-sm text-muted-foreground col-span-2">No industry-specific skills listed</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Start Hiring Modal */}
      {showHiringModal && selectedRoleForHiring && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Start Hiring for {selectedRoleForHiring.title}</CardTitle>
              <CardDescription>
                Add a candidate to start the hiring process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Candidate Name *</Label>
                <Input
                  placeholder="e.g., John Doe"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Experience</Label>
                <Input
                  placeholder="e.g., 5 years"
                  value={candidateExperience}
                  onChange={(e) => setCandidateExperience(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowHiringModal(false);
                setSelectedRoleForHiring(null);
                setCandidateName("");
                setCandidateEmail("");
                setCandidateExperience("");
              }}>
                Cancel
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={submitCandidate}
                disabled={!candidateName || !candidateEmail}
              >
                Add Candidate
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}