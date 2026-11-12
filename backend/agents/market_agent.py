from groq import Groq
from dotenv import load_dotenv
import os
import json


load_dotenv()

try:
    from config import client
except ImportError:
    from backend.config import client


def run_market_research(industry, target_market):

    prompt = f"""
You are a startup market research expert.

Perform a realistic market analysis.

Industry: {industry}
Target Market: {target_market}

Return ONLY valid JSON.

FORMAT:

{{
 "competitors":[
   {{
     "name":"",
     "website":"",
     "description":"",
     "marketShare":0,
     "funding":"",
     "strengths":[],
     "weaknesses":[],
     "pricing":"",
     "threatLevel":"Low|Medium|High"
   }}
 ],
 "personas":[
   {{
     "name":"",
     "age":"",
     "occupation":"",
     "income":"",
     "painPoints":[],
     "goals":[],
     "channels":[],
     "buyingBehavior":""
   }}
 ],
 "trends":[
   {{
     "trend":"",
     "impact":"Positive|Negative|Neutral",
     "description":"",
     "timeframe":"",
     "confidence":0
   }}
 ],
 "summary": {{
   "marketSize":"",
   "growthRate":"",
   "opportunity":""
 }}
}}

Rules:
- Provide exactly 3 competitors
- Provide exactly 3 personas
- Provide exactly 3 trends
- marketShare must be a number between 0–100
- confidence must be a number between 0–100
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

    # remove markdown json wrappers if the model adds them
    if text.startswith("```"):
        text = text.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(text)

    except Exception:
        return {
            "competitors": [],
            "personas": [],
            "trends": [],
            "summary": {
                "marketSize": "",
                "growthRate": "",
                "opportunity": ""
            }
        }