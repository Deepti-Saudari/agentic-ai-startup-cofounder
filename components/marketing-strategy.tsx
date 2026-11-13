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
  RefreshCw, Megaphone, Users, TrendingUp, Target,
  Download, Share2, Mail, Globe,  // Globe instead of social icons
  Search, DollarSign,
  Clock, Calendar, CheckCircle, Zap, Award, Sparkles,
  BarChart, PieChart, MessageCircle, Video, BookOpen,
  Rocket, Heart, Star, Flag, Filter, Layers,
  AlertCircle
} from "lucide-react"
import { apiFetch } from "@/lib/api"

interface Milestone {
  milestone: string;
  date: string;
  quarter: string;
  status: "Not Started" | "In Progress" | "Completed";
}

interface MarketingPlan {
  target_audience: {
    segment: string
    description: string
    pain_points: string[]
    channels: string[]
    priority: "High" | "Medium" | "Low"
  }[]
  
  
  acquisition_channels: {
    channel: string
    type: "Organic" | "Paid" | "Partnership"
    cost_level: "Low" | "Medium" | "High"
    expected_roi: string
    time_to_results: string
    tactics: string[]
  }[]
  
  marketing_strategy: {
    phase: string
    objective: string
    activities: string[]
    metrics: string[]
    timeline: string
  }[]
  
  growth_plan: {
    quarter: string
    focus: string
    initiatives: string[]
    target_metrics: {
      metric: string
      target: string
    }[]
    budget_allocation: string
  }[]
  
  content_strategy: {
    content_type: string
    topics: string[]
    frequency: string
    platforms: string[]
  }[]
  
  competitive_analysis: {
    competitor: string
    our_advantage: string
    threat_level: "Low" | "Medium" | "High"
    response_strategy: string
  }[]
  
  budget_breakdown: {
    category: string
    percentage: number
    amount: string
    description: string
  }[]
  
  kpis: {
    metric: string
    target: string
    measurement: string
    frequency: string
  }[]
  
  timeline_milestones: Milestone[]
}

export function MarketingStrategy() {
  const [startupIdea, setStartupIdea] = useState("")
  const [industry, setIndustry] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasPlan, setHasPlan] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  const [plan, setPlan] = useState<MarketingPlan>({
    target_audience: [],
    acquisition_channels: [],
    marketing_strategy: [],
    growth_plan: [],
    content_strategy: [],
    competitive_analysis: [],
    budget_breakdown: [],
    kpis: [],
    timeline_milestones: []
  })

  const generateMarketingPlan = async () => {
    if (!startupIdea || !industry) {
      alert("Please enter both startup idea and industry");
      return;
    }

    setIsGenerating(true);
    setHasPlan(false);
    setError(null);

    try {
      const response = await apiFetch("/marketing-strategy", {
        method: "POST",
        body: JSON.stringify({
          startup_idea: startupIdea,
          industry: industry
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate marketing plan");
      }

      const data = await response.json();
      
      if (data.marketing_plan) {
        // Check if it's already complete enhanced format
        if (data.marketing_plan.target_audience && 
            Array.isArray(data.marketing_plan.target_audience) && 
            data.marketing_plan.target_audience.length > 0 &&
            typeof data.marketing_plan.target_audience[0] === 'object' &&
            data.marketing_plan.content_strategy &&
            data.marketing_plan.budget_breakdown &&
            data.marketing_plan.kpis) {
          setPlan(data.marketing_plan);
          setHasPlan(true);
        } else {
          // Transform simple format to enhanced format
          transformSimplePlan(data.marketing_plan);
        }
      } else {
        throw new Error("Invalid response format");
      }
      
    } catch (error) {
      console.error("Error generating plan:", error);
      setError(error instanceof Error ? error.message : "Failed to generate marketing plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const transformSimplePlan = (simplePlan: any) => {
  const today = new Date();
  
  const targetAudience = simplePlan?.target_audience || [];
  const channels = simplePlan?.acquisition_channels || [];
  const strategies = simplePlan?.marketing_strategy || [];
  const growthSteps = simplePlan?.growth_plan || [];

  // Generate dynamic budget based on channels and strategies
  const generateBudgetBreakdown = () => {
    const hasPaidChannels = channels.some((c: string) => 
      c.toLowerCase().includes('ads') || c.toLowerCase().includes('ppc') || c.toLowerCase().includes('sponsored')
    );
    
    const hasContentStrategy = strategies.some((s: string) => 
      s.toLowerCase().includes('content') || s.toLowerCase().includes('blog')
    );
    
    const hasSocialStrategy = strategies.some((s: string) => 
      s.toLowerCase().includes('social') || s.toLowerCase().includes('community')
    );
    
    const budget = [];
    
    if (hasPaidChannels || channels.length > 0) {
      budget.push({
        category: "Digital Advertising",
        percentage: 35,
        amount: "$35,000",
        description: `${channels.slice(0, 2).join(', ')} campaigns`
      });
    }
    
    if (hasContentStrategy) {
      budget.push({
        category: "Content Marketing",
        percentage: 25,
        amount: "$25,000",
        description: "Blog posts, whitepapers, case studies"
      });
    }
    
    if (hasSocialStrategy) {
      budget.push({
        category: "Social Media",
        percentage: 20,
        amount: "$20,000",
        description: "Organic & paid social campaigns"
      });
    }
    
    budget.push({
      category: "Events & Webinars",
      percentage: 20,
      amount: "$20,000",
      description: "Virtual and in-person events"
    });
    
    return budget;
  };

  // Generate dynamic KPIs based on industry and channels
  const generateKPIs = () => {
    const kpis = [];
    
    // Always include CAC
    kpis.push({
      metric: "Customer Acquisition Cost (CAC)",
      target: `$${Math.floor(Math.random() * 300 + 200)}-$${Math.floor(Math.random() * 500 + 400)}`,
      measurement: "Total marketing spend / new customers",
      frequency: "Monthly"
    });
    
    // Always include MQLs
    kpis.push({
      metric: "Marketing Qualified Leads (MQLs)",
      target: `${Math.floor(Math.random() * 150 + 100)}+/month`,
      measurement: "Lead form submissions",
      frequency: "Weekly"
    });
    
    // Channel-specific KPIs
    if (channels.some((c: string) => c.toLowerCase().includes('social'))) {
      kpis.push({
        metric: "Social Media Engagement",
        target: `${Math.floor(Math.random() * 5 + 3)}% engagement rate`,
        measurement: "Likes, shares, comments",
        frequency: "Weekly"
      });
    }
    
    if (channels.some((c: string) => c.toLowerCase().includes('email'))) {
      kpis.push({
        metric: "Email Marketing ROI",
        target: `${Math.floor(Math.random() * 20 + 30)}:1`,
        measurement: "Revenue / campaign cost",
        frequency: "Monthly"
      });
    }
    
    // Always include conversion rate
    kpis.push({
      metric: "Conversion Rate",
      target: `${Math.floor(Math.random() * 3 + 2)}-${Math.floor(Math.random() * 5 + 5)}%`,
      measurement: "Leads to customers",
      frequency: "Monthly"
    });
    
    // Always include website traffic
    kpis.push({
      metric: "Website Traffic",
      target: `${Math.floor(Math.random() * 5000 + 5000)}+/month`,
      measurement: "Google Analytics",
      frequency: "Daily"
    });
    
    return kpis;
  };

  // Generate dynamic timeline milestones based on strategies
  const generateTimelineMilestones = (): Milestone[] => {
  const today = new Date();
  const milestones: Milestone[] = [];  // 👈 Now TypeScript knows this is an array of Milestone objects
  const quarters = ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"];
  
  strategies.forEach((strategy: string, i: number) => {
    if (i < quarters.length) {
      milestones.push({
        milestone: `${strategy.split(' ').slice(0, 4).join(' ')} Campaign Launch`,
        date: new Date(today.getTime() + (i * 45 * 24 * 60 * 60 * 1000)).toLocaleDateString(),
        quarter: quarters[i],
        status: i === 0 ? "In Progress" : "Not Started"  // 👈 These values match the union type
      });
    }
  });
  
  channels.slice(0, 3).forEach((channel: string, i: number) => {
    if (strategies.length + i < quarters.length) {
      milestones.push({
        milestone: `${channel} Channel Optimization`,
        date: new Date(today.getTime() + ((strategies.length + i) * 45 * 24 * 60 * 60 * 1000)).toLocaleDateString(),
        quarter: quarters[strategies.length + i],
        status: "Not Started"  // 👈 This matches the union type
      });
    }
  });
  
  return milestones;
};

  // Generate dynamic competitive analysis based on industry
  const generateCompetitiveAnalysis = () => {
    const competitors = [
      {
        competitor: "Market Leader",
        our_advantage: `Better ${industry} specialization`,
        threat_level: "High" as const,
        response_strategy: "Focus on niche differentiation"
      },
      {
        competitor: "Direct Competitor",
        our_advantage: "More innovative features",
        threat_level: "Medium" as const,
        response_strategy: "Highlight technical advantages"
      },
      {
        competitor: "Emerging Startup",
        our_advantage: "Stronger market presence",
        threat_level: "Low" as const,
        response_strategy: "Monitor and acquire if successful"
      }
    ];
    
    return competitors;
  };

  // Generate dynamic content strategy based on audience and channels
  const generateContentStrategy = () => {
    const hasVideo = channels.some((c: string) => 
      c.toLowerCase().includes('youtube') || c.toLowerCase().includes('video')
    );
    
    const hasBlog = strategies.some((s: string) => 
      s.toLowerCase().includes('content') || s.toLowerCase().includes('blog')
    );
    
    const contentStrategy = [];
    
    if (hasBlog || true) { // Always include blog as default
      contentStrategy.push({
        content_type: "Blog Posts",
        topics: [
          `${industry} trends`,
          "Product updates",
          "Customer success stories",
          "Industry best practices"
        ],
        frequency: "Weekly",
        platforms: ["Website", "LinkedIn", "Medium"]
      });
    }
    
    if (hasVideo) {
      contentStrategy.push({
        content_type: "Video Tutorials",
        topics: [
          "Product demos",
          "Use cases",
          "Industry solutions",
          "Expert interviews"
        ],
        frequency: "Bi-weekly",
        platforms: ["YouTube", "Website", "LinkedIn"]
      });
    }
    
    contentStrategy.push({
      content_type: "Case Studies",
      topics: [
        "Customer success",
        "ROI analysis",
        "Industry benchmarks",
        "Implementation guides"
      ],
      frequency: "Monthly",
      platforms: ["Website", "Sales materials", "Email"]
    });
    
    if (channels.some((c: string) => c.toLowerCase().includes('social'))) {
      contentStrategy.push({
        content_type: "Social Media Content",
        topics: [
          "Industry insights",
          "Product tips",
          "Company culture",
          "Community highlights"
        ],
        frequency: "Daily",
        platforms: channels.filter((c: string) => 
          c.toLowerCase().includes('linkedin') || 
          c.toLowerCase().includes('twitter') || 
          c.toLowerCase().includes('facebook')
        )
      });
    }
    
    return contentStrategy;
  };

  const enhancedPlan: MarketingPlan = {
    target_audience: targetAudience.map((audience: string, i: number) => ({
      segment: audience,
      description: `${audience} who need ${startupIdea.split(' ').slice(0, 3).join(' ')}`,
      pain_points: [
        "Inefficient current solutions",
        "High costs of alternatives",
        "Lack of specialized tools",
        "Time-consuming manual processes"
      ].slice(0, Math.floor(Math.random() * 3) + 2),
      channels: channels.slice(0, 3).map((c: string) => c),
      priority: i < 2 ? "High" : i < 4 ? "Medium" : "Low"
    })),
    
    acquisition_channels: channels.map((channel: string) => ({
      channel: channel,
      type: channel.toLowerCase().includes('ads') || channel.toLowerCase().includes('ppc') ? "Paid" :
             channel.toLowerCase().includes('partner') ? "Partnership" : "Organic",
      cost_level: channel.toLowerCase().includes('seo') || channel.toLowerCase().includes('social') ? "Low" :
                  channel.toLowerCase().includes('ads') ? "High" : "Medium",
      expected_roi: `${Math.floor(Math.random() * 200 + 150)}%`,
      time_to_results: `${Math.floor(Math.random() * 2 + 1)}-${Math.floor(Math.random() * 3 + 3)} months`,
      tactics: [
        `Optimize ${channel} presence`,
        `Create targeted ${channel} campaigns`,
        `Measure and optimize performance`,
        `Scale successful initiatives`
      ]
    })),
    
    marketing_strategy: strategies.map((strategy: string, i: number) => ({
      phase: `Phase ${i + 1}: ${strategy.split(' ').slice(0, 4).join(' ')}`,
      objective: strategy,
      activities: [
        "Market research and analysis",
        "Campaign asset creation",
        "Channel-specific execution",
        "Performance tracking",
        "Optimization and iteration"
      ].slice(0, Math.floor(Math.random() * 3) + 3),
      metrics: [
        "Reach & impressions",
        "Engagement rate",
        "Click-through rate",
        "Conversion rate",
        "ROI"
      ].slice(0, Math.floor(Math.random() * 3) + 3),
      timeline: `Q${Math.floor(i/2) + 1} 2024`
    })),
    
    growth_plan: growthSteps.map((step: string, i: number) => ({
      quarter: `Q${i + 1} 2024`,
      focus: step,
      initiatives: [
        `Launch ${step} initiative`,
        `Build strategic partnerships`,
        `Scale high-performing channels`,
        `Expand to new segments`
      ].slice(0, Math.floor(Math.random() * 2) + 2),
      target_metrics: [
        { metric: "Revenue Growth", target: `+${(i + 1) * 20}%` },
        { metric: "Customer Acquisition", target: `${(i + 1) * 100}+` },
        { metric: "Market Share", target: `${(i + 1) * 2}%` }
      ].slice(0, 2),
      budget_allocation: `$${(i + 1) * 25}K - $${(i + 1) * 35}K`
    })),
    
    content_strategy: generateContentStrategy(),
    
    competitive_analysis: generateCompetitiveAnalysis(),
    
    budget_breakdown: generateBudgetBreakdown(),
    
    kpis: generateKPIs(),
    
    timeline_milestones: generateTimelineMilestones()
  };
  
  setPlan(enhancedPlan);
  setHasPlan(true);
};

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "High": return "bg-red-100 text-red-800"
      case "Medium": return "bg-yellow-100 text-yellow-800"
      case "Low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  };

  const getChannelIcon = (type: string) => {
  switch(type.toLowerCase()) {
    case "mail": 
    case "email": 
      return <Mail className="w-4 h-4" />;
      
    case "search":
    case "seo":
    case "google":
      return <Search className="w-4 h-4" />;
      
    case "youtube":
    case "video":
    case "tutorial":
      return <Video className="w-4 h-4" />;
      
    case "twitter":
    case "linkedin":
    case "facebook":
    case "instagram":
    case "social":
    case "social media":
      return <Share2 className="w-4 h-4" />;  // Generic social icon
      
    case "blog":
    case "content":
      return <BookOpen className="w-4 h-4" />;
      
    case "events":
    case "webinar":
      return <Calendar className="w-4 h-4" />;
      
    case "ads":
    case "advertising":
    case "ppc":
      return <DollarSign className="w-4 h-4" />;
      
    default:
      return <Globe className="w-4 h-4" />;  // Default for everything else
  }
};

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Completed": return "bg-green-100 text-green-800"
      case "In Progress": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Marketing Strategy Generator</h1>
          <p className="text-muted-foreground">
            Generate a comprehensive go-to-market strategy and growth plan for your startup.
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
      <Card className="border-2 border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-6 h-6 text-primary" />
            AI-Powered Marketing Strategy
          </CardTitle>
          <CardDescription>
            Our AI will generate a comprehensive marketing plan with audience targeting, channel strategy, and growth roadmap
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="idea" className="text-sm font-medium">Startup Idea</Label>
              <Input
                id="idea"
                placeholder="e.g., AI-powered code review assistant for developers"
                value={startupIdea}
                onChange={(e) => setStartupIdea(e.target.value)}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">Describe your product or service</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry" className="text-sm font-medium">Target Industry</Label>
              <Input
                id="industry"
                placeholder="e.g., Developer Tools, SaaS, Fintech"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">Select your primary industry</p>
            </div>
          </div>

          <Button 
            onClick={generateMarketingPlan} 
            disabled={isGenerating} 
            size="lg"
            className="mt-6 w-full md:w-auto"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing & Generating Marketing Strategy...
              </>
            ) : (
              <>
                <Megaphone className="w-4 h-4 mr-2" />
                Generate AI Marketing Plan
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
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Target Audiences</p>
                    <p className="text-2xl font-bold">{plan.target_audience.length}</p>
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
                    <p className="text-sm text-muted-foreground">Acquisition Channels</p>
                    <p className="text-2xl font-bold">{plan.acquisition_channels.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Globe className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Budget Categories</p>
                    <p className="text-2xl font-bold">{plan.budget_breakdown.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">KPIs Tracked</p>
                    <p className="text-2xl font-bold">{plan.kpis.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <BarChart className="w-5 h-5 text-orange-600" />
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
              <TabsTrigger value="audience" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Audience
              </TabsTrigger>
              <TabsTrigger value="channels" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Channels
              </TabsTrigger>
              <TabsTrigger value="strategy" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Strategy
              </TabsTrigger>
              <TabsTrigger value="metrics" className="flex items-center gap-2">
                <BarChart className="w-4 h-4" />
                Metrics
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Budget Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-primary" />
                      Budget Allocation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.budget_breakdown.map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{item.category}</span>
                          <span>{item.percentage}% ( {item.amount})</span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                        {i < plan.budget_breakdown.length - 1 && <Separator className="mt-2" />}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Timeline Milestones */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Key Milestones
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.timeline_milestones.map((milestone, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`w-2 h-2 mt-2 rounded-full ${
                          milestone.status === "Completed" ? "bg-green-500" :
                          milestone.status === "In Progress" ? "bg-blue-500" : "bg-gray-300"
                        }`} />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium text-sm">{milestone.milestone}</p>
                            <Badge variant="outline">{milestone.quarter}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">Target: {milestone.date}</p>
                          <Badge className={`mt-1 ${getStatusColor(milestone.status)}`}>
                            {milestone.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Competitive Analysis */}
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      Competitive Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {plan.competitive_analysis.map((comp, i) => (
                        <Card key={i} className="border-2">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center justify-between">
                              {comp.competitor}
                              <Badge className={
                                comp.threat_level === "High" ? "bg-red-100 text-red-800" :
                                comp.threat_level === "Medium" ? "bg-yellow-100 text-yellow-800" :
                                "bg-green-100 text-green-800"
                              }>
                                {comp.threat_level} Threat
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <p><span className="font-medium">Our Advantage:</span> {comp.our_advantage}</p>
                            <p><span className="font-medium">Strategy:</span> {comp.response_strategy}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Audience Tab */}
            <TabsContent value="audience" className="space-y-4">
              <div className="grid gap-4">
                {plan.target_audience.map((audience, idx) => (
                  <Card key={idx}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="w-5 h-5 text-primary" />
                          {audience.segment}
                        </CardTitle>
                        <Badge className={getPriorityColor(audience.priority)}>
                          {audience.priority} Priority
                        </Badge>
                      </div>
                      <CardDescription>{audience.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Pain Points:</p>
                        <div className="flex flex-wrap gap-2">
                          {audience.pain_points.map((point, i) => (
                            <Badge key={i} variant="outline" className="bg-red-50">
                              {point}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Best Channels:</p>
                        <div className="flex flex-wrap gap-2">
                          {audience.channels.map((channel, i) => (
                            <Badge key={i} variant="secondary" className="flex items-center gap-1">
                              {getChannelIcon(channel.toLowerCase())}
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Channels Tab */}
            <TabsContent value="channels" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {plan.acquisition_channels.map((channel, idx) => (
                  <Card key={idx}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          {getChannelIcon(channel.channel.toLowerCase())}
                          {channel.channel}
                        </CardTitle>
                        <div className="flex gap-1">
                          <Badge variant="outline" className={
                            channel.type === "Organic" ? "bg-green-50" :
                            channel.type === "Paid" ? "bg-blue-50" : "bg-purple-50"
                          }>
                            {channel.type}
                          </Badge>
                          <Badge variant="outline" className={
                            channel.cost_level === "Low" ? "bg-green-50" :
                            channel.cost_level === "Medium" ? "bg-yellow-50" : "bg-red-50"
                          }>
                            {channel.cost_level} Cost
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Expected ROI</p>
                          <p className="font-medium">{channel.expected_roi}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Time to Results</p>
                          <p className="font-medium">{channel.time_to_results}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Tactics:</p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {channel.tactics.map((tactic, i) => (
                            <li key={i}>{tactic}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Strategy Tab */}
            <TabsContent value="strategy" className="space-y-4">
              <div className="grid gap-4">
                {/* Marketing Strategy Phases */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-primary" />
                      Marketing Strategy Phases
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.marketing_strategy.map((strategy, idx) => (
                      <div key={idx} className="border-l-4 border-primary pl-4 py-2">
                        <div className="flex justify-between mb-2">
                          <h3 className="font-semibold">{strategy.phase}</h3>
                          <Badge variant="outline">{strategy.timeline}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{strategy.objective}</p>
                        <div className="grid md:grid-cols-2 gap-4 mt-2">
                          <div>
                            <p className="text-sm font-medium">Activities:</p>
                            <ul className="list-disc list-inside text-sm">
                              {strategy.activities.map((act, i) => (
                                <li key={i}>{act}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Key Metrics:</p>
                            <ul className="list-disc list-inside text-sm">
                              {strategy.metrics.map((metric, i) => (
                                <li key={i}>{metric}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Content Strategy */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      Content Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {plan.content_strategy.map((content, idx) => (
                        <Card key={idx} className="border-2">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{content.content_type}</CardTitle>
                            <CardDescription>Frequency: {content.frequency}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div>
                              <p className="font-medium">Topics:</p>
                              <ul className="list-disc list-inside">
                                {content.topics.map((topic, i) => (
                                  <li key={i}>{topic}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="font-medium">Platforms:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {content.platforms.map((platform, i) => (
                                  <Badge key={i} variant="secondary">{platform}</Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Metrics Tab */}
            <TabsContent value="metrics" className="space-y-4">
              <div className="grid gap-4">
                {/* KPIs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Key Performance Indicators (KPIs)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {plan.kpis.map((kpi, idx) => (
                        <Card key={idx} className="border-2">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center justify-between">
                              {kpi.metric}
                              <Badge variant="outline">{kpi.frequency}</Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Target:</span>
                              <span className="font-bold text-primary">{kpi.target}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Measurement:</span>
                              <span className="text-sm">{kpi.measurement}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Growth Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-primary" />
                      Quarterly Growth Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {plan.growth_plan.map((quarter, idx) => (
                        <div key={idx} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-lg">{quarter.quarter}: {quarter.focus}</h3>
                            <Badge variant="outline">{quarter.budget_allocation}</Badge>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium mb-2">Initiatives:</p>
                              <ul className="list-disc list-inside text-sm space-y-1">
                                {quarter.initiatives.map((init, i) => (
                                  <li key={i}>{init}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-2">Targets:</p>
                              {quarter.target_metrics.map((metric, i) => (
                                <div key={i} className="flex justify-between text-sm mb-1">
                                  <span>{metric.metric}:</span>
                                  <span className="font-medium">{metric.target}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
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