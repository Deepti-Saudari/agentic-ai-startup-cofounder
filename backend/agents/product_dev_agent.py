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


def generate_product_plan(startup_idea, industry):

    prompt = f"""
You are a startup product manager.

Create a product development plan for the following startup.

Startup Idea:
{startup_idea}

Industry:
{industry}

Return ONLY JSON in this format:

{{
 "mvp_features": [],
 "tech_stack": [],
 "development_phases": [],
 "milestones": []
}}

Rules:
- Provide 5 MVP features
- Provide 5 technologies for the tech stack
- Provide 4 development phases
- Provide 4 milestones

Return JSON only.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0.7,
        max_tokens=3000,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "You are a startup product manager. Output pure valid JSON."},
            {"role": "user", "content": prompt}
        ]
    )

    text = response.choices[0].message.content.strip()
    result = extract_json(text)
    if result and isinstance(result, dict) and "mvp_features" in result:
        return result

    return {"raw_output": text}