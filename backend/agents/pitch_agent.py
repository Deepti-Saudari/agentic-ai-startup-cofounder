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


def generate_pitch_deck(startup_idea, target_market):

    prompt = f"""
You are a startup fundraising expert.

Create a startup pitch deck.

Startup Idea:
{startup_idea}

Target Market:
{target_market}

Return ONLY JSON in this format:

{{
 "problem": "",
 "solution": "",
 "market": "",
 "businessModel": "",
 "traction": "",
 "competition": "",
 "team": "",
 "financials": "",
 "ask": ""
}}

Each section should contain 2–4 concise sentences suitable for a pitch deck.
Return JSON only.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    text = response.choices[0].message.content.strip()

    try:
        text = re.sub(r"```json|```", "", text)
        return json.loads(text)
    except:
        return {"raw_output": text}
