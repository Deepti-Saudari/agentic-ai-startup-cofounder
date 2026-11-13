from groq import Groq
from dotenv import load_dotenv
import os
import json
import re
from datetime import datetime

load_dotenv()

try:
    from config import client, extract_json
except ImportError:
    from backend.config import client, extract_json

def generate_startup_ideas(skills, interests, experience, idea=None, mode="generate"):
    """
    Generate comprehensive industry analysis and startup ideas with 8 layers of deep analysis
    """
    
    # Build context based on mode
    if mode == "generate":
        user_context = f"""
FOUNDER PROFILE:
- Skills & Expertise: {skills}
- Industries of Interest: {interests}
- Previous Experience: {experience}
"""
        analysis_task = "Perform deep strategic analysis of the industries the founder is interested in"
        idea_task = "Generate 3-5 comprehensive startup opportunities based on your analysis"
    else:
        user_context = f"""
EXISTING STARTUP IDEA:
{idea}
"""
        analysis_task = "Perform deep strategic analysis of the industry this idea belongs to"
        idea_task = "Enhance and expand this idea with comprehensive strategic insights"

    current_date = datetime.now().strftime("%B %Y")

    prompt = f"""You are a world-class VC analyst and experienced startup founder with 20+ years of experience. 
You must perform DEEP strategic analysis before generating any startup ideas.

{user_context}

YOUR TASK: Perform a complete strategic analysis with the following 8 layers, then generate startup opportunities.

RETURN ONLY VALID JSON with this exact structure. Every field must contain specific, meaningful content based on the user's input.

{{
  "analysis": {{
    "industry": {{
      "name": "Primary industry name",
      "history": {{
        "timeline": [
          {{"year": "YYYY", "event": "Specific event", "impact": "How this shaped the industry"}}
        ],
        "evolution": "Detailed narrative of industry evolution (3-5 sentences)",
        "keyMilestones": ["Milestone 1", "Milestone 2", "Milestone 3"],
        "pastStartups": [
          {{
            "name": "Actual startup name",
            "outcome": "success/failure/acquired/unicorn",
            "year": "YYYY",
            "lessons": ["Lesson 1", "Lesson 2"]
          }}
        ],
        "lessonsLearned": ["Specific lesson about this industry"]
      }}
    }},
    "ecosystem": {{
      "majorPlayers": [
        {{"name": "Company name", "type": "incumbent/challenger/innovator", "strengths": ["Strength"], "weaknesses": ["Weakness"]}}
      ],
      "startups": [
        {{"name": "Startup", "focus": "Focus area", "fundingStage": "Stage", "notable": true}}
      ],
      "suppliers": [
        {{"name": "Supplier", "type": "Type", "criticality": "high/medium/low"}}
      ],
      "regulators": [
        {{"name": "Regulator", "jurisdiction": "Region", "influence": "high/medium/low"}}
      ],
      "investors": [
        {{"name": "Investor", "focus": ["Area1", "Area2"], "typicalCheck": "$X-XM", "active": true}}
      ],
      "partners": [
        {{"type": "Partnership type", "examples": ["Example"], "value": "Value description"}}
      ]
    }},
    "technology": {{
      "current": [
        {{"name": "Tech name", "adoption": "widespread/growing/niche", "limitations": ["Limitation"]}}
      ],
      "emerging": [
        {{"name": "Tech name", "maturity": "nascent/developing/maturing", "impact": "high/medium/low", "timeframe": "X-X years"}}
      ],
      "barriers": [
        {{"description": "Barrier description", "severity": "high/medium/low", "mitigation": "How to overcome"}}
      ]
    }},
    "regulation": {{
      "laws": [
        {{"name": "Law name", "jurisdiction": "Jurisdiction", "requirements": ["Requirement"], "impact": "high/medium/low"}}
      ],
      "barriers": [
        {{"description": "Barrier", "type": "compliance/licensing/patent/trade", "severity": "high/medium/low"}}
      ],
      "opportunities": [
        {{"change": "Policy change", "status": "proposed/enacted/pending", "timeline": "YYYY", "opportunity": "Opportunity description"}}
      ]
    }},
    "trends": {{
      "technological": [
        {{"name": "Trend", "impact": "Specific impact", "timeframe": "Now/Soon/Long-term"}}
      ],
      "economic": [
        {{"name": "Trend", "impact": "Specific impact", "affected": "Affected sector"}}
      ],
      "demographic": [
        {{"name": "Trend", "impact": "Specific impact", "affected": "Demographic group"}}
      ],
      "societal": [
        {{"name": "Trend", "impact": "Specific impact", "shift": "Cultural shift"}}
      ]
    }},
    "problems": {{
      "problems": [
        {{
          "id": "1",
          "title": "Problem title",
          "description": "Detailed description",
          "affectedUsers": ["User segment 1", "User segment 2"],
          "painLevel": "critical/high/medium/low",
          "frequency": "daily/weekly/monthly",
          "currentSolutions": [
            {{"name": "Existing solution", "provider": "Provider", "gap": "What's missing"}}
          ],
          "evidence": [
            {{"source": "Source", "finding": "Specific finding"}}
          ],
          "marketNeed": "proven/emerging/speculative",
          "willingnessToPay": "high/medium/low"
        }}
      ]
    }}
  }},
  "ideas": [
    {{
      "id": "1",
      "title": "Startup name",
      "tagline": "Compelling one-liner",
      "description": "Full concept description",
      "problem": "The problem statement",
      "solution": "Solution description",
      "targetCustomers": ["Customer segment 1", "Customer segment 2"],
      "marketOpportunity": {{
        "size": "$XXB",
        "growth": "XX% CAGR",
        "trend": "Key trend driving growth"
      }},
      "productDescription": "Detailed product description",
      "technologyStack": ["Tech 1", "Tech 2", "Tech 3"],
      "businessModel": {{
        "type": ["SaaS", "Marketplace", "Subscription"],
        "revenueStreams": ["Stream 1", "Stream 2"],
        "pricing": [
          {{"tier": "Basic", "price": "$XX/mo", "features": ["Feature A", "Feature B"]}}
        ]
      }},
      "competitiveLandscape": {{
        "directCompetitors": [
          {{"name": "Competitor", "strength": "Strength", "weakness": "Weakness"}}
        ],
        "indirectCompetitors": ["Indirect competitor"],
        "differentiation": "How we are different",
        "moat": ["Moat 1", "Moat 2"]
      }},
      "mvpRoadmap": [
        {{"phase": "Phase 1", "duration": "X months", "features": ["Feature 1", "Feature 2"]}}
      ],
      "adoptionBarriers": [
        {{"barrier": "Barrier", "severity": "high/medium/low", "mitigation": "Mitigation strategy"}}
      ],
      "keyRisks": [
        {{"risk": "Risk description", "probability": "High/Medium/Low", "impact": "High/Medium/Low", "mitigation": "Mitigation"}}
      ],
      "exitOpportunities": [
        {{"type": "acquisition/ipo", "potentialBuyers": ["Buyer 1"], "valuation": "$XXXM", "timeline": "X-X years"}}
      ],
      "scoring": {{
        "founderMarketFit": {{"score": 85, "reasoning": "Specific reasoning"}},
        "marketSize": {{"score": 90, "reasoning": "Specific reasoning"}},
        "technicalFeasibility": {{"score": 80, "reasoning": "Specific reasoning"}},
        "competitionIntensity": {{"score": 70, "reasoning": "Specific reasoning"}},
        "timingAdvantage": {{"score": 95, "reasoning": "Specific reasoning"}},
        "overall": 85
      }},
      "strategicRecommendations": [
        "Recommendation 1",
        "Recommendation 2",
        "Recommendation 3"
      ]
    }}
  ]
}}

IMPORTANT:
- EVERY field must contain specific, meaningful content based on the user's input
- NO placeholder text like "TBD" or "To be defined"
- The analysis should feel like it was written by a VC expert who knows the industry deeply
- Generate 3-5 startup ideas minimum
- Each idea must be distinct and address different opportunities from your analysis
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a world-class VC analyst and startup strategist. Generate ONLY valid JSON with deep, specific insights. No markdown, no explanations."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=3500,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content.strip()
        result = extract_json(content)
        if result is None:
            raise Exception("Failed to parse AI response into structured JSON")
            
        return result

    except Exception as e:
        print(f"Error generating ideas: {e}")
        raise Exception(f"AI service error: {str(e)}")