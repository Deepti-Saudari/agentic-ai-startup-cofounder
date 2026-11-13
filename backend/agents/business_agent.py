from groq import Groq
from dotenv import load_dotenv
import os
import json

load_dotenv()

try:
    from config import client, extract_json
except ImportError:
    from backend.config import client, extract_json


def generate_business_plan(startup_idea):

    prompt = f"""
You are a startup strategy expert.

Create a business plan for this startup idea:

{startup_idea}

Return ONLY valid JSON.

FORMAT:

{{
 "lean_canvas": {{
   "problem": "",
   "solution": "",
   "keyMetrics": "",
   "uniqueValueProposition": "",
   "unfairAdvantage": "",
   "channels": "",
   "customerSegments": "",
   "costStructure": "",
   "revenueStreams": ""
 }},
 "swot": {{
   "strengths": [],
   "weaknesses": [],
   "opportunities": [],
   "threats": []
 }},
 "executive_summary": {{
  "businessOverview": "",
  "marketOpportunity": "",
  "competitiveAdvantage": "",
  "financialProjections": {{
    "year1": "",
    "year2": "",
    "year3": ""
  }},
  "fundingRequirements": ""
 }}
}}

Rules:
- Provide realistic startup strategy
- SWOT should contain 3–4 items each
- ONLY return JSON
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0.7,
        max_tokens=3000,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "You are an elite startup business planner. Return strictly valid JSON."},
            {"role": "user", "content": prompt}
        ]
    )

    text = response.choices[0].message.content.strip()
    result = extract_json(text)
    if result and isinstance(result, dict) and "lean_canvas" in result:
        return result

    return {
        "lean_canvas": {},
        "swot": {},
        "executive_summary": {}
    }