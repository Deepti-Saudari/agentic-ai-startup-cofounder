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


def generate_operations_plan(startup_idea, industry):

    prompt = f"""
You are a startup operations consultant.

Create an operations strategy for the startup below.

Startup Idea: {startup_idea}
Industry: {industry}

Return ONLY JSON in this format:

{{
 "operations_structure": {{
   "teams": [],
   "tools": [],
   "processes": []
 }},
 "infrastructure": {{
   "cloud": "",
   "devops": "",
   "security": ""
 }},
 "kpis": []
}}

Rules:
- teams = operational teams needed
- tools = software tools needed
- processes = operational workflows
- kpis = metrics to track operations

Only JSON.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0.7,
        max_tokens=3000,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "You are a startup operations consultant. Output pure valid JSON."},
            {"role": "user", "content": prompt}
        ]
    )

    text = response.choices[0].message.content.strip()
    result = extract_json(text)
    if result and isinstance(result, dict) and "operations_structure" in result:
        return result

    return {"error": "Failed to parse operations JSON", "raw": text}