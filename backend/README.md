# FastAPI Backend Service

This directory contains the Python FastAPI backend for AI Startup Co-founder, powering the 13 specialized startup agents.

## Local Development

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Linux/macOS:
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Add your `GROQ_API_KEY` in `.env`.

5. Start the development server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   - API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Health Check: [http://localhost:8000/health](http://localhost:8000/health)

---

## Production Deployment (Separate Hosting)

Deploy this service independently from the Vercel frontend on a platform that supports persistent ASGI Python services (e.g. Render, Railway, Fly.io, or Docker).

### Required Environment Variables

| Variable | Description | Example |
| --- | --- | --- |
| `GROQ_API_KEY` | Groq LLM API Key (required for agent generation) | `gsk_...` |
| `ALLOWED_ORIGINS` | Comma-separated allowed frontend origins for CORS | `https://your-app.vercel.app,http://localhost:3000` |
| `PORT` | Listening port (injected automatically by most hosts) | `8000` |

### Option A: Render

1. Create a **New Web Service** connected to your GitHub repository.
2. Configure settings:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/health`
3. Add Environment Variables:
   - `GROQ_API_KEY` = your Groq API key
   - `ALLOWED_ORIGINS` = `https://your-app.vercel.app`
4. Copy the service URL (e.g. `https://your-backend.onrender.com`) and set it as `NEXT_PUBLIC_API_URL` in your Vercel project settings.

### Option B: Railway

1. Deploy from GitHub repo and set root directory to `backend`.
2. Railway detects Python and runs the included `Procfile` / `Dockerfile`.
3. Set `GROQ_API_KEY` and `ALLOWED_ORIGINS` in Railway Variables.
4. Copy the Railway public domain to Vercel's `NEXT_PUBLIC_API_URL`.

### Option C: Docker / Fly.io / Container Host

A production-ready `Dockerfile` and `Procfile` are included in this directory.

```bash
docker build -t ai-startup-cofounder-backend .
docker run -p 8000:8000 -e GROQ_API_KEY="your_key" -e ALLOWED_ORIGINS="https://your-app.vercel.app" ai-startup-cofounder-backend
```
