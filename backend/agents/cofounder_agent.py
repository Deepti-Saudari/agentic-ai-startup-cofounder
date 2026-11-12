from groq import Groq
from dotenv import load_dotenv
import os
import json

load_dotenv()

try:
    from config import client
except ImportError:
    from backend.config import client

def ai_cofounder_chat(message):
    """
    Smart AI cofounder that knows when to chat and when to take action
    """
    
    # Detect if this is a request for generation
    is_generation_request = any(phrase in message.lower() for phrase in [
        "generate", "create", "make me", "build", "write", "roadmap", "plan",
        "idea for", "suggest", "give me", "need a"
    ])
    
    if is_generation_request:
        # This is a request for actual work - be helpful and direct
        prompt = f"""The user wants me to help create something specific.

Request: {message}

DO NOT ask questions back. DO NOT be conversational.
Just provide what they asked for directly and helpfully.

If they want a startup idea: Give 2-3 specific ideas with brief explanation
If they want a roadmap: Give a timeline with phases and milestones
If they want pricing advice: Give specific recommendations with examples

Be helpful, be direct, give them what they asked for."""

    else:
        # This is just casual conversation - be friendly
        prompt = f"""The user is just chatting casually.

They said: {message}

Respond naturally and conversationally, but keep it brief.
If they ask a question, answer it directly.
Don't overthink it - just chat like a friend."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a helpful AI cofounder. Be direct when users ask for help, friendly when they chat casually."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"Hey, having a quick technical issue. Can you try that again? ({str(e)})"