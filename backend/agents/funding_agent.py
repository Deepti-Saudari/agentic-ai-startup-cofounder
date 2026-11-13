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


def generate_funding_plan(startup_idea, industry):

    prompt = f"""
You are a startup fundraising advisor.

Generate a funding strategy for the following startup.

Startup Idea:
{startup_idea}

Industry:
{industry}

Return ONLY JSON in this format:

{{
 "funding_stages": [],
 "investor_types": [],
 "fundraising_strategy": [],
 "use_of_funds": []
}}

Rules:
- Provide 4 funding stages (example: Pre-seed, Seed, Series A, Series B)
- Provide 4 investor types
- Provide 4 fundraising strategies
- Provide 4 ways the funds will be used

Return JSON only.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0.7,
        max_tokens=3000,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "You are a startup fundraising advisor. Output pure valid JSON."},
            {"role": "user", "content": prompt}
        ]
    )

    text = response.choices[0].message.content.strip()
    result = extract_json(text)
    if result and isinstance(result, dict) and ("funding_stages" in result or "fundraising_strategy" in result):
        return result

    return {
        "funding_stages": [],
        "investor_types": [],
        "fundraising_strategy": [],
        "use_of_funds": []
    }