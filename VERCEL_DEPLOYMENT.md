# Deployment Guide: Next.js Frontend on Vercel & FastAPI Backend on Independent Host

This repository contains two services:
1. **Frontend**: Next.js 14 App Router application deployed on **Vercel**.
2. **Backend**: Python FastAPI application hosting the 13 startup cofounder agents, deployed separately on an ASGI platform (e.g., **Render**, **Railway**, **Fly.io**, or Docker).

---

## 1. Frontend Deployment on Vercel

### Quick Setup

1. Push your changes on `deployment/vercel-readiness` (or merge to your deployment branch) to GitHub.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and import this repository.
3. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (repository root)
   - **Build Command**: `npm run build` (configured in `vercel.json`)
   - **Install Command**: `npm ci` (configured in `vercel.json`)
   - **Output Directory**: `.next` (default)
4. Add Environment Variables in Vercel (**Project Settings > Environment Variables**):
   - `NEXT_PUBLIC_API_URL`: Your hosted FastAPI backend origin (e.g. `https://your-backend.onrender.com` or `https://your-backend.railway.app`). Do not include a trailing slash.
   - Note: For local preview before backend deployment, `NEXT_PUBLIC_API_URL` defaults to `http://127.0.0.1:8000`.
5. Click **Deploy**.

---

## 2. FastAPI Backend Deployment (Separate Hosting)

Deploy the backend on Render, Railway, Fly.io, or any container host.

### Required Environment Variables

| Variable | Description | Required | Example |
| --- | --- | --- | --- |
| `GROQ_API_KEY` | Groq API key for LLM generation | Yes | `gsk_...` |
| `ALLOWED_ORIGINS` | Comma-separated frontend origins for CORS | Yes | `https://your-app.vercel.app,http://localhost:3000` |
| `PORT` | Listening port (injected by host platform) | Optional (defaults to 8000) | `8000` |

### Option A: Render Web Service

1. Create a **New Web Service** connected to this repository.
2. Specify settings:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/health`
3. Add environment variables:
   - `GROQ_API_KEY`: `<your_groq_api_key>`
   - `ALLOWED_ORIGINS`: `https://your-app.vercel.app` (your Vercel production URL)
4. Once deployed, copy the service URL (e.g., `https://your-backend.onrender.com`) and paste it into Vercel as `NEXT_PUBLIC_API_URL`.

### Option B: Railway / Fly.io / Docker

A production `Dockerfile` and `Procfile` are located in `backend/`:
- `backend/Procfile`: `web: uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}`
- `backend/Dockerfile`: Multi-stage Python 3.11 container with uvicorn.

---

## 3. Environment Variables Summary

| Variable | Service | Where to Set | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Frontend (Next.js) | Vercel Environment Variables | Connects frontend API calls to the remote FastAPI backend. |
| `GROQ_API_KEY` | Backend (FastAPI) | Render/Railway/Host Dashboard | Authenticates requests to Groq for AI agent operations. |
| `ALLOWED_ORIGINS` | Backend (FastAPI) | Render/Railway/Host Dashboard | Whitelists browser CORS origins (e.g. Vercel deployment URL). |

---

## 4. Verification and Build Status

- **TypeScript Typecheck**: Verified passing (`tsc --noEmit` exited with code 0).
- **Next.js Production Build**: Verified passing (`next build` exited with code 0).
- **Hardcoded URLs**: Replaced all hardcoded `http://127.0.0.1:8000` strings across components with centralized configuration via `NEXT_PUBLIC_API_URL` and `@/lib/api`.
- **CORS & Endpoints**: FastAPI backend configured with dynamic CORS (`ALLOWED_ORIGINS`), `/health`, and `/` endpoints.
- **Backend Import Resilience**: Centralized lazy Groq client so the backend boots cleanly and responds to health checks even during initial deployment before API keys are configured.
