import os
import re
from dotenv import load_dotenv
from groq import Groq

# Load .env from backend directory or project root
load_dotenv()

FALLBACK_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "llama3-70b-8192",
    "llama3-8b-8192",
]

def clean_api_key(raw_key: str) -> str:
    if not raw_key:
        return ""
    # Strip whitespace, quotes, and newlines that may be accidentally pasted into Render
    return raw_key.strip().strip('"\'')

class ResilientChatCompletions:
    def __init__(self, get_real_client):
        self._get_client = get_real_client

    def create(self, *args, **kwargs):
        real_client = self._get_client()
        requested_model = kwargs.get("model", "llama-3.3-70b-versatile")

        # Build list of models to try in order
        models_to_try = [requested_model]
        for m in FALLBACK_MODELS:
            if m not in models_to_try:
                models_to_try.append(m)

        last_error = None
        for model_name in models_to_try:
            try:
                call_kwargs = dict(kwargs)
                call_kwargs["model"] = model_name

                # Some models have smaller token limits; adjust max_tokens gracefully if needed
                if "max_tokens" in call_kwargs:
                    if "8b" in model_name and call_kwargs["max_tokens"] > 4096:
                        call_kwargs["max_tokens"] = 4096

                return real_client.chat.completions.create(*args, **call_kwargs)

            except Exception as e:
                err_str = str(e)
                print(f"[Groq Resilient Warning] Model '{model_name}' failed: {err_str}")
                last_error = e

                # If authentication failed (invalid key), do not cycle models — the key itself is wrong
                if "401" in err_str or "invalid_api_key" in err_str.lower() or "unauthorized" in err_str.lower():
                    raise RuntimeError(
                        f"Authentication failed with GROQ_API_KEY. Please check that your key is valid in your Render/hosting environment variables: {err_str}"
                    )

                # Otherwise (429 RateLimit, 404 Model Not Found, 400 Context Limit, 503 Overloaded), try next model
                continue

        raise last_error or RuntimeError("All Groq model attempts failed.")

class SafeGroqClient:
    """
    Lazy wrapper for Groq client with model fallback and sanitized environment variables.
    """
    def __init__(self):
        self._client = None

    def _get_client(self):
        raw_key = os.getenv("GROQ_API_KEY", "")
        api_key = clean_api_key(raw_key)

        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY environment variable is not configured. "
                "On Render: Go to your Service -> Environment -> add GROQ_API_KEY with your key from console.groq.com."
            )
        if self._client is None:
            self._client = Groq(api_key=api_key)
        return self._client

    @property
    def chat(self):
        class ChatWrapper:
            def __init__(self, completions):
                self.completions = completions
        return ChatWrapper(ResilientChatCompletions(self._get_client))

    def __getattr__(self, name):
        return getattr(self._get_client(), name)

client = SafeGroqClient()
