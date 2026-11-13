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


def generate_marketing_plan(startup_idea, industry):

    prompt = f"""
You are a startup marketing strategist.

Create a marketing plan for this startup.

Startup Idea:
{startup_idea}

Industry:
{industry}

Return ONLY JSON in this format:

{{
 "target_audience": [],
 "acquisition_channels": [],
 "marketing_strategy": [],
 "growth_plan": []
}}

Rules:
- Provide 4 target audience segments
- Provide 5 acquisition channels
- Provide 4 marketing strategies
- Provide 4 growth plan steps
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0.7,
        max_tokens=3000,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "You are a startup marketing strategist. Output pure valid JSON."},
            {"role": "user", "content": prompt}
        ]
    )

    text = response.choices[0].message.content.strip()
    result = extract_json(text)
    if result and isinstance(result, dict) and "target_audience" in result:
        return result

    return {"raw_output": text}