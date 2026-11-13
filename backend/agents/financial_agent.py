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


def generate_financial_model(startup_idea, growth_rate, arpu, cac, churn, margin):

    prompt = f"""
You are a startup finance expert.

Generate a realistic financial model for this startup:

Startup Idea: {startup_idea}

Assumptions:
Monthly Growth Rate: {growth_rate}%
ARPU: ${arpu}
CAC: ${cac}
Churn Rate: {churn}%
Gross Margin: {margin}%

Return ONLY JSON in this format:

{{
 "metrics": {{
   "mrr": 0,
   "arr": 0,
   "customers": 0,
   "ltv": 0,
   "cac": 0,
   "burnRate": 0,
   "runway": 0
 }},

 "projections": [
  {{
    "month": "Jan",
    "revenue": 0,
    "expenses": 0,
    "profit": 0,
    "customers": 0,
    "arr": 0
  }}
 ],

 "yearly_projection": {{
  "year1": {{
    "revenue": 0,
    "customers": 0,
    "grossProfit": 0,
    "operatingExpenses": 0,
    "netIncome": 0
  }},
  "year2": {{
    "revenue": 0,
    "customers": 0,
    "grossProfit": 0,
    "operatingExpenses": 0,
    "netIncome": 0
  }},
  "year3": {{
    "revenue": 0,
    "customers": 0,
    "grossProfit": 0,
    "operatingExpenses": 0,
    "netIncome": 0
  }}
 }}
}}

Rules:
- Provide projections for 12 months (Jan → Dec)
- Numbers must be realistic for startups
- slow early traction
- occasional dips
- expense spikes (marketing / hiring)
- break-even after several months
- JSON only
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0.7,
        max_tokens=3000,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "You are a startup financial modeler. Output pure valid JSON."},
            {"role": "user", "content": prompt}
        ]
    )

    text = response.choices[0].message.content.strip()
    result = extract_json(text)
    if result and isinstance(result, dict) and "metrics" in result:
        return result

    return {
        "error": "Failed to parse financial model JSON",
        "raw_output": text
    }