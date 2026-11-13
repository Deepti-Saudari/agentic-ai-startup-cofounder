from groq import Groq
from dotenv import load_dotenv
import os
import json
import re

load_dotenv()

try:
    from config import client, extract_json
except ImportError:
    from backend.config import client, extract_json


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
        temperature=0.7,
        max_tokens=3000,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "You are a startup accelerator mentor. Output pure valid JSON."},
            {"role": "user", "content": prompt}
        ]
    )

    text = response.choices[0].message.content.strip()
    result = extract_json(text)
    if result and isinstance(result, dict) and "milestones" in result:
        return result

    return {"error": "Failed to parse roadmap JSON", "raw": text}