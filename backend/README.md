# Backend deployment

This directory contains the FastAPI service. Deploy it as an independent Python ASGI web service; it is not a persistent service to run from Vercel. See [`../VERCEL_DEPLOYMENT.md`](../VERCEL_DEPLOYMENT.md) for a Render example, Vercel setup, environment checklist, and known verification blockers.

Local run:

```bash
python -m venv .venv
# Activate the virtual environment for your platform, then:
pip install -r requirements.txt
cp .env.example .env
# Set GROQ_API_KEY in .env, then:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
