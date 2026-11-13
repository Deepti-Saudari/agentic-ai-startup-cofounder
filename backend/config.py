import os
import re
import json
from typing import Any, Optional
from contextvars import ContextVar
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

# Request-scoped API key (e.g. from x-groq-api-key header)
request_groq_key: ContextVar[Optional[str]] = ContextVar("request_groq_key", default=None)

def clean_api_key(raw_key: Optional[str]) -> str:
    if not raw_key:
        return ""
    # Strip whitespace, quotes, and newlines that may be accidentally pasted
    return raw_key.strip().strip('"\'')

def extract_json(text: str) -> Any:
    """
    Robust JSON parser that extracts JSON from LLM text responses,
    handling markdown code blocks, conversational prefixes/suffixes, and raw JSON.
    """
    if not text:
        return None

    cleaned = text.strip()

    # 1. Direct JSON parse
    try:
        return json.loads(cleaned)
    except Exception:
        pass

    # 2. Extract from markdown code fences: ```json ... ``` or ``` ... ```
    fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned, re.IGNORECASE)
    if fence_match:
        try:
            return json.loads(fence_match.group(1).strip())
        except Exception:
            pass

    # 3. Extract between outer braces { ... }
    first_brace = cleaned.find("{")
    last_brace = cleaned.rfind("}")
    if first_brace != -1 and last_brace > first_brace:
        try:
            return json.loads(cleaned[first_brace : last_brace + 1])
        except Exception:
            pass

    # 4. Extract between outer brackets [ ... ]
    first_bracket = cleaned.find("[")
    last_bracket = cleaned.rfind("]")
    if first_bracket != -1 and last_bracket > first_bracket:
        try:
            return json.loads(cleaned[first_bracket : last_bracket + 1])
        except Exception:
            pass

    return None

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

                # Ensure max_tokens stays within Groq rate limits (prevent TPM 6000/12000 overflow)
                max_tokens = call_kwargs.get("max_tokens")
                if max_tokens is None or max_tokens > 3500:
                    call_kwargs["max_tokens"] = 3500

                # Ensure json mode is active if messages mention JSON
                if "response_format" not in call_kwargs:
                    messages = call_kwargs.get("messages", [])
                    has_json_prompt = any("json" in str(m.get("content", "")).lower() for m in messages if isinstance(m, dict))
                    if has_json_prompt:
                        call_kwargs["response_format"] = {"type": "json_object"}

                return real_client.chat.completions.create(*args, **call_kwargs)

            except Exception as e:
                err_str = str(e)
                print(f"[Groq Resilient Warning] Model '{model_name}' failed: {err_str}")
                last_error = e

                # If authentication failed (invalid key), do not cycle models — key is wrong
                if "401" in err_str or "invalid_api_key" in err_str.lower() or "unauthorized" in err_str.lower():
                    raise RuntimeError(
                        f"Authentication failed with GROQ_API_KEY. Please verify your key at https://console.groq.com/keys: {err_str}"
                    )

                # Otherwise (429 RateLimit, 404 Model Not Found, 400 Context Limit, 503 Overloaded), try next model
                continue

        raise last_error or RuntimeError("All Groq model attempts failed.")

class SafeGroqClient:
    """
    Lazy wrapper for Groq client with model fallback, JSON enforcement, and request-level API key support.
    """
    def __init__(self):
        self._cached_client = None
        self._cached_key = None

    def _get_client(self):
        # 1. Check request-scoped key (from request header x-groq-api-key)
        req_key = clean_api_key(request_groq_key.get())
        if req_key:
            return Groq(api_key=req_key)

        # 2. Check environment variable
        env_key = clean_api_key(os.getenv("GROQ_API_KEY", ""))
        if not env_key:
            raise RuntimeError(
                "GROQ_API_KEY is not configured. "
                "Provide your Groq API key in the UI settings dialog, or configure GROQ_API_KEY in your hosting dashboard."
            )

        if self._cached_client is None or self._cached_key != env_key:
            self._cached_client = Groq(api_key=env_key)
            self._cached_key = env_key

        return self._cached_client

    @property
    def chat(self):
        class ChatWrapper:
            def __init__(self, completions):
                self.completions = completions
        return ChatWrapper(ResilientChatCompletions(self._get_client))

    def __getattr__(self, name):
        return getattr(self._get_client(), name)

client = SafeGroqClient()
