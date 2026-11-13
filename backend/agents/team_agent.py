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


def generate_team_plan(startup_idea, industry):

    prompt = f"""
You are a startup HR and hiring strategist.

Create a team and hiring plan for this startup.

Startup Idea:
{startup_idea}

Industry:
{industry}

Return ONLY JSON in this format:

{{
 "key_roles": [],
 "hiring_plan": [],
 "skills_required": [],
 "team_structure": []
}}

Rules:
- 4 key startup roles
- 4 hiring steps
- 4 important skills
- 4 team structure suggestions
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0.7,
        max_tokens=3000,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "You are a startup HR and hiring strategist. Output pure valid JSON."},
            {"role": "user", "content": prompt}
        ]
    )

    text = response.choices[0].message.content.strip()
    result = extract_json(text)
    if result and isinstance(result, dict) and ("key_roles" in result or "hiring_plan" in result):
        return result

    return {"raw_output": text}