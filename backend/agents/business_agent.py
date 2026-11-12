from groq import Groq
from dotenv import load_dotenv
import os
import json

load_dotenv()

try:
    from config import client
except ImportError:
    from backend.config import client


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
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    text = response.choices[0].message.content.strip()

    # remove ```json wrappers if model adds them
    if text.startswith("```"):
        text = text.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(text)

    except Exception:
        return {
            "lean_canvas": {},
            "swot": {},
            "executive_summary": {}
        }