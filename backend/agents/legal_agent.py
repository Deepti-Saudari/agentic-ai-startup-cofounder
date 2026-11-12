from groq import Groq
from dotenv import load_dotenv
import os
import json  # Add this import

load_dotenv()

try:
    from config import client
except ImportError:
    from backend.config import client

def generate_legal_document(template_name, form_data):
    prompt = f"""
You are a professional startup legal assistant.

Generate a complete legal document.

Startup Name:
{form_data.get("startup_name")}

Document Type:
{template_name}

User Provided Information:
{json.dumps(form_data, indent=2)}

Instructions:
- Use formal legal language
- Mention the startup name wherever appropriate
- Structure the document with numbered sections
- Include sections such as:
  1. Definitions
  2. Purpose
  3. Obligations
  4. Confidentiality
  5. Term and Termination
  6. Governing Law
  7. Signatures
- Replace placeholders using the provided values
- Output clean HTML
- Use headings (<h1>, <h2>)
- Use paragraphs (<p>)
- Use numbered sections (<ol>, <li>)
- Format it like a professional legal document
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.content