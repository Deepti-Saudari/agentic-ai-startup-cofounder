import os
from dotenv import load_dotenv
from groq import Groq

# Load .env from backend directory or project root
load_dotenv()

class SafeGroqClient:
    """
    Lazy wrapper for Groq client that prevents module import failure
    when GROQ_API_KEY is not configured at startup (e.g. during build or health checks).
    """
    def __init__(self):
        self._client = None

    def _get_client(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY environment variable is not configured. "
                "Please configure GROQ_API_KEY in your hosting dashboard or backend/.env file."
            )
        if self._client is None:
            self._client = Groq(api_key=api_key)
        return self._client

    def __getattr__(self, name):
        return getattr(self._get_client(), name)

client = SafeGroqClient()
