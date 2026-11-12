"use client"

import { useState } from "react"
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
  RefreshCw, DollarSign, Users, TrendingUp, Target,
  Download, Share2, Mail, Globe, Search, Clock,
  Calendar, CheckCircle, Zap, Award, Sparkles,
  BarChart, PieChart, MessageCircle, Video, BookOpen,
  Rocket, Heart, Star, Flag, Filter, Layers,
  AlertCircle, Briefcase, Building, Wallet, LineChart,
  Shield, ThumbsUp, MessageSquare, Send, Phone,
  VideoIcon, FileText, CheckSquare, XCircle, PlusCircle,
  ExternalLink, MapPin, Twitter, Linkedin, Github
} from "lucide-react"
import { getApiUrl } from "@/lib/api"

// ============= INTERFACES =============
interface Investor {
  id: string;
  name: string;
  firm: string;
  type: string;
  partner_name?: string;
  location: string;
  investment_stage: string[];
  check_size: string;
  industries: string[];
  portfolio?: string[];
  bio?: string;
  recent_investments: string[];
  website?: string;
  intro_required?: boolean;
  meeting_available?: boolean;
  last_active?: string;
  match_score?: number;
  email?: string;
  twitter?: string;
  linkedin?: string;
  logo?: string;
}

interface FundingRound {
  stage: string;
  amount: string;
  valuation: string;
  timeline: string;
  milestones: string[];
  interested_investors: number;
  meetings_scheduled: number;
  term_sheets: number;
  status: "Not Started" | "In Progress" | "Completed";
}

interface Meeting {
  id: string;
  investor: string;
  firm: string;
  date: string;
  time: string;
  type: string;
  status: string;
}

interface TermSheet {
  id: string;
  investor: string;
  firm: string;
  amount: string;
  valuation: string;
  equity: string;
  status: string;
}

interface FundingPlan {
  startup_idea: string;
  industry: string;
  stage: string;
  funding_rounds: FundingRound[];
  matched_investors: Investor[];
  target_investors: {
    type: string;
    count: number;
    examples: string[];
    strategy: string;
  }[];
  pitch_deck_feedback: {
    investor: string;
    feedback: string;
    rating: number;
    date: string;
  }[];
  scheduled_meetings: Meeting[];
  term_sheets: TermSheet[];
  fundraising_strategy: {
    phase: string;
    activities: string[];
    timeline: string;
    target_amount: string;
  }[];
  use_of_funds: {
    category: string;
    percentage: number;
    amount: string;
    description: string;
  }[];
  market_comps: {
    company: string;
    stage: string;
    valuation: string;
    amount_raised: string;
    investors: string[];
  }[];
  key_metrics: {
    metric: string;
    current: string;
    target: string;
    importance: "High" | "Medium" | "Low";
  }[];
  due_diligence_checklist: {
    category: string;
    items: {
      item: string;
      status: "Not Started" | "In Progress" | "Ready";
    }[];
  }[];
  last_updated?: string;
}

// ============= MAIN COMPONENT =============
export function FundingStrategy() {
  const [startupIdea, setStartupIdea] = useState("")
  const [industry, setIndustry] = useState("")
  const [stage, setStage] = useState<"Idea" | "Pre-seed" | "Seed" | "Series A" | "Series B" | "Series C+">("Seed")
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasPlan, setHasPlan] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  
  // Interactive states
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null)
  const [outreachMessage, setOutreachMessage] = useState("")
  const [showInvestorModal, setShowInvestorModal] = useState(false)
  const [filterIndustry, setFilterIndustry] = useState<string>("")
  const [filterStage, setFilterStage] = useState<string>("")

  const [plan, setPlan] = useState<FundingPlan>({
    startup_idea: "",
    industry: "",
    stage: "Seed",
    funding_rounds: [],
    matched_investors: [],
    target_investors: [],
    pitch_deck_feedback: [],
    scheduled_meetings: [],
    term_sheets: [],
    fundraising_strategy: [],
    use_of_funds: [],
    market_comps: [],
    key_metrics: [],
    due_diligence_checklist: [],
    last_updated: undefined
  })

  // Filter investors based on industry and stage
  const filteredInvestors = plan.matched_investors.filter((investor: Investor) => {
    if (filterIndustry && !investor.industries?.some((i: string) => 
      i.toLowerCase().includes(filterIndustry.toLowerCase())
    )) {
      return false;
    }
    if (filterStage && !investor.investment_stage?.some((s: string) => 
      s.toLowerCase().includes(filterStage.toLowerCase())
    )) {
      return false;
    }
    return true;
  });

  const generateFundingPlan = async () => {
    if (!startupIdea || !industry) {
      alert("Please enter both startup idea and industry");
      return;
    }

    setIsGenerating(true);
    setHasPlan(false);
    setError(null);

    try {
      // Call your API
      const response = await fetch(getApiUrl('/investors'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          industry,
          stage,
          startupIdea
        })
      });

      const data = await response.json();
      
      if (data.investors) {
        // Generate complete funding plan with all data
        const completePlan = generateCompletePlan(data.investors, industry, stage, startupIdea);
        setPlan(completePlan);
        setHasPlan(true);
      }
      
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to fetch investors');
      
      // Fallback to complete demo data
      const demoInvestors = getDemoInvestors(industry, stage);
      const completePlan = generateCompletePlan(demoInvestors, industry, stage, startupIdea);
      setPlan(completePlan);
      setHasPlan(true);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate complete funding plan with all data
  const generateCompletePlan = (investors: Investor[], industry: string, stage: string, idea: string): FundingPlan => {
    return {
      startup_idea: idea,
      industry: industry,
      stage: stage,
      
      // Funding rounds based on stage
      funding_rounds: getFundingRoundsByStage(stage),
      
      // Matched investors
      matched_investors: investors,
      
      // Target investors by type
      target_investors: [
        {
          type: "Venture Capital",
          count: 25,
          examples: ["Andreessen Horowitz", "Sequoia", "Bessemer"],
          strategy: "Target partners at seed and Series A funds through warm intros"
        },
        {
          type: "Angel Investors",
          count: 50,
          examples: ["Naval Ravikant", "Elad Gil", "Individual Angels"],
          strategy: "Leverage AngelList and startup communities"
        },
        {
          type: "Accelerators",
          count: 15,
          examples: ["Y Combinator", "Techstars", "500 Startups"],
          strategy: "Apply to top programs for funding and mentorship"
        },
        {
          type: "Corporate VC",
          count: 10,
          examples: ["Google Ventures", "Microsoft M12", "Salesforce Ventures"],
          strategy: "Target strategic investors in your industry"
        }
      ],
      
      // Pitch deck feedback
      pitch_deck_feedback: [
        {
          investor: "Sarah Chen (A16Z)",
          feedback: "Strong team and market opportunity. Need more clarity on unit economics.",
          rating: 4,
          date: "2 days ago"
        },
        {
          investor: "Michael Rodriguez (YC)",
          feedback: "Impressive traction. Would like to see customer acquisition strategy.",
          rating: 5,
          date: "1 week ago"
        },
        {
          investor: "David Kumar (Techstars)",
          feedback: "Good product, but competition section needs more detail.",
          rating: 3,
          date: "2 weeks ago"
        }
      ],
      
      // Scheduled meetings
      scheduled_meetings: [
        {
          id: "1",
          investor: "Sarah Chen",
          firm: "Andreessen Horowitz",
          date: "Mar 25, 2024",
          time: "11:00 AM PST",
          type: "Video Call",
          status: "Confirmed"
        },
        {
          id: "2",
          investor: "Michael Rodriguez",
          firm: "Y Combinator",
          date: "Mar 28, 2024",
          time: "2:00 PM PST",
          type: "Video Call",
          status: "Pending"
        },
        {
          id: "3",
          investor: "Jennifer Park",
          firm: "First Round Capital",
          date: "Apr 2, 2024",
          time: "10:30 AM PST",
          type: "In Person",
          status: "Confirmed"
        }
      ],
      
      // Term sheets
      term_sheets: [
        {
          id: "ts1",
          investor: "Techstars",
          firm: "Techstars",
          amount: "$120K",
          valuation: "N/A",
          equity: "6%",
          status: "Reviewing"
        }
      ],
      
      // Fundraising strategy
      fundraising_strategy: [
        {
          phase: "Phase 1: Preparation",
          activities: [
            "Finalize pitch deck",
            "Build financial model",
            "Create investor list",
            "Prepare data room"
          ],
          timeline: "Weeks 1-2",
          target_amount: "N/A"
        },
        {
          phase: "Phase 2: Outreach",
          activities: [
            "Initial investor meetings",
            "Follow-up communications",
            "Incorporate feedback",
            "Iterate on pitch"
          ],
          timeline: "Weeks 3-6",
          target_amount: "$500K - $1M"
        },
        {
          phase: "Phase 3: Due Diligence",
          activities: [
            "Share data room",
            "Reference calls",
            "Legal review",
            "Final negotiations"
          ],
          timeline: "Weeks 7-10",
          target_amount: "$1M - $2M"
        },
        {
          phase: "Phase 4: Close",
          activities: [
            "Review term sheets",
            "Legal documentation",
            "Sign agreements",
            "Announce funding"
          ],
          timeline: "Weeks 11-12",
          target_amount: "$2M - $3M"
        }
      ],
      
      // Use of funds
      use_of_funds: [
        {
          category: "Product Development",
          percentage: 40,
          amount: "$400K - $600K",
          description: "Engineering, product, and design team expansion"
        },
        {
          category: "Sales & Marketing",
          percentage: 30,
          amount: "$300K - $450K",
          description: "Customer acquisition, content marketing, events"
        },
        {
          category: "Team Expansion",
          percentage: 20,
          amount: "$200K - $300K",
          description: "Hiring key roles, salaries, benefits"
        },
        {
          category: "Operations",
          percentage: 10,
          amount: "$100K - $150K",
          description: "Legal, accounting, tools, infrastructure"
        }
      ],
      
      // Market comparables
      market_comps: [
        {
          company: "Company A",
          stage: "Seed",
          valuation: "$15M",
          amount_raised: "$3M",
          investors: ["A16Z", "YC"]
        },
        {
          company: "Company B",
          stage: "Series A",
          valuation: "$45M",
          amount_raised: "$8M",
          investors: ["Sequoia", "Index"]
        },
        {
          company: "Company C",
          stage: "Seed",
          valuation: "$12M",
          amount_raised: "$2.5M",
          investors: ["First Round", "Benchmark"]
        },
        {
          company: "Company D",
          stage: "Series A",
          valuation: "$50M",
          amount_raised: "$10M",
          investors: ["GV", "Kleiner Perkins"]
        }
      ],
      
      // Key metrics
      key_metrics: [
        {
          metric: "Monthly Recurring Revenue (MRR)",
          current: "$5K - $10K",
          target: "$50K+ for Seed",
          importance: "High"
        },
        {
          metric: "User Growth (MoM)",
          current: "15-20%",
          target: "20%+",
          importance: "High"
        },
        {
          metric: "Customer Acquisition Cost (CAC)",
          current: "$50 - $100",
          target: "< $50",
          importance: "Medium"
        },
        {
          metric: "Gross Margin",
          current: "75%",
          target: "80%+",
          importance: "High"
        },
        {
          metric: "Burn Rate",
          current: "$50K/mo",
          target: "Efficient",
          importance: "Medium"
        }
      ],
      
      // Due diligence checklist
      due_diligence_checklist: [
  {
    category: "Legal",
    items: [
      { item: "Incorporation documents", status: "Not Started" },
      { item: "IP assignments", status: "Not Started" },
      { item: "Founder agreements", status: "Not Started" },
      { item: "Cap table", status: "Not Started" }
    ]
  },
  {
    category: "Financial",
    items: [
      { item: "Financial projections", status: "Not Started" },
      { item: "Bank statements (last 12 months)", status: "Not Started" },
      { item: "Tax returns", status: "Not Started" },
      { item: "Revenue metrics", status: "Not Started" }
    ]
  },
  {
    category: "Product",
    items: [
      { item: "Product roadmap", status: "Not Started" },
      { item: "Technical architecture docs", status: "Not Started" },
      { item: "Security audits", status: "Not Started" },
      { item: "User analytics", status: "Not Started" }
    ]
  },
  {
    category: "Team",
    items: [
      { item: "Founder resumes", status: "Not Started" },
      { item: "Team bios", status: "Not Started" },
      { item: "Advisor agreements", status: "Not Started" },
      { item: "Hiring plans", status: "Not Started" }
    ]
  }
],
      
      last_updated: new Date().toISOString()
    };
  };

  // Get funding rounds based on stage
  const getFundingRoundsByStage = (stage: string): FundingRound[] => {
    const rounds: { [key: string]: FundingRound[] } = {
      "Idea": [
        {
          stage: "Pre-seed",
          amount: "$100K - $500K",
          valuation: "$2M - $5M",
          timeline: "Now - 3 months",
          milestones: ["Build MVP", "Find co-founder", "Validate idea"],
          interested_investors: 15,
          meetings_scheduled: 2,
          term_sheets: 0,
          status: "In Progress"
        },
        {
          stage: "Seed",
          amount: "$500K - $2M",
          valuation: "$5M - $10M",
          timeline: "6-12 months",
          milestones: ["Launch product", "Get first customers"],
          interested_investors: 8,
          meetings_scheduled: 0,
          term_sheets: 0,
          status: "Not Started"
        }
      ],
      "Pre-seed": [
        {
          stage: "Pre-seed",
          amount: "$500K - $1.5M",
          valuation: "$5M - $8M",
          timeline: "Now - 3 months",
          milestones: ["Build MVP", "Hire core team"],
          interested_investors: 20,
          meetings_scheduled: 3,
          term_sheets: 1,
          status: "In Progress"
        },
        {
          stage: "Seed",
          amount: "$2M - $4M",
          valuation: "$10M - $15M",
          timeline: "6-12 months",
          milestones: ["Product-market fit", "$100K ARR"],
          interested_investors: 12,
          meetings_scheduled: 1,
          term_sheets: 0,
          status: "Not Started"
        }
      ],
      "Seed": [
        {
          stage: "Seed",
          amount: "$2M - $5M",
          valuation: "$10M - $20M",
          timeline: "Now - 6 months",
          milestones: ["Scale to $1M ARR", "Build sales team"],
          interested_investors: 25,
          meetings_scheduled: 4,
          term_sheets: 1,
          status: "In Progress"
        },
        {
          stage: "Series A",
          amount: "$5M - $15M",
          valuation: "$20M - $50M",
          timeline: "12-18 months",
          milestones: ["$2M+ ARR", "Enterprise customers"],
          interested_investors: 10,
          meetings_scheduled: 0,
          term_sheets: 0,
          status: "Not Started"
        }
      ],
      "Series A": [
        {
          stage: "Series A",
          amount: "$10M - $20M",
          valuation: "$40M - $80M",
          timeline: "Now - 9 months",
          milestones: ["Scale to $5M ARR", "Expand team"],
          interested_investors: 18,
          meetings_scheduled: 3,
          term_sheets: 0,
          status: "In Progress"
        },
        {
          stage: "Series B",
          amount: "$20M - $40M",
          valuation: "$80M - $200M",
          timeline: "18-24 months",
          milestones: ["International expansion", "$10M+ ARR"],
          interested_investors: 6,
          meetings_scheduled: 0,
          term_sheets: 0,
          status: "Not Started"
        }
      ],
      "Series B": [
        {
          stage: "Series B",
          amount: "$20M - $40M",
          valuation: "$100M - $250M",
          timeline: "Now - 12 months",
          milestones: ["Scale operations", "Expand to new markets"],
          interested_investors: 12,
          meetings_scheduled: 2,
          term_sheets: 0,
          status: "In Progress"
        }
      ],
      "Series C+": [
        {
          stage: "Series C",
          amount: "$50M - $100M",
          valuation: "$300M - $500M",
          timeline: "Now - 12 months",
          milestones: ["Prepare for IPO", "Acquisitions"],
          interested_investors: 8,
          meetings_scheduled: 1,
          term_sheets: 0,
          status: "In Progress"
        }
      ]
    };
    
    return rounds[stage] || rounds["Seed"];
  };

  const scheduleMeeting = (investor: Investor) => {
    alert(`Meeting scheduled with ${investor.firm}`);
  };

  const getMatchScoreColor = (score: number = 0) => {
    if (score >= 90) return "bg-green-100 text-green-700";
    if (score >= 75) return "bg-blue-100 text-blue-700";
    if (score >= 60) return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Ready": return "bg-green-100 text-green-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Not Started": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Demo data generator
  const getDemoInvestors = (industry: string, stage: string): Investor[] => {
    return [
      {
        id: '1',
        name: 'Andreessen Horowitz',
        firm: 'Andreessen Horowitz',
        type: 'VC',
        partner_name: 'Sarah Wang',
        location: 'Menlo Park, CA',
        investment_stage: ['Seed', 'Series A', 'Series B'],
        check_size: '$1M - $50M',
        industries: [industry, 'AI/ML', 'Developer Tools'],
        portfolio: ['GitHub', 'Stripe', 'Airbnb'],
        recent_investments: ['OpenAI', 'Databricks', 'Coinbase'],
        website: 'https://a16z.com',
        meeting_available: true,
        last_active: 'This week',
        match_score: 95,
        twitter: 'a16z',
        linkedin: 'andreessen-horowitz'
      },
      {
        id: '2',
        name: 'Sequoia Capital',
        firm: 'Sequoia Capital',
        type: 'VC',
        partner_name: 'Alfred Lin',
        location: 'Menlo Park, CA',
        investment_stage: ['Seed', 'Series A', 'Series B', 'Series C'],
        check_size: '$500K - $100M',
        industries: [industry, 'Enterprise', 'Fintech'],
        portfolio: ['Apple', 'Google', 'Oracle'],
        recent_investments: ['OpenAI', 'Snowflake', 'DoorDash'],
        website: 'https://sequoiacap.com',
        meeting_available: true,
        last_active: 'This week',
        match_score: 92,
        linkedin: 'sequoia-capital'
      },
      {
        id: '3',
        name: 'Y Combinator',
        firm: 'Y Combinator',
        type: 'Accelerator',
        partner_name: 'Michael Seibel',
        location: 'Mountain View, CA',
        investment_stage: ['Pre-seed', 'Seed'],
        check_size: '$125K - $500K',
        industries: ['All', 'Tech'],
        portfolio: ['Airbnb', 'Dropbox', 'Stripe'],
        recent_investments: ['Rippling', 'Gusto', 'Brex'],
        website: 'https://ycombinator.com',
        meeting_available: true,
        last_active: 'This month',
        match_score: 88,
        twitter: 'ycombinator'
      },
      {
        id: '4',
        name: 'First Round Capital',
        firm: 'First Round Capital',
        type: 'VC',
        partner_name: 'Josh Kopelman',
        location: 'San Francisco, CA',
        investment_stage: ['Seed', 'Series A'],
        check_size: '$500K - $5M',
        industries: [industry, 'SaaS', 'Consumer'],
        portfolio: ['Uber', 'Square', 'Notion'],
        recent_investments: ['Figma', 'Airtable', 'Superhuman'],
        website: 'https://firstround.com',
        meeting_available: true,
        last_active: 'This week',
        match_score: 85,
        email: 'josh@firstround.com'
      },
      {
        id: '5',
        name: 'Techstars',
        firm: 'Techstars',
        type: 'Accelerator',
        partner_name: 'David Cohen',
        location: 'Boulder, CO',
        investment_stage: ['Pre-seed', 'Seed'],
        check_size: '$100K - $120K',
        industries: ['All', 'Tech'],
        portfolio: ['SendGrid', 'Twilio', 'DigitalOcean'],
        recent_investments: ['ClassDojo', 'Nextdoor', 'PillPack'],
        website: 'https://techstars.com',
        meeting_available: true,
        last_active: 'This month',
        match_score: 82,
        twitter: 'techstars'
      }
    ];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Funding Strategy & Investor Matchmaking</h1>
          <p className="text-muted-foreground">
            Connect with real investors, manage your fundraising pipeline, and track term sheets
          </p>
        </div>
        {hasPlan && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Pitch
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share Data Room
            </Button>
          </div>
        )}
      </div>

      {/* Input Section */}
      <Card className="border-2 border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Wallet className="w-6 h-6 text-primary" />
            Fundraising Profile
          </CardTitle>
          <CardDescription>
            Tell us about your startup to get matched with relevant investors
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
                <option value="Idea">Idea / Pre-product</option>
                <option value="Pre-seed">Pre-seed</option>
                <option value="Seed">Seed</option>
                <option value="Series A">Series A</option>
                <option value="Series B">Series B</option>
                <option value="Series C+">Series C+</option>
              </select>
            </div>
          </div>

          <Button 
            onClick={generateFundingPlan} 
            disabled={isGenerating} 
            size="lg"
            className="mt-6 w-full md:w-auto"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Finding Investors...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                Generate Funding Strategy
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
                    <p className="text-sm text-muted-foreground">Matched Investors</p>
                    <p className="text-2xl font-bold">{plan.matched_investors?.length || 0}</p>
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
                    <p className="text-sm text-muted-foreground">Target Amount</p>
                    <p className="text-2xl font-bold">{plan.funding_rounds[0]?.amount || "$1M - $5M"}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Meetings Scheduled</p>
                    <p className="text-2xl font-bold">{plan.scheduled_meetings.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Term Sheets</p>
                    <p className="text-2xl font-bold">{plan.term_sheets.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-orange-600" />
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
              <TabsTrigger value="investors" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Investors
              </TabsTrigger>
              <TabsTrigger value="pipeline" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Pipeline
              </TabsTrigger>
              <TabsTrigger value="preparation" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Preparation
              </TabsTrigger>
              <TabsTrigger value="dd" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Due Diligence
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Funding Rounds */}
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="w-5 h-5 text-primary" />
                      Funding Roadmap
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {plan.funding_rounds.map((round, i) => (
                        <div key={i} className="border-l-4 border-primary pl-4 py-2">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{round.stage}</h3>
                              <p className="text-sm text-muted-foreground">{round.timeline}</p>
                            </div>
                            <Badge className={
                              round.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                              round.status === "Completed" ? "bg-green-100 text-green-800" :
                              "bg-gray-100 text-gray-800"
                            }>
                              {round.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-2">
                            <div>
                              <p className="text-sm text-muted-foreground">Amount</p>
                              <p className="font-medium">{round.amount}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Valuation</p>
                              <p className="font-medium">{round.valuation}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Key Milestones:</p>
                            <ul className="list-disc list-inside text-sm">
                              {round.milestones.map((m, j) => (
                                <li key={j}>{m}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span>👥 {round.interested_investors} interested</span>
                            <span>📅 {round.meetings_scheduled} meetings</span>
                            <span>📄 {round.term_sheets} term sheets</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Use of Funds */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-primary" />
                      Use of Funds
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.use_of_funds.map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{item.category}</span>
                          <span>{item.percentage}% ({item.amount})</span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                        {i < plan.use_of_funds.length - 1 && <Separator className="mt-2" />}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Market Comparables */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="w-5 h-5 text-primary" />
                      Market Comparables
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.market_comps.map((comp, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between">
                          <p className="font-medium">{comp.company}</p>
                          <Badge variant="outline">{comp.stage}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Val: {comp.valuation}</div>
                          <div>Raised: {comp.amount_raised}</div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Investors: {comp.investors.join(", ")}
                        </p>
                        {i < plan.market_comps.length - 1 && <Separator className="mt-2" />}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Key Metrics */}
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Key Metrics for Investors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {plan.key_metrics.map((metric, i) => (
                        <Card key={i} className="border-2">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center justify-between">
                              {metric.metric}
                              <Badge className={
                                metric.importance === "High" ? "bg-red-100 text-red-800" :
                                metric.importance === "Medium" ? "bg-yellow-100 text-yellow-800" :
                                "bg-green-100 text-green-800"
                              }>
                                {metric.importance}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Current:</span>
                              <span className="font-medium">{metric.current}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Target:</span>
                              <span className="font-medium text-primary">{metric.target}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* INVESTORS TAB - RESTORED */}
            <TabsContent value="investors" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Matched Investors
                    </CardTitle>
                    
                    {/* Live Data Indicator */}
                    {plan.last_updated && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          <span className="text-xs font-medium text-green-700">Live</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Updated: {new Date(plan.last_updated).toLocaleTimeString()}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardDescription>
                    Investors actively funding {industry || "your industry"} startups at {stage || "your stage"} stage
                  </CardDescription>
                  
                  {/* Stats Bar */}
                  <div className="grid grid-cols-4 gap-4 mt-4 mb-2">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-blue-600 font-medium">Total Matches</p>
                      <p className="text-2xl font-bold text-blue-700">{plan.matched_investors?.length || 0}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-green-600 font-medium">Accepting Meetings</p>
                      <p className="text-2xl font-bold text-green-700">
                        {plan.matched_investors?.filter((i: Investor) => i.meeting_available).length || 0}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-xs text-purple-600 font-medium">Avg. Match Score</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {plan.matched_investors?.length 
                          ? Math.round(plan.matched_investors.reduce((acc: number, i: Investor) => acc + (i.match_score || 0), 0) / plan.matched_investors.length) 
                          : 0}%
                      </p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-xs text-orange-600 font-medium">Active This Week</p>
                      <p className="text-2xl font-bold text-orange-700">
                        {plan.matched_investors?.filter((i: Investor) => i.last_active === "This week").length || 0}
                      </p>
                    </div>
                  </div>
                  
                  {/* Filters */}
                  <div className="flex flex-wrap gap-3 mt-2">
                    <div className="flex-1 min-w-[200px]">
                      <Input
                        placeholder="Filter by industry (e.g., AI, Fintech)..."
                        value={filterIndustry}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterIndustry(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <select
                      value={filterStage}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStage(e.target.value)}
                      className="w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">All Investment Stages</option>
                      <option value="Pre-seed">Pre-seed</option>
                      <option value="Seed">Seed</option>
                      <option value="Series A">Series A</option>
                      <option value="Series B">Series B</option>
                    </select>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setFilterIndustry("");
                        setFilterStage("");
                      }}
                      className="whitespace-nowrap"
                    >
                      Clear Filters
                    </Button>
                  </div>
                  
                  {/* Results Count */}
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-muted-foreground">
                      Showing <span className="font-medium text-foreground">{filteredInvestors.length}</span> of {plan.matched_investors?.length || 0} investors
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-50">
                        <Twitter className="w-3 h-3 mr-1" /> Twitter Active
                      </Badge>
                      <Badge variant="outline" className="bg-green-50">
                        <Calendar className="w-3 h-3 mr-1" /> Taking Meetings
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {filteredInvestors.length > 0 ? (
                    <div className="space-y-4">
                      {filteredInvestors.map((investor: Investor) => (
                        <Card key={investor.id} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-6">
                              {/* Investor Avatar */}
                              <div className="relative">
                                <Avatar className="w-20 h-20 border-2 border-primary/20">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                                    {investor.firm.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                {investor.meeting_available && (
                                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Investor Details */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="flex items-center gap-3 mb-1">
                                      <h3 className="font-semibold text-lg">{investor.firm}</h3>
                                      {investor.partner_name && (
                                        <span className="text-sm text-muted-foreground">
                                          Partner: {investor.partner_name}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                      <Badge variant="secondary" className="bg-primary/10">
                                        {investor.type}
                                      </Badge>
                                      <Badge variant="outline" className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {investor.location}
                                      </Badge>
                                      {investor.last_active && (
                                        <Badge variant="outline" className={
                                          investor.last_active === "This week" ? "bg-green-50 text-green-700" :
                                          investor.last_active === "This month" ? "bg-blue-50 text-blue-700" :
                                          "bg-gray-50 text-gray-700"
                                        }>
                                          <Clock className="w-3 h-3 mr-1" />
                                          {investor.last_active}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Match Score */}
                                  <div className="text-center">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg ${getMatchScoreColor(investor.match_score)}`}>
                                      {investor.match_score || 0}%
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Match</p>
                                  </div>
                                </div>
                                
                                {/* Investment Focus */}
                                <div className="grid grid-cols-3 gap-4 mt-4 mb-3">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Check Size</p>
                                    <p className="font-medium text-sm">{investor.check_size}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Investment Stage</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {investor.investment_stage.map((stage: string, idx: number) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                          {stage}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Industries</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {investor.industries.slice(0, 3).map((ind: string, idx: number) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">
                                          {ind}
                                        </Badge>
                                      ))}
                                      {investor.industries.length > 3 && (
                                        <Badge variant="outline" className="text-xs">
                                          +{investor.industries.length - 3}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Portfolio & Recent Investments */}
                                <div className="space-y-2 mb-3">
                                  {investor.portfolio && investor.portfolio.length > 0 && (
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">Portfolio Highlights</p>
                                      <div className="flex flex-wrap gap-1">
                                        {investor.portfolio.slice(0, 4).map((company: string, idx: number) => (
                                          <Badge key={idx} variant="secondary" className="bg-purple-50 text-purple-700">
                                            {company}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {investor.recent_investments && investor.recent_investments.length > 0 && (
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                        <Zap className="w-3 h-3 text-yellow-500" />
                                        Recent Investments
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {investor.recent_investments.map((company: string, idx: number) => (
                                          <Badge key={idx} variant="outline" className="bg-yellow-50 text-yellow-700">
                                            {company}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex gap-2 mt-4 pt-3 border-t">
                                  <Button 
                                    size="sm" 
                                    onClick={() => {
                                      setSelectedInvestor(investor);
                                      setShowInvestorModal(true);
                                    }}
                                    className="flex-1"
                                  >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Message Partner
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => scheduleMeeting(investor)}
                                    disabled={!investor.meeting_available}
                                    className="flex-1"
                                  >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {investor.meeting_available ? "Schedule Call" : "By Referral Only"}
                                  </Button>
                                  {investor.website && (
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => window.open(investor.website, '_blank', 'noopener,noreferrer')}
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                                
                                {/* Social Links */}
                                <div className="flex gap-2 mt-2">
                                  {investor.twitter && (
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" asChild>
                                      <a href={`https://twitter.com/${investor.twitter}`} target="_blank" rel="noopener noreferrer">
                                        <Twitter className="w-3 h-3" />
                                      </a>
                                    </Button>
                                  )}
                                  {investor.linkedin && (
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" asChild>
                                      <a href={`https://linkedin.com/company/${investor.linkedin}`} target="_blank" rel="noopener noreferrer">
                                        <Linkedin className="w-3 h-3" />
                                      </a>
                                    </Button>
                                  )}
                                  {investor.email && (
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" asChild>
                                      <a href={`mailto:${investor.email}`}>
                                        <Mail className="w-3 h-3" />
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No Investors Found</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Try adjusting your filters or updating your industry/stage
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setFilterIndustry("");
                          setFilterStage("");
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </CardContent>
                
                {/* Footer with real-time update info */}
                <CardFooter className="border-t bg-muted/10">
                  <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        Real-time data from NewsAPI, GitHub, and Twitter
                      </div>
                      <div>•</div>
                      <div>Updated every 5 minutes</div>
                    </div>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={generateFundingPlan}>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Refresh Data
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Pipeline Tab */}
            <TabsContent value="pipeline" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Scheduled Meetings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Scheduled Meetings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.scheduled_meetings.length > 0 ? (
                      plan.scheduled_meetings.map((meeting, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {meeting.type === "Video Call" ? <VideoIcon className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <p className="font-medium">{meeting.investor}</p>
                              <Badge className={
                                meeting.status === "Confirmed" ? "bg-green-100 text-green-800" :
                                meeting.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                                "bg-gray-100 text-gray-800"
                              }>
                                {meeting.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{meeting.firm}</p>
                            <div className="flex gap-4 mt-2 text-sm">
                              <span>{meeting.date}</span>
                              <span>{meeting.time}</span>
                              <span>{meeting.type}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No meetings scheduled yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Term Sheets */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Term Sheets
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.term_sheets.length > 0 ? (
                      plan.term_sheets.map((ts, i) => (
                        <div key={i} className="p-3 bg-muted/50 rounded-lg space-y-2">
                          <div className="flex justify-between">
                            <p className="font-medium">{ts.firm}</p>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              {ts.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{ts.investor}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Amount: {ts.amount}</div>
                            <div>Valuation: {ts.valuation}</div>
                            <div>Equity: {ts.equity}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No term sheets yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Pitch Feedback */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      Pitch Deck Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {plan.pitch_deck_feedback.map((feedback, i) => (
                        <div key={i} className="p-4 border rounded-lg">
                          <div className="flex justify-between mb-2">
                            <p className="font-medium">{feedback.investor}</p>
                            <div className="flex gap-1">
                              {[1,2,3,4,5].map((star) => (
                                <Star key={star} className={`w-4 h-4 ${star <= feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm mb-2">"{feedback.feedback}"</p>
                          <p className="text-xs text-muted-foreground">{feedback.date}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Preparation Tab */}
            <TabsContent value="preparation" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Fundraising Strategy */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Fundraising Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {plan.fundraising_strategy.map((strategy, i) => (
                        <Card key={i}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center justify-between">
                              {strategy.phase}
                              <Badge variant="outline">{strategy.target_amount}</Badge>
                            </CardTitle>
                            <CardDescription>{strategy.timeline}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {strategy.activities.map((act, j) => (
                                <li key={j}>{act}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Target Investors */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Target Investor Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {plan.target_investors.map((target, i) => (
                        <Card key={i}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center justify-between">
                              {target.type}
                              <Badge>{target.count} funds</Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div>
                              <p className="font-medium mb-1">Examples:</p>
                              <div className="flex flex-wrap gap-1">
                                {target.examples.map((ex, j) => (
                                  <Badge key={j} variant="outline">{ex}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="font-medium mb-1">Strategy:</p>
                              <p className="text-muted-foreground">{target.strategy}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Due Diligence Tab */}
            {/* Due Diligence Tab */}
<TabsContent value="dd" className="space-y-4">
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary" />
        Due Diligence Checklist
      </CardTitle>
      <CardDescription>
        Track your preparation progress for investor due diligence
      </CardDescription>
      
      {/* Overall Progress */}
      <div className="mt-4 p-4 bg-muted/30 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Overall Preparation Progress</span>
          <span className="text-sm font-bold text-primary">
            {Math.round(
              (plan.due_diligence_checklist.reduce((acc, cat) => 
                acc + cat.items.filter(item => item.status === "Ready").length, 0
              ) / 
              plan.due_diligence_checklist.reduce((acc, cat) => 
                acc + cat.items.length, 0
              )) * 100 || 0
            )}%
          </span>
        </div>
        <Progress 
          value={
            (plan.due_diligence_checklist.reduce((acc, cat) => 
              acc + cat.items.filter(item => item.status === "Ready").length, 0
            ) / 
            plan.due_diligence_checklist.reduce((acc, cat) => 
              acc + cat.items.length, 0
            )) * 100 || 0
          } 
          className="h-2"
        />
      </div>
    </CardHeader>
    
    <CardContent>
      <div className="grid md:grid-cols-2 gap-6">
        {plan.due_diligence_checklist.map((category, catIdx) => (
          <Card key={catIdx} className="border-2">
            <CardHeader className="pb-2 bg-muted/20">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{category.category}</span>
                <Badge variant="outline" className={
                  category.items.every(item => item.status === "Ready") ? "bg-green-100 text-green-700" :
                  category.items.some(item => item.status === "In Progress") ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-700"
                }>
                  {category.items.filter(item => item.status === "Ready").length}/{category.items.length} Ready
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {category.items.map((item, itemIdx) => (
                  <div 
                    key={itemIdx} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      item.status === "Ready" ? "bg-green-50 border-green-200" :
                      item.status === "In Progress" ? "bg-blue-50 border-blue-200" :
                      "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Status Icon */}
                      {item.status === "Ready" ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : item.status === "In Progress" ? (
                        <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-400" />
                      )}
                      <span className={`text-sm ${
                        item.status === "Ready" ? "text-green-700 font-medium" :
                        item.status === "In Progress" ? "text-blue-700" :
                        "text-gray-600"
                      }`}>
                        {item.item}
                      </span>
                    </div>
                    
                    {/* Status Badge with Actions */}
                    <div className="flex items-center gap-2">
                      <Badge className={
                        item.status === "Ready" ? "bg-green-100 text-green-700" :
                        item.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      }>
                        {item.status}
                      </Badge>
                      
                      {/* Status Change Buttons */}
                      <div className="flex gap-1 ml-2">
                        {item.status !== "Not Started" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              const newPlan = {...plan};
                              newPlan.due_diligence_checklist[catIdx].items[itemIdx].status = "Not Started";
                              setPlan(newPlan);
                            }}
                          >
                            <XCircle className="w-4 h-4 text-gray-400" />
                          </Button>
                        )}
                        {item.status !== "In Progress" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              const newPlan = {...plan};
                              newPlan.due_diligence_checklist[catIdx].items[itemIdx].status = "In Progress";
                              setPlan(newPlan);
                            }}
                          >
                            <RefreshCw className="w-4 h-4 text-blue-400" />
                          </Button>
                        )}
                        {item.status !== "Ready" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              const newPlan = {...plan};
                              newPlan.due_diligence_checklist[catIdx].items[itemIdx].status = "Ready";
                              setPlan(newPlan);
                            }}
                          >
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {plan.due_diligence_checklist.reduce((acc, cat) => 
                  acc + cat.items.filter(item => item.status === "Ready").length, 0
                )}
              </p>
              <p className="text-xs text-muted-foreground">Ready Items</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {plan.due_diligence_checklist.reduce((acc, cat) => 
                  acc + cat.items.filter(item => item.status === "In Progress").length, 0
                )}
              </p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">
                {plan.due_diligence_checklist.reduce((acc, cat) => 
                  acc + cat.items.filter(item => item.status === "Not Started").length, 0
                )}
              </p>
              <p className="text-xs text-muted-foreground">Not Started</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {plan.due_diligence_checklist.reduce((acc, cat) => acc + cat.items.length, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2 justify-end mt-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            const newPlan = {...plan};
            newPlan.due_diligence_checklist = newPlan.due_diligence_checklist.map(cat => ({
              ...cat,
              items: cat.items.map(item => ({...item, status: "Not Started" as const}))
            }));
            setPlan(newPlan);
          }}
        >
          <XCircle className="w-4 h-4 mr-2" />
          Reset All
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-green-50"
          onClick={() => {
            const newPlan = {...plan};
            newPlan.due_diligence_checklist = newPlan.due_diligence_checklist.map(cat => ({
              ...cat,
              items: cat.items.map(item => ({...item, status: "Ready" as const}))
            }));
            setPlan(newPlan);
          }}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Mark All Complete
        </Button>
      </div>
    </CardContent>
  </Card>
</TabsContent>
          </Tabs>
        </div>
      )}

      {/* Investor Message Modal */}
      {showInvestorModal && selectedInvestor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Message {selectedInvestor.name}</CardTitle>
              <CardDescription>
                Send a personalized outreach message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded">
                <Avatar>
                  <AvatarFallback>{selectedInvestor.firm.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedInvestor.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedInvestor.firm}</p>
                </div>
              </div>
              <Textarea
                placeholder={`Hi ${selectedInvestor.partner_name || selectedInvestor.name},\n\nI'm building ${startupIdea} and would love to connect...`}
                value={outreachMessage}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOutreachMessage(e.target.value)}
                rows={6}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowInvestorModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  alert(`Message sent to ${selectedInvestor.firm}`);
                  setShowInvestorModal(false);
                  setOutreachMessage("");
                }}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}