"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Settings, Server, Activity, Users, Wrench,
  Cloud, Shield, BarChart, Clock, DollarSign,
  CheckCircle, AlertCircle, RefreshCw, Download,
  Share2, Plus, Edit, Trash2, Save, XCircle,
  Cpu, Database, Globe, Lock, Zap, Target,
  PieChart, TrendingUp, Calendar, UserCheck,
  Briefcase, Layers, GitBranch, Box, HardDrive,
  Network, Key, Bell, Sliders, Code, Terminal,
  Minus, Loader2
} from "lucide-react"
import { getApiUrl } from "@/lib/api"

// ============= INTERFACES =============

interface Team {
  id: string
  name: string
  description: string
  members: number
  lead?: string
  responsibilities: string[]
  tools: string[]
}

interface Tool {
  id: string
  name: string
  category: "development" | "communication" | "project-management" | "analytics" | "security" | "infrastructure"
  purpose: string
  cost: "free" | "low" | "medium" | "high"
  users: string[]
  link?: string
}

interface Process {
  id: string
  name: string
  description: string
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "as-needed"
  owner: string
  steps: string[]
  status: "active" | "draft" | "needs-review"
}

interface CloudInfra {
  provider: string
  services: string[]
  monthly_cost: string
  scalability: "auto" | "manual" | "limited"
  regions: string[]
}

interface DevOpsStack {
  ci_cd: string[]
  monitoring: string[]
  logging: string[]
  alerting: string[]
}

interface SecurityInfra {
  measures: string[]
  compliance: string[]
  certifications: string[]
  backups: string
  drp: string
}

interface Infrastructure {
  cloud: CloudInfra
  devops: DevOpsStack
  security: SecurityInfra
}

interface KPI {
  id: string
  name: string
  category: "performance" | "reliability" | "cost" | "security" | "team"
  target: string
  current: string
  unit: string
  frequency: string
  trend: "up" | "down" | "stable"
}

interface OperationsMetrics {
  totalTeamMembers: number
  activeProcesses: number
  monthlyOpsCost: string
  systemUptime: string
  avgResponseTime: string
  incidentCount: number
  toolCount: number
}

interface OperationsPlan {
  startup_idea: string
  industry: string
  teams: Team[]
  tools: Tool[]
  processes: Process[]
  infrastructure: Infrastructure
  kpis: KPI[]
  metrics: OperationsMetrics
  lastUpdated?: string
}

// Industry-specific templates
// Industry-specific templates with proper typing
// Industry-specific templates with proper typing matching Infrastructure interface
type IndustryType = 'technology' | 'healthcare' | 'fintech' | 'ecommerce' | 'saas';

const INDUSTRY_TEMPLATES: Record<IndustryType, {
  cloud: { provider: string; services: string[] };
  devops: { ci_cd: string[]; monitoring: string[]; logging: string[]; alerting: string[] };
  security: {  // This must match SecurityInfra interface
    measures: string[];
    compliance: string[];
    certifications: string[];
    backups: string;
    drp: string;
  };
}> = {
  technology: {
    cloud: { provider: "AWS", services: ["EC2", "S3", "RDS", "Lambda", "CloudFront"] },
    devops: { 
      ci_cd: ["GitHub Actions", "Jenkins"], 
      monitoring: ["Datadog", "New Relic"], 
      logging: ["ELK Stack"], 
      alerting: ["PagerDuty"] 
    },
    security: { 
      measures: ["Encryption at rest", "Encryption in transit", "IAM", "WAF", "Penetration testing"],
      compliance: ["SOC2", "ISO 27001"],
      certifications: ["ISO 27001"],
      backups: "Daily automated backups with 30-day retention. Point-in-time recovery enabled.",
      drp: "Multi-region active-passive failover. RTO: 4 hours, RPO: 1 hour"
    }
  },
  healthcare: {
    cloud: { provider: "Azure", services: ["Azure VMs", "SQL Database", "Blob Storage", "Azure AD"] },
    devops: { 
      ci_cd: ["Azure DevOps", "GitHub Actions"], 
      monitoring: ["Azure Monitor", "Application Insights"], 
      logging: ["Log Analytics", "Azure Sentinel"], 
      alerting: ["OpsGenie", "PagerDuty"] 
    },
    security: { 
      measures: ["HIPAA compliance", "Encryption at rest", "Encryption in transit", "Access control", "Audit logs", "BAAs"],
      compliance: ["HIPAA", "HITRUST"],
      certifications: ["ISO 27001", "HITRUST"],
      backups: "Daily encrypted backups with 7-year retention (compliance requirement). Geo-redundant storage.",
      drp: "Active-passive failover with RTO: 24 hours, RPO: 4 hours"
    }
  },
  fintech: {
    cloud: { provider: "AWS", services: ["EC2", "RDS", "KMS", "CloudTrail", "Shield"] },
    devops: { 
      ci_cd: ["GitLab CI", "Spinnaker", "Jenkins"], 
      monitoring: ["DataDog", "SignalFx", "New Relic"], 
      logging: ["Splunk", "CloudWatch"], 
      alerting: ["PagerDuty", "OpsGenie"] 
    },
    security: { 
      measures: ["PCI DSS compliance", "Encryption", "MFA", "Fraud detection", "Transaction monitoring", "KYC/AML"],
      compliance: ["PCI DSS", "SOC2", "GDPR"],
      certifications: ["ISO 27001", "PCI DSS"],
      backups: "Daily encrypted backups with 7-year retention. Immutable backups for compliance.",
      drp: "Active-active multi-region deployment. RTO: 1 hour, RPO: 5 minutes"
    }
  },
  ecommerce: {
    cloud: { provider: "Google Cloud", services: ["Compute Engine", "Cloud SQL", "Cloud Storage", "CDN"] },
    devops: { 
      ci_cd: ["Cloud Build", "Jenkins", "GitHub Actions"], 
      monitoring: ["Stackdriver", "Datadog"], 
      logging: ["Cloud Logging", "ELK"], 
      alerting: ["OpsGenie", "PagerDuty"] 
    },
    security: { 
      measures: ["Encryption", "WAF", "DDoS protection", "Bot mitigation", "PCI compliance"],
      compliance: ["PCI DSS", "GDPR"],
      certifications: ["ISO 27001", "PCI DSS"],
      backups: "Daily backups with 90-day retention. Point-in-time recovery enabled.",
      drp: "Multi-region failover. RTO: 2 hours, RPO: 15 minutes"
    }
  },
  saas: {
    cloud: { provider: "AWS", services: ["ECS", "RDS", "S3", "CloudFront", "Route 53"] },
    devops: { 
      ci_cd: ["GitHub Actions", "ArgoCD", "Jenkins"], 
      monitoring: ["Datadog", "New Relic"], 
      logging: ["CloudWatch", "ELK"], 
      alerting: ["PagerDuty", "OpsGenie"] 
    },
    security: { 
      measures: ["Encryption", "SSO", "RBAC", "API security", "Rate limiting", "DDoS protection"],
      compliance: ["SOC2", "GDPR"],
      certifications: ["ISO 27001", "SOC2"],
      backups: "Daily automated backups with 30-day retention. Point-in-time recovery.",
      drp: "Multi-region failover. RTO: 4 hours, RPO: 1 hour"
    }
  }
};

// ============= MAIN COMPONENT =============
export function Operations() {
  const [startupIdea, setStartupIdea] = useState("")
  const [industry, setIndustry] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasPlan, setHasPlan] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  
  // Edit states
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)
  const [showToolModal, setShowToolModal] = useState(false)
  const [editingProcess, setEditingProcess] = useState<Process | null>(null)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [editingKPI, setEditingKPI] = useState<KPI | null>(null)
  const [showKPIModal, setShowKPIModal] = useState(false)
  const [editingInfra, setEditingInfra] = useState<Infrastructure | null>(null)
  const [showInfraModal, setShowInfraModal] = useState(false)

  const [plan, setPlan] = useState<OperationsPlan>({
    startup_idea: "",
    industry: "",
    teams: [],
    tools: [],
    processes: [],
    infrastructure: {
      cloud: {
        provider: "",
        services: [],
        monthly_cost: "",
        scalability: "manual",
        regions: []
      },
      devops: {
        ci_cd: [],
        monitoring: [],
        logging: [],
        alerting: []
      },
      security: {
        measures: [],
        compliance: [],
        certifications: [],
        backups: "",
        drp: ""
      }
    },
    kpis: [],
    metrics: {
      totalTeamMembers: 0,
      activeProcesses: 0,
      monthlyOpsCost: "",
      systemUptime: "",
      avgResponseTime: "",
      incidentCount: 0,
      toolCount: 0
    },
    lastUpdated: undefined
  })

  // Generate dynamic operations plan from backend
  const generateOperations = async () => {
    if (!startupIdea || !industry) {
      alert("Please enter both startup idea and industry");
      return;
    }

    setIsGenerating(true);
    setHasPlan(false);
    setError(null);

    try {
      const response = await fetch(getApiUrl("/operations-plan"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          startup_idea: startupIdea,
          industry: industry
        })
      });

      const result = await response.json();
      
      if (result.operations) {
        const dynamicPlan = createDynamicPlanFromAPI(result.operations, startupIdea, industry);
        setPlan(dynamicPlan);
        setHasPlan(true);
      } else {
        throw new Error("Invalid response format");
      }
      
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to generate operations plan. Using dynamically generated data.');
      
      // Generate completely dynamic plan based on user inputs
      const dynamicPlan = generateDynamicPlan(startupIdea, industry);
      setPlan(dynamicPlan);
      setHasPlan(true);
    } finally {
      setIsGenerating(false);
    }
  };

  // Create dynamic plan from API response
  const createDynamicPlanFromAPI = (apiData: any, idea: string, ind: string): OperationsPlan => {
    const timestamp = Date.now();
    
    // Extract or generate teams
    const teams: Team[] = (apiData.operations_structure?.teams || []).map((t: any, i: number) => ({
      id: `team-${timestamp}-${i}`,
      name: typeof t === 'string' ? t : (t.name || `Team ${i + 1}`),
      description: typeof t === 'string' ? `${t} team responsible for operations` : (t.description || `Operations team`),
      members: t.members || Math.floor(Math.random() * 5) + 3,
      lead: t.lead || `Lead ${i + 1}`,
      responsibilities: t.responsibilities || [
        "Daily operations management",
        "Process improvement",
        "Quality assurance",
        "Stakeholder communication"
      ],
      tools: t.tools || []
    }));

    // Extract or generate tools
    const tools: Tool[] = (apiData.operations_structure?.tools || []).map((t: any, i: number) => ({
      id: `tool-${timestamp}-${i}`,
      name: typeof t === 'string' ? t : (t.name || `Tool ${i + 1}`),
      category: t.category || getRandomCategory(),
      purpose: t.purpose || `Tool for ${typeof t === 'string' ? t : 'operations'}`,
      cost: t.cost || getRandomCost(),
      users: t.users || ["Engineering", "Operations"]
    }));

    // Extract or generate processes
    const processes: Process[] = (apiData.operations_structure?.processes || []).map((p: any, i: number) => ({
      id: `process-${timestamp}-${i}`,
      name: typeof p === 'string' ? p : (p.name || `Process ${i + 1}`),
      description: typeof p === 'string' ? `${p} process workflow` : (p.description || `Standard operating procedure`),
      frequency: p.frequency || getRandomFrequency(),
      owner: p.owner || `Operations Team`,
      steps: p.steps || [
        "Plan and prepare",
        "Execute process",
        "Review outcomes",
        "Document results"
      ],
      status: p.status || "active"
    }));

    // Get industry-specific infrastructure or use defaults
    const industryKey = getIndustryKey(ind);
const template = INDUSTRY_TEMPLATES[industryKey];

    // Infrastructure
    const infrastructure: Infrastructure = {
      cloud: {
        provider: apiData.infrastructure?.cloud?.provider || template.cloud.provider,
        services: apiData.infrastructure?.cloud?.services || template.cloud.services,
        monthly_cost: apiData.infrastructure?.cloud?.monthly_cost || `$${Math.floor(Math.random() * 10 + 5)}K - $${Math.floor(Math.random() * 15 + 10)}K`,
        scalability: apiData.infrastructure?.cloud?.scalability || "auto",
        regions: apiData.infrastructure?.cloud?.regions || ["US-East", "US-West", "EU-West"]
      },
      devops: {
        ci_cd: apiData.infrastructure?.devops?.ci_cd || template.devops.ci_cd,
        monitoring: apiData.infrastructure?.devops?.monitoring || template.devops.monitoring,
        logging: apiData.infrastructure?.devops?.logging || template.devops.logging,
        alerting: apiData.infrastructure?.devops?.alerting || template.devops.alerting
      },
      security: {
        measures: apiData.infrastructure?.security?.measures || template.security.measures,
        compliance: apiData.infrastructure?.security?.compliance || template.security.compliance,
        certifications: apiData.infrastructure?.security?.certifications || template.security.certifications,
        backups: apiData.infrastructure?.security?.backups || "Daily automated backups with 30-day retention",
        drp: apiData.infrastructure?.security?.drp || "Multi-region failover with 4-hour RTO"
      }
    };

    // Extract or generate KPIs
    const kpis: KPI[] = (apiData.kpis || []).map((k: any, i: number) => ({
      id: `kpi-${timestamp}-${i}`,
      name: typeof k === 'string' ? k : (k.name || `KPI ${i + 1}`),
      category: k.category || getRandomKPICategory(),
      target: k.target || `${Math.floor(Math.random() * 20 + 90)}%`,
      current: k.current || `${Math.floor(Math.random() * 15 + 85)}%`,
      unit: k.unit || "percentage",
      frequency: k.frequency || "daily",
      trend: k.trend || getRandomTrend()
    }));

    // Calculate metrics
    const totalTeamMembers = teams.reduce((sum, t) => sum + t.members, 0);
    const activeProcesses = processes.filter(p => p.status === "active").length;
    const monthlyOpsCost = infrastructure.cloud.monthly_cost;
    const systemUptime = `${Math.floor(Math.random() * 5 + 95)}.${Math.floor(Math.random() * 9)}%`;
    const avgResponseTime = `${Math.floor(Math.random() * 200 + 100)}ms`;

    return {
      startup_idea: idea,
      industry: ind,
      teams,
      tools,
      processes,
      infrastructure,
      kpis,
      metrics: {
        totalTeamMembers,
        activeProcesses,
        monthlyOpsCost,
        systemUptime,
        avgResponseTime,
        incidentCount: Math.floor(Math.random() * 5),
        toolCount: tools.length
      },
      lastUpdated: new Date().toISOString()
    };
  };

  // Generate completely dynamic plan based on user inputs
  const generateDynamicPlan = (idea: string, ind: string): OperationsPlan => {
    const timestamp = Date.now();
    const industryKey = getIndustryKey(ind);
const template = INDUSTRY_TEMPLATES[industryKey];
    
    // Generate teams based on industry
    const teams: Team[] = [];
    const teamNames = getTeamNamesForIndustry(ind);
    
    teamNames.forEach((name, i) => {
      teams.push({
        id: `team-${timestamp}-${i}`,
        name: name,
        description: `${name} responsible for ${getTeamDescription(name, idea)}`,
        members: Math.floor(Math.random() * 5) + 3,
        lead: getRandomName(),
        responsibilities: getResponsibilitiesForTeam(name),
        tools: getToolsForTeam(name)
      });
    });

    // Generate tools
    const tools: Tool[] = [];
    const toolNames = getToolNamesForIndustry(ind);
    
    toolNames.forEach((name, i) => {
      tools.push({
        id: `tool-${timestamp}-${i}`,
        name: name,
        category: getToolCategory(name),
        purpose: `Tool for ${getToolPurpose(name)}`,
        cost: getRandomCost(),
        users: getUserRolesForTool(name)
      });
    });

    // Generate processes
    const processes: Process[] = [];
    const processNames = getProcessNamesForIndustry(ind);
    
    processNames.forEach((name, i) => {
      processes.push({
        id: `process-${timestamp}-${i}`,
        name: name,
        description: `${name} process workflow`,
        frequency: getRandomFrequency(),
        owner: teams[0]?.name || "Operations Team",
        steps: generateProcessSteps(name),
        status: i < 2 ? "active" : i < 4 ? "draft" : "needs-review"
      });
    });

    // Infrastructure with industry-specific values
    const infrastructure: Infrastructure = {
      cloud: {
        provider: template.cloud.provider,
        services: template.cloud.services,
        monthly_cost: `$${Math.floor(Math.random() * 15 + 8)}K - $${Math.floor(Math.random() * 20 + 12)}K`,
        scalability: "auto",
        regions: ["US-East", "US-West", "EU-West", "AP-Southeast"]
      },
      devops: template.devops,
      security: template.security
    };

    // Generate KPIs
    const kpis: KPI[] = [];
    const kpiNames = getKPINamesForIndustry(ind);
    
    kpiNames.forEach((name, i) => {
      kpis.push({
        id: `kpi-${timestamp}-${i}`,
        name: name,
        category: getKPICategory(name),
        target: getKPITarget(name),
        current: getKPICurrent(name),
        unit: getKPIUnit(name),
        frequency: getKPIFrequency(name),
        trend: getRandomTrend()
      });
    });

    // Calculate metrics
    const totalTeamMembers = teams.reduce((sum, t) => sum + t.members, 0);
    const activeProcesses = processes.filter(p => p.status === "active").length;
    const monthlyOpsCost = infrastructure.cloud.monthly_cost;
    const systemUptime = `${Math.floor(Math.random() * 3 + 98)}.${Math.floor(Math.random() * 9)}%`;
    const avgResponseTime = `${Math.floor(Math.random() * 300 + 150)}ms`;

    return {
      startup_idea: idea,
      industry: ind,
      teams,
      tools,
      processes,
      infrastructure,
      kpis,
      metrics: {
        totalTeamMembers,
        activeProcesses,
        monthlyOpsCost,
        systemUptime,
        avgResponseTime,
        incidentCount: Math.floor(Math.random() * 8),
        toolCount: tools.length
      },
      lastUpdated: new Date().toISOString()
    };
  };

  // ============= HELPER FUNCTIONS FOR DYNAMIC DATA =============

  const getIndustryKey = (industry: string): IndustryType => {
  const ind = industry.toLowerCase();
  if (ind.includes('health') || ind.includes('medical') || ind.includes('clinic')) return 'healthcare';
  if (ind.includes('fin') || ind.includes('bank') || ind.includes('pay') || ind.includes('insur')) return 'fintech';
  if (ind.includes('ecom') || ind.includes('shop') || ind.includes('retail') || ind.includes('store')) return 'ecommerce';
  if (ind.includes('saas') || ind.includes('soft') || ind.includes('app') || ind.includes('platform')) return 'saas';
  return 'technology';
};

  const getTeamNamesForIndustry = (industry: string): string[] => {
    const ind = industry.toLowerCase();
    if (ind.includes('health')) {
      return ["Clinical Operations", "Patient Support", "Compliance", "IT Infrastructure"];
    }
    if (ind.includes('fin')) {
      return ["Risk & Compliance", "Transaction Monitoring", "Customer Support", "Security Operations"];
    }
    if (ind.includes('ecom')) {
      return ["Order Fulfillment", "Customer Service", "Logistics", "Platform Operations"];
    }
    return ["Engineering Operations", "Security & Compliance", "Customer Support", "Infrastructure", "Site Reliability"];
  };

  const getTeamDescription = (teamName: string, idea: string): string => {
    if (teamName.includes("Engineering")) return `technical infrastructure for ${idea}`;
    if (teamName.includes("Security")) return `security and compliance for ${idea}`;
    if (teamName.includes("Support")) return `customer inquiries and support for ${idea}`;
    if (teamName.includes("Infrastructure")) return `cloud and infrastructure management for ${idea}`;
    return `operations for ${idea}`;
  };

  const getResponsibilitiesForTeam = (teamName: string): string[] => {
    if (teamName.includes("Engineering")) {
      return ["CI/CD pipeline management", "Infrastructure provisioning", "System monitoring", "Developer tooling"];
    }
    if (teamName.includes("Security")) {
      return ["Security audits", "Compliance monitoring", "Incident response", "Access management"];
    }
    if (teamName.includes("Support")) {
      return ["Ticket resolution", "Customer onboarding", "Knowledge base management", "Feedback collection"];
    }
    return ["Daily operations", "Process improvement", "Quality assurance", "Stakeholder communication"];
  };

  const getToolsForTeam = (teamName: string): string[] => {
    if (teamName.includes("Engineering")) {
      return ["AWS", "Kubernetes", "Jenkins", "Datadog"];
    }
    if (teamName.includes("Security")) {
      return ["Wazuh", "Vault", "Splunk", "Qualys"];
    }
    if (teamName.includes("Support")) {
      return ["Zendesk", "Intercom", "Jira", "Slack"];
    }
    return ["Slack", "Jira", "Confluence", "Google Workspace"];
  };

  const getToolNamesForIndustry = (industry: string): string[] => {
    const ind = industry.toLowerCase();
    if (ind.includes('health')) {
      return ["EPIC", "Salesforce Health Cloud", "Slack", "Jira", "Zoom"];
    }
    if (ind.includes('fin')) {
      return ["Splunk", "Datadog", "Slack", "Jira", "PagerDuty"];
    }
    return ["Slack", "Jira", "Confluence", "Datadog", "PagerDuty", "GitHub"];
  };

  const getToolCategory = (toolName: string): "development" | "communication" | "project-management" | "analytics" | "security" | "infrastructure" => {
    const t = toolName.toLowerCase();
    if (t.includes('slack') || t.includes('zoom') || t.includes('teams')) return "communication";
    if (t.includes('jira') || t.includes('trello') || t.includes('asana')) return "project-management";
    if (t.includes('datadog') || t.includes('splunk') || t.includes('new relic')) return "analytics";
    if (t.includes('vault') || t.includes('wazuh') || t.includes('qualys')) return "security";
    if (t.includes('aws') || t.includes('k8s') || t.includes('docker')) return "infrastructure";
    return "development";
  };

  const getToolPurpose = (toolName: string): string => {
    const t = toolName.toLowerCase();
    if (t.includes('slack')) return "team communication";
    if (t.includes('jira')) return "project tracking";
    if (t.includes('datadog')) return "system monitoring";
    if (t.includes('aws')) return "cloud infrastructure";
    if (t.includes('github')) return "code hosting and CI/CD";
    return "operations";
  };

  const getUserRolesForTool = (toolName: string): string[] => {
    const t = toolName.toLowerCase();
    if (t.includes('slack')) return ["All teams"];
    if (t.includes('jira')) return ["Engineering", "Product", "Operations"];
    if (t.includes('datadog')) return ["Engineering", "DevOps"];
    if (t.includes('aws')) return ["Engineering", "DevOps"];
    return ["Engineering", "Operations"];
  };

  const getProcessNamesForIndustry = (industry: string): string[] => {
    const ind = industry.toLowerCase();
    if (ind.includes('health')) {
      return ["Patient Onboarding", "Clinical Documentation", "Compliance Review", "Incident Response", "Data Backup"];
    }
    if (ind.includes('fin')) {
      return ["Transaction Monitoring", "Fraud Detection", "Compliance Review", "Incident Response", "Audit Preparation"];
    }
    return ["Incident Response", "Change Management", "Backup and Recovery", "Performance Review", "Security Audit"];
  };

  const generateProcessSteps = (processName: string): string[] => {
    return [
      `Initiate ${processName}`,
      "Gather requirements",
      "Execute process",
      "Review outcomes",
      "Document results",
      "Archive records"
    ];
  };

  const getKPINamesForIndustry = (industry: string): string[] => {
    const ind = industry.toLowerCase();
    if (ind.includes('health')) {
      return ["Patient Satisfaction", "Clinical Accuracy", "System Uptime", "Response Time", "Compliance Score"];
    }
    if (ind.includes('fin')) {
      return ["Transaction Accuracy", "Fraud Detection Rate", "System Uptime", "Response Time", "Compliance Score"];
    }
    return ["System Uptime", "MTTR", "Infrastructure Cost", "Security Incidents", "Deployment Frequency"];
  };

  const getKPICategory = (kpiName: string): "performance" | "reliability" | "cost" | "security" | "team" => {
    const k = kpiName.toLowerCase();
    if (k.includes('uptime') || k.includes('mttr')) return "reliability";
    if (k.includes('cost') || k.includes('budget')) return "cost";
    if (k.includes('security') || k.includes('incident')) return "security";
    if (k.includes('satisfaction') || k.includes('team')) return "team";
    return "performance";
  };

  const getKPITarget = (kpiName: string): string => {
    const k = kpiName.toLowerCase();
    if (k.includes('uptime')) return "99.95%";
    if (k.includes('mttr')) return "< 30 min";
    if (k.includes('cost')) return "$15,000";
    if (k.includes('incident')) return "0";
    if (k.includes('satisfaction')) return "95%";
    return "90%";
  };

  const getKPICurrent = (kpiName: string): string => {
    const k = kpiName.toLowerCase();
    if (k.includes('uptime')) return `${Math.floor(Math.random() * 2 + 98)}.${Math.floor(Math.random() * 9)}%`;
    if (k.includes('mttr')) return `${Math.floor(Math.random() * 20 + 20)} min`;
    if (k.includes('cost')) return `$${Math.floor(Math.random() * 5 + 12)}K`;
    if (k.includes('incident')) return `${Math.floor(Math.random() * 3)}`;
    if (k.includes('satisfaction')) return `${Math.floor(Math.random() * 10 + 85)}%`;
    return `${Math.floor(Math.random() * 15 + 80)}%`;
  };

  const getKPIUnit = (kpiName: string): string => {
    const k = kpiName.toLowerCase();
    if (k.includes('uptime')) return "percentage";
    if (k.includes('mttr')) return "minutes";
    if (k.includes('cost')) return "USD";
    if (k.includes('incident')) return "count";
    if (k.includes('satisfaction')) return "percentage";
    return "percentage";
  };

  const getKPIFrequency = (kpiName: string): string => {
    const k = kpiName.toLowerCase();
    if (k.includes('uptime')) return "daily";
    if (k.includes('mttr')) return "weekly";
    if (k.includes('cost')) return "monthly";
    if (k.includes('incident')) return "daily";
    return "weekly";
  };

  const getRandomCost = (): "free" | "low" | "medium" | "high" => {
    const rand = Math.random();
    if (rand < 0.2) return "free";
    if (rand < 0.5) return "low";
    if (rand < 0.8) return "medium";
    return "high";
  };

  const getRandomFrequency = (): "daily" | "weekly" | "monthly" | "quarterly" | "as-needed" => {
    const rand = Math.random();
    if (rand < 0.2) return "daily";
    if (rand < 0.5) return "weekly";
    if (rand < 0.8) return "monthly";
    if (rand < 0.95) return "quarterly";
    return "as-needed";
  };

  const getRandomTrend = (): "up" | "down" | "stable" => {
    const rand = Math.random();
    if (rand < 0.4) return "up";
    if (rand < 0.8) return "down";
    return "stable";
  };

  const getRandomCategory = (): "development" | "communication" | "project-management" | "analytics" | "security" | "infrastructure" => {
    const categories = ["development", "communication", "project-management", "analytics", "security", "infrastructure"];
    return categories[Math.floor(Math.random() * categories.length)] as any;
  };

  const getRandomKPICategory = (): "performance" | "reliability" | "cost" | "security" | "team" => {
    const categories = ["performance", "reliability", "cost", "security", "team"];
    return categories[Math.floor(Math.random() * categories.length)] as any;
  };

  const getRandomName = (): string => {
    const firstNames = ["Sarah", "Michael", "Jennifer", "David", "Lisa", "James", "Maria", "John"];
    const lastNames = ["Chen", "Rodriguez", "Park", "Smith", "Johnson", "Williams", "Brown", "Jones"];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  };

  // ============= CRUD OPERATIONS =============

  const addTeam = () => {
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: "New Team",
      description: "Team description",
      members: 3,
      responsibilities: ["Responsibility 1", "Responsibility 2"],
      tools: []
    };
    setPlan(prev => ({
      ...prev,
      teams: [...prev.teams, newTeam],
      metrics: {
        ...prev.metrics,
        totalTeamMembers: prev.metrics.totalTeamMembers + 3
      }
    }));
  };

  const deleteTeam = (teamId: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return;
    
    setPlan(prev => {
      const team = prev.teams.find(t => t.id === teamId);
      const updatedTeams = prev.teams.filter(t => t.id !== teamId);
      return {
        ...prev,
        teams: updatedTeams,
        metrics: {
          ...prev.metrics,
          totalTeamMembers: prev.metrics.totalTeamMembers - (team?.members || 0)
        }
      };
    });
  };

  const saveTeamEdit = () => {
    if (!editingTeam) return;
    
    setPlan(prev => {
      const oldTeam = prev.teams.find(t => t.id === editingTeam.id);
      const memberDiff = (editingTeam.members || 0) - (oldTeam?.members || 0);
      
      const updatedTeams = prev.teams.map(t => 
        t.id === editingTeam.id ? editingTeam : t
      );

      return {
        ...prev,
        teams: updatedTeams,
        metrics: {
          ...prev.metrics,
          totalTeamMembers: prev.metrics.totalTeamMembers + memberDiff
        }
      };
    });
    
    setShowTeamModal(false);
    setEditingTeam(null);
  };

  const addTool = () => {
    const newTool: Tool = {
      id: `tool-${Date.now()}`,
      name: "New Tool",
      category: "development",
      purpose: "Tool purpose",
      cost: "medium",
      users: ["Engineering"]
    };
    setPlan(prev => ({
      ...prev,
      tools: [...prev.tools, newTool],
      metrics: {
        ...prev.metrics,
        toolCount: prev.metrics.toolCount + 1
      }
    }));
  };

  const deleteTool = (toolId: string) => {
    if (!confirm("Are you sure you want to delete this tool?")) return;
    
    setPlan(prev => ({
      ...prev,
      tools: prev.tools.filter(t => t.id !== toolId),
      metrics: {
        ...prev.metrics,
        toolCount: prev.metrics.toolCount - 1
      }
    }));
  };

  const saveToolEdit = () => {
    if (!editingTool) return;
    
    setPlan(prev => ({
      ...prev,
      tools: prev.tools.map(t => t.id === editingTool.id ? editingTool : t)
    }));
    
    setShowToolModal(false);
    setEditingTool(null);
  };

  const addProcess = () => {
    const newProcess: Process = {
      id: `process-${Date.now()}`,
      name: "New Process",
      description: "Process description",
      frequency: "weekly",
      owner: "Operations Team",
      steps: ["Step 1", "Step 2", "Step 3"],
      status: "draft"
    };
    setPlan(prev => ({
      ...prev,
      processes: [...prev.processes, newProcess],
      metrics: {
        ...prev.metrics,
        activeProcesses: prev.metrics.activeProcesses + 1
      }
    }));
  };

  const deleteProcess = (processId: string) => {
    if (!confirm("Are you sure you want to delete this process?")) return;
    
    setPlan(prev => ({
      ...prev,
      processes: prev.processes.filter(p => p.id !== processId),
      metrics: {
        ...prev.metrics,
        activeProcesses: prev.processes.filter(p => p.status === "active").length - 1
      }
    }));
  };

  const saveProcessEdit = () => {
    if (!editingProcess) return;
    
    setPlan(prev => ({
      ...prev,
      processes: prev.processes.map(p => p.id === editingProcess.id ? editingProcess : p)
    }));
    
    setShowProcessModal(false);
    setEditingProcess(null);
  };

  const addKPI = () => {
    const newKPI: KPI = {
      id: `kpi-${Date.now()}`,
      name: "New KPI",
      category: "performance",
      target: "90%",
      current: "85%",
      unit: "percentage",
      frequency: "daily",
      trend: "up"
    };
    setPlan(prev => ({
      ...prev,
      kpis: [...prev.kpis, newKPI]
    }));
  };

  const deleteKPI = (kpiId: string) => {
    if (!confirm("Are you sure you want to delete this KPI?")) return;
    
    setPlan(prev => ({
      ...prev,
      kpis: prev.kpis.filter(k => k.id !== kpiId)
    }));
  };

  const saveKPIEdit = () => {
    if (!editingKPI) return;
    
    setPlan(prev => ({
      ...prev,
      kpis: prev.kpis.map(k => k.id === editingKPI.id ? editingKPI : k)
    }));
    
    setShowKPIModal(false);
    setEditingKPI(null);
  };

  const saveInfrastructureEdit = () => {
    if (!editingInfra) return;
    
    setPlan(prev => ({
      ...prev,
      infrastructure: editingInfra
    }));
    
    setShowInfraModal(false);
    setEditingInfra(null);
  };

  // ============= UI HELPER FUNCTIONS =============

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case "development": return <Code className="w-4 h-4" />;
      case "communication": return <Globe className="w-4 h-4" />;
      case "project-management": return <Briefcase className="w-4 h-4" />;
      case "analytics": return <BarChart className="w-4 h-4" />;
      case "security": return <Shield className="w-4 h-4" />;
      case "infrastructure": return <Server className="w-4 h-4" />;
      default: return <Wrench className="w-4 h-4" />;
    }
  };

  const getCostColor = (cost: string) => {
    switch(cost) {
      case "free": return "bg-green-100 text-green-800";
      case "low": return "bg-blue-100 text-blue-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingUp className="w-4 h-4 text-red-600 transform rotate-180" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "active": return "bg-green-100 text-green-800";
      case "draft": return "bg-gray-100 text-gray-800";
      case "needs-review": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Operations Strategy</h1>
          <p className="text-muted-foreground">
            Plan infrastructure, teams, and processes for your startup operations.
          </p>
        </div>
        {hasPlan && (
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
      {!hasPlan && (
        <Card className="border-2 border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Settings className="w-6 h-6 text-primary" />
              Generate Operations Plan
            </CardTitle>
            <CardDescription>
              Tell us about your startup to generate a comprehensive operations strategy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="idea">Startup Idea</Label>
                <Input
                  id="idea"
                  placeholder="e.g., AI-powered code review platform"
                  value={startupIdea}
                  onChange={(e) => setStartupIdea(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
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
              onClick={generateOperations} 
              disabled={isGenerating} 
              size="lg"
              className="mt-6 w-full md:w-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Operations Plan...
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 mr-2" />
                  Generate Operations Plan
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
      )}

      {/* Results */}
      {hasPlan && (
        <div className="space-y-6">
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Team Members</p>
                    <p className="text-2xl font-bold">{plan.metrics.totalTeamMembers}</p>
                  </div>
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Processes</p>
                    <p className="text-2xl font-bold">{plan.metrics.activeProcesses}</p>
                  </div>
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Ops Cost</p>
                    <p className="text-2xl font-bold">{plan.metrics.monthlyOpsCost}</p>
                  </div>
                  <DollarSign className="w-5 h-5 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">System Uptime</p>
                    <p className="text-2xl font-bold">{plan.metrics.systemUptime}</p>
                  </div>
                  <Server className="w-5 h-5 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="teams" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Teams
              </TabsTrigger>
              <TabsTrigger value="infrastructure" className="flex items-center gap-2">
                <Server className="w-4 h-4" />
                Infrastructure
              </TabsTrigger>
              <TabsTrigger value="kpis" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                KPIs
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Tools Inventory */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-primary" />
                      Tools Inventory
                    </CardTitle>
                    <Button size="sm" variant="ghost" onClick={addTool}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {plan.tools.map((tool) => (
                        <div key={tool.id} className="flex items-center justify-between p-2 border rounded group">
                          <div>
                            <p className="font-medium">{tool.name}</p>
                            <p className="text-xs text-muted-foreground">{tool.purpose}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getCostColor(tool.cost)}>
                              {tool.cost}
                            </Badge>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                  setEditingTool(tool);
                                  setShowToolModal(true);
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-red-600"
                                onClick={() => deleteTool(tool.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Active Processes */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Active Processes
                    </CardTitle>
                    <Button size="sm" variant="ghost" onClick={addProcess}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {plan.processes.map((process) => (
                        <div key={process.id} className="flex items-center justify-between p-2 border rounded group">
                          <div>
                            <p className="font-medium">{process.name}</p>
                            <p className="text-xs text-muted-foreground">Owner: {process.owner}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(process.status)}>
                              {process.status}
                            </Badge>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                  setEditingProcess(process);
                                  setShowProcessModal(true);
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-red-600"
                                onClick={() => deleteProcess(process.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Infrastructure Summary */}
                <Card className="col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Cloud className="w-5 h-5 text-primary" />
                      Infrastructure Overview
                    </CardTitle>
                    <Button size="sm" variant="ghost" onClick={() => {
                      setEditingInfra(plan.infrastructure);
                      setShowInfraModal(true);
                    }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Cloud Provider</p>
                        <Badge variant="outline" className="p-2">
                          {plan.infrastructure.cloud.provider}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                          Services: {plan.infrastructure.cloud.services.slice(0, 4).join(", ")}
                          {plan.infrastructure.cloud.services.length > 4 && "..."}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">DevOps Stack</p>
                        <div className="space-y-1">
                          <p className="text-xs">CI/CD: {plan.infrastructure.devops.ci_cd.join(", ")}</p>
                          <p className="text-xs">Monitoring: {plan.infrastructure.devops.monitoring.join(", ")}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Security</p>
                        <div className="space-y-1">
                          <p className="text-xs">Compliance: {plan.infrastructure.security.compliance.join(", ")}</p>
                          <p className="text-xs">Backups: {plan.infrastructure.security.backups.substring(0, 30)}...</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Teams Tab */}
            <TabsContent value="teams" className="space-y-4">
              <div className="flex justify-end mb-4">
                <Button onClick={addTeam} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Team
                </Button>
              </div>
              <div className="grid gap-4">
                {plan.teams.map((team) => (
                  <Card key={team.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{team.name}</CardTitle>
                          <CardDescription>{team.description}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingTeam(team);
                              setShowTeamModal(true);
                            }}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => deleteTeam(team.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Team Details</p>
                          <div className="space-y-1">
                            <p className="text-sm">Members: {team.members}</p>
                            {team.lead && <p className="text-sm">Lead: {team.lead}</p>}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Responsibilities</p>
                          <ul className="list-disc list-inside text-sm">
                            {team.responsibilities.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {team.tools.length > 0 && (
                        <>
                          <Separator className="my-4" />
                          <div>
                            <p className="text-sm font-medium mb-2">Tools Used</p>
                            <div className="flex flex-wrap gap-2">
                              {team.tools.map((tool, i) => (
                                <Badge key={i} variant="outline">{tool}</Badge>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Infrastructure Tab */}
            <TabsContent value="infrastructure" className="space-y-4">
              <div className="flex justify-end mb-4">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setEditingInfra(plan.infrastructure);
                    setShowInfraModal(true);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Infrastructure
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Cloud Infrastructure */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cloud className="w-5 h-5 text-primary" />
                      Cloud Infrastructure
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Provider</p>
                      <p className="text-lg font-bold">{plan.infrastructure.cloud.provider}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Services</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {plan.infrastructure.cloud.services.map((s, i) => (
                          <Badge key={i} variant="secondary">{s}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Cost</p>
                        <p className="font-medium">{plan.infrastructure.cloud.monthly_cost}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Scalability</p>
                        <p className="font-medium capitalize">{plan.infrastructure.cloud.scalability}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* DevOps Stack */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-primary" />
                      DevOps Stack
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">CI/CD</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {plan.infrastructure.devops.ci_cd.map((item, i) => (
                          <Badge key={i} variant="outline">{item}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Monitoring</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {plan.infrastructure.devops.monitoring.map((item, i) => (
                          <Badge key={i} variant="outline">{item}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Logging</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {plan.infrastructure.devops.logging.map((item, i) => (
                          <Badge key={i} variant="outline">{item}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Security & Compliance */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Security & Compliance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Security Measures</p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {plan.infrastructure.security.measures.map((m, i) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Compliance</p>
                        <div className="space-y-1">
                          {plan.infrastructure.security.compliance.map((c, i) => (
                            <Badge key={i} className="mr-1">{c}</Badge>
                          ))}
                        </div>
                        <p className="text-sm font-medium mt-3 mb-2">Certifications</p>
                        <div className="space-y-1">
                          {plan.infrastructure.security.certifications.map((cert, i) => (
                            <Badge key={i} variant="outline">{cert}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Backup & DR</p>
                        <p className="text-sm mb-2">{plan.infrastructure.security.backups}</p>
                        <p className="text-sm font-medium mt-2">DRP:</p>
                        <p className="text-sm">{plan.infrastructure.security.drp}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* KPIs Tab */}
            <TabsContent value="kpis" className="space-y-4">
              <div className="flex justify-end mb-4">
                <Button onClick={addKPI} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add KPI
                </Button>
              </div>
              <div className="grid gap-4">
                {plan.kpis.map((kpi) => (
                  <Card key={kpi.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{kpi.name}</h3>
                            <Badge variant="outline">{kpi.category}</Badge>
                            {getTrendIcon(kpi.trend)}
                          </div>
                          <div className="grid grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Target</p>
                              <p className="text-lg font-bold">{kpi.target}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Current</p>
                              <p className="text-lg font-bold">{kpi.current}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Unit</p>
                              <p className="text-sm">{kpi.unit}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Frequency</p>
                              <p className="text-sm">{kpi.frequency}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingKPI(kpi);
                              setShowKPIModal(true);
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600"
                            onClick={() => deleteKPI(kpi.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Progress 
                          value={(parseFloat(kpi.current) / parseFloat(kpi.target)) * 100} 
                          className="h-2" 
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Edit Team Modal */}
      <Dialog open={showTeamModal} onOpenChange={setShowTeamModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
          </DialogHeader>
          {editingTeam && (
            <div className="space-y-4">
              <div>
                <Label>Team Name</Label>
                <Input
                  value={editingTeam.name}
                  onChange={(e) => setEditingTeam({...editingTeam, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingTeam.description}
                  onChange={(e) => setEditingTeam({...editingTeam, description: e.target.value})}
                />
              </div>
              <div>
                <Label>Team Lead</Label>
                <Input
                  value={editingTeam.lead || ""}
                  onChange={(e) => setEditingTeam({...editingTeam, lead: e.target.value})}
                />
              </div>
              <div>
                <Label>Number of Members</Label>
                <Input
                  type="number"
                  value={editingTeam.members}
                  onChange={(e) => setEditingTeam({...editingTeam, members: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={saveTeamEdit} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setShowTeamModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Tool Modal */}
      <Dialog open={showToolModal} onOpenChange={setShowToolModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Tool</DialogTitle>
          </DialogHeader>
          {editingTool && (
            <div className="space-y-4">
              <div>
                <Label>Tool Name</Label>
                <Input
                  value={editingTool.name}
                  onChange={(e) => setEditingTool({...editingTool, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Purpose</Label>
                <Input
                  value={editingTool.purpose}
                  onChange={(e) => setEditingTool({...editingTool, purpose: e.target.value})}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={editingTool.category}
                  onValueChange={(value: any) => setEditingTool({...editingTool, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="project-management">Project Management</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cost</Label>
                <Select
                  value={editingTool.cost}
                  onValueChange={(value: any) => setEditingTool({...editingTool, cost: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={saveToolEdit} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setShowToolModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Process Modal */}
      <Dialog open={showProcessModal} onOpenChange={setShowProcessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Process</DialogTitle>
          </DialogHeader>
          {editingProcess && (
            <div className="space-y-4">
              <div>
                <Label>Process Name</Label>
                <Input
                  value={editingProcess.name}
                  onChange={(e) => setEditingProcess({...editingProcess, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingProcess.description}
                  onChange={(e) => setEditingProcess({...editingProcess, description: e.target.value})}
                />
              </div>
              <div>
                <Label>Owner</Label>
                <Input
                  value={editingProcess.owner}
                  onChange={(e) => setEditingProcess({...editingProcess, owner: e.target.value})}
                />
              </div>
              <div>
                <Label>Frequency</Label>
                <Select
                  value={editingProcess.frequency}
                  onValueChange={(value: any) => setEditingProcess({...editingProcess, frequency: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="as-needed">As Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={editingProcess.status}
                  onValueChange={(value: any) => setEditingProcess({...editingProcess, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="needs-review">Needs Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={saveProcessEdit} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setShowProcessModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit KPI Modal */}
      <Dialog open={showKPIModal} onOpenChange={setShowKPIModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit KPI</DialogTitle>
          </DialogHeader>
          {editingKPI && (
            <div className="space-y-4">
              <div>
                <Label>KPI Name</Label>
                <Input
                  value={editingKPI.name}
                  onChange={(e) => setEditingKPI({...editingKPI, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Target</Label>
                <Input
                  value={editingKPI.target}
                  onChange={(e) => setEditingKPI({...editingKPI, target: e.target.value})}
                />
              </div>
              <div>
                <Label>Current</Label>
                <Input
                  value={editingKPI.current}
                  onChange={(e) => setEditingKPI({...editingKPI, current: e.target.value})}
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Input
                  value={editingKPI.unit}
                  onChange={(e) => setEditingKPI({...editingKPI, unit: e.target.value})}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={editingKPI.category}
                  onValueChange={(value: any) => setEditingKPI({...editingKPI, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="reliability">Reliability</SelectItem>
                    <SelectItem value="cost">Cost</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Frequency</Label>
                <Select
                  value={editingKPI.frequency}
                  onValueChange={(value: any) => setEditingKPI({...editingKPI, frequency: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Trend</Label>
                <Select
                  value={editingKPI.trend}
                  onValueChange={(value: any) => setEditingKPI({...editingKPI, trend: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="up">Up ↑</SelectItem>
                    <SelectItem value="down">Down ↓</SelectItem>
                    <SelectItem value="stable">Stable →</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={saveKPIEdit} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setShowKPIModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Infrastructure Modal */}
      <Dialog open={showInfraModal} onOpenChange={setShowInfraModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Infrastructure</DialogTitle>
          </DialogHeader>
          {editingInfra && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
              <div className="space-y-2">
                <Label>Cloud Provider</Label>
                <Input
                  value={editingInfra.cloud.provider}
                  onChange={(e) => setEditingInfra({
                    ...editingInfra,
                    cloud: { ...editingInfra.cloud, provider: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Cloud Services (comma separated)</Label>
                <Input
                  value={editingInfra.cloud.services.join(", ")}
                  onChange={(e) => setEditingInfra({
                    ...editingInfra,
                    cloud: { 
                      ...editingInfra.cloud, 
                      services: e.target.value.split(",").map(s => s.trim()).filter(s => s)
                    }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Monthly Cost</Label>
                <Input
                  value={editingInfra.cloud.monthly_cost}
                  onChange={(e) => setEditingInfra({
                    ...editingInfra,
                    cloud: { ...editingInfra.cloud, monthly_cost: e.target.value }
                  })}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>CI/CD Tools (comma separated)</Label>
                <Input
                  value={editingInfra.devops.ci_cd.join(", ")}
                  onChange={(e) => setEditingInfra({
                    ...editingInfra,
                    devops: { 
                      ...editingInfra.devops, 
                      ci_cd: e.target.value.split(",").map(s => s.trim()).filter(s => s)
                    }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Monitoring Tools (comma separated)</Label>
                <Input
                  value={editingInfra.devops.monitoring.join(", ")}
                  onChange={(e) => setEditingInfra({
                    ...editingInfra,
                    devops: { 
                      ...editingInfra.devops, 
                      monitoring: e.target.value.split(",").map(s => s.trim()).filter(s => s)
                    }
                  })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={saveInfrastructureEdit} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setShowInfraModal(false)} className="flex-1">
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