"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Send,
  Lightbulb,
  TrendingUp,
  Target,
  DollarSign,
  Users,
  Zap,
  Brain,
  Sparkles,
  Clock,
  Loader2,
  MessageSquare,
  BookOpen,
  Rocket,
  BarChart,
  FileText,
  UserPlus,
  Menu,
  X,
  Copy,
  ExternalLink,
  Briefcase,
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import { apiFetch } from "@/lib/api"

// Types
interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  suggestions?: string[]
}

// Quick prompts
const QUICK_PROMPTS = [
  { icon: <Lightbulb className="w-4 h-4" />, text: "How do I validate my startup idea?", color: "bg-yellow-100" },
  { icon: <TrendingUp className="w-4 h-4" />, text: "What's a good go-to-market strategy?", color: "bg-blue-100" },
  { icon: <DollarSign className="w-4 h-4" />, text: "How should I price my product?", color: "bg-green-100" },
  { icon: <Users className="w-4 h-4" />, text: "When should I start hiring?", color: "bg-purple-100" },
  { icon: <Target className="w-4 h-4" />, text: "How do I find product-market fit?", color: "bg-red-100" },
  { icon: <Rocket className="w-4 h-4" />, text: "Help me prepare for fundraising", color: "bg-indigo-100" },
]

// Extract natural follow-up questions from the conversation
const extractSuggestions = (content: string, lastUserMessage: string): string[] => {
  const suggestions: string[] = []
  
  // Look for questions the AI asked
  const aiQuestions = content.match(/[^.!?]*\?/g)
  if (aiQuestions) {
    // Take the first question the AI asked and use it as a suggestion
    suggestions.push(...aiQuestions.map(q => q.trim()).slice(0, 1))
  }
  
  // Add relevant follow-ups based on topic
  const lowerMsg = lastUserMessage.toLowerCase()
  
  if (lowerMsg.includes("healthcare") || lowerMsg.includes("medical")) {
    suggestions.push("What specific healthcare problem are you solving?")
    suggestions.push("Have you looked at the regulatory requirements?")
  } else if (lowerMsg.includes("idea") || lowerMsg.includes("validate")) {
    suggestions.push("Who would be your ideal first customer?")
    suggestions.push("What problem does it solve?")
  } else if (lowerMsg.includes("market")) {
    suggestions.push("How big do you think the market is?")
    suggestions.push("Who are your main competitors?")
  } else if (lowerMsg.includes("team") || lowerMsg.includes("hire")) {
    suggestions.push("What roles do you need to hire first?")
    suggestions.push("Do you have co-founders?")
  } else {
    // If no specific topic, use generic engaging questions
    suggestions.push("What's the biggest challenge right now?")
    suggestions.push("What would success look like?")
  }
  
  return suggestions.slice(0, 2) // Keep it to 2 suggestions max
}

// Main Component
export function AICoFounder() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: `# 👋 Hey there! I'm your AI Co-Founder

I'm here to help you build your startup, just like a real co-founder would. Ask me anything about:

• Validating your idea
• Finding product-market fit  
• Pricing strategies
• Building your team
• Fundraising and pitches
• Go-to-market plans

**What's on your mind today?**`,
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Send message to API
const sendMessage = async (content: string) => {
  if (!content.trim() || isTyping) return

  // Add user message
  const userMessage: Message = {
    id: Date.now().toString(),
    content: content.trim(),
    sender: "user",
    timestamp: new Date(),
  }

  setMessages(prev => [...prev, userMessage])
  setInputValue("")
  setIsTyping(true)

  try {
    const response = await apiFetch("/ai-cofounder", {
      method: "POST",
      body: JSON.stringify({ message: content }),
    })

    const data = await response.json()
    const reply = data.reply || "Thanks for sharing! Tell me more."

    // Extract suggestions based on the conversation
    const suggestions = extractSuggestions(reply, content)

    // Add AI response
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: reply,
      sender: "ai",
      timestamp: new Date(),
      suggestions: suggestions,
    }

    setMessages(prev => [...prev, aiMessage])
  } catch (error) {
    console.error("Error:", error)
    
    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "⚠️ Connection error. Is your backend running?",
      sender: "ai",
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, errorMessage])
  } finally {
    setIsTyping(false)
  }
}

  // Handle quick prompt click
  const handleQuickPrompt = (text: string) => {
    sendMessage(text)
  }

  // Copy message to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-20 left-4 z-50"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-72 bg-background border-r
          transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h2 className="font-semibold mb-2">Quick Questions</h2>
            <p className="text-xs text-muted-foreground">Click to ask instantly</p>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {QUICK_PROMPTS.map((prompt, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  className="w-full justify-start h-auto py-3 px-3"
                  onClick={() => {
                    handleQuickPrompt(prompt.text)
                    setIsSidebarOpen(false)
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${prompt.color}`}>{prompt.icon}</div>
                    <span className="text-sm text-left">{prompt.text}</span>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Brain className="w-4 h-4" />
              <span>AI Co-Founder</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Brain className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">AI Co-Founder</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${isTyping ? "bg-yellow-500 animate-pulse" : "bg-green-500"}`} />
                    {isTyping ? "Thinking..." : "Online"}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="gap-1">
                <Sparkles className="w-3 h-3" />
                AI Powered
              </Badge>
            </div>
          </CardHeader>

          <Separator />

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.sender === "user" ? "justify-end" : ""}`}>
                  {message.sender === "ai" && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        <Brain className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-[80%] ${message.sender === "user" ? "order-first" : ""}`}>
                    <div
                      className={`rounded-lg p-4 ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.sender === "ai" ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown
                            components={{
                              h1: ({ children }) => <h1 className="text-xl font-bold mt-2 mb-3">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-lg font-semibold mt-3 mb-2">{children}</h2>,
                              p: ({ children }) => <p className="text-sm leading-relaxed mb-2">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
                              li: ({ children }) => <li className="text-sm">{children}</li>,
                              code: ({ children }) => (
                                <code className="bg-muted-foreground/20 px-1 py-0.5 rounded text-xs">{children}</code>
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => copyToClipboard(message.content)}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>

                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, i) => (
                          <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => sendMessage(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>

                  {message.sender === "user" && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                        U
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      <Brain className="w-3 h-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.1s]" />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <Separator />

          {/* Input area */}
          <div className="p-4">
            <div className="flex gap-2 max-w-3xl mx-auto">
              <Input
                ref={inputRef}
                placeholder="Ask me anything about your startup..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !isTyping && sendMessage(inputValue)}
                disabled={isTyping}
                className="flex-1"
              />
              <Button 
                onClick={() => sendMessage(inputValue)} 
                disabled={!inputValue.trim() || isTyping}
                size="icon"
              >
                {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}