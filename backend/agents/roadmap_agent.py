from groq import Groq
from dotenv import load_dotenv
import os
import json
import re

load_dotenv()

try:
    from config import client
except ImportError:
    from backend.config import client


def generate_startup_roadmap(startup_idea, industry):

    prompt = f"""
You are a startup accelerator mentor.

Create a startup roadmap for the following startup:

Startup Idea: {startup_idea}
Industry: {industry}

Return ONLY JSON in this format:

{{
 "milestones":[
   {{
     "title":"",
     "description":"",
     "category":"",
     "priority":"",
     "tasks":[]
   }}
 ],
 "timeline":[
   {{
     "phase":"",
     "duration":"",
     "goals":[]
   }}
 ]
}}

Rules:
Categories must be one of:
product, business, funding, team, legal

Priority must be:
low, medium, high, critical

Generate 5-7 milestones.

Only JSON.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )

    text = response.choices[0].message.content.strip()

    # Remove markdown code blocks if present
    text = re.sub(r"```json|```", "", text).strip()

    try:
        return json.loads(text)
    except Exception as e:
        return {"error": str(e), "raw": text}