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
        messages=[{"role": "user", "content": prompt}]
    )

    text = response.choices[0].message.content.strip()

    text = re.sub(r"```json|```", "", text)

    try:
        return json.loads(text)
    except:
        return {"raw_output": text}