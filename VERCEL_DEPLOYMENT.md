# Deployment guide: Next.js frontend on Vercel, FastAPI backend hosted separately

This repository contains two deployable services. Deploy the Next.js 14 frontend to Vercel. Run the Python FastAPI application as a separate web service on a host that supports persistent Python ASGI services (for example Render, Railway, Fly.io, or a container platform). Do not configure Vercel to start `uvicorn` as a persistent server.

## Frontend on Vercel

1. Push this repository to GitHub and import it in Vercel.
2. Select the repository root as the project root (the `package.json` and `vercel.json` are at the root).
3. Select the Next.js framework preset. The checked-in `vercel.json` uses `npm ci` and `npm run build`.
4. Set the project environment variable `NEXT_PUBLIC_API_URL` to the public HTTPS origin of the separately hosted FastAPI service, for example `https://your-api.example.com` (no trailing slash).
5. Add the variable to Production, Preview, and Development environments as applicable, then redeploy after changing it.
6. Deploy. The application uses server-rendered Next.js routes and must not be configured as a static export.

The repository currently has frontend fetches that hardcode `http://127.0.0.1:8000`. Those references must be migrated to `NEXT_PUBLIC_API_URL` (or a same-origin API proxy) before production API integrations will work. Setting the Vercel variable alone does not override hardcoded URLs. Until those call sites are changed and a production build is run successfully, the frontend is not verified deployment-ready.

## FastAPI backend on Render (example)

Create a Render Web Service from this repository:

- Root Directory: `backend`
- Runtime: Python
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/docs` (or add a dedicated `/health` endpoint before using `/health`)
- Python version: use a currently supported Python 3.10+ runtime.

Set these service environment variables in the hosting dashboard, never in the repository:

- `GROQ_API_KEY` — required Groq API key
- `ALLOWED_ORIGINS` — comma-separated allowed browser origins, such as `https://your-app.vercel.app,https://your-custom-domain.example`

Configure the FastAPI CORS middleware to read `ALLOWED_ORIGINS` and allow only those origins. The current backend config allows all origins and credentials; tighten it before exposing the API publicly. Set the frontend's `NEXT_PUBLIC_API_URL` to the deployed service's HTTPS origin and redeploy Vercel.

Do not rely on local filesystem persistence for uploaded or generated files on ephemeral hosting. Store persistent artifacts in object storage if the product later needs durable files.

## Environment checklist

| Variable | Service | Required | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Vercel frontend | Yes for FastAPI integrations | Public HTTPS API origin; this is intentionally public, never put secrets here. |
| `GROQ_API_KEY` | FastAPI host | Yes for AI features | Secret; configure in host's environment settings only. |
| `ALLOWED_ORIGINS` | FastAPI host | Yes for browser CORS | Comma-separated Vercel production/preview/custom origins; use local localhost origin for development. |

## Local development

Frontend: `npm ci && npm run dev` from the repository root. Set `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000` in `.env.local`.

Backend: `cd backend`, create and activate a Python virtual environment, install `pip install -r requirements.txt`, copy `backend/.env.example` to `backend/.env`, add a valid Groq key, then run `uvicorn main:app --reload --host 0.0.0.0 --port 8000`.

## Verification status and known blockers

The GitHub editing tools available in this task cannot execute shell commands, install dependencies, run `npm run build` or tests, or create a pull request. The source must not be described as build-verified until those commands have run in CI or a local checkout. The current frontend contains hardcoded localhost backend URLs, duplicate Next.js config files, and dependency lockfiles that need validation together. Run `npm ci`, `npm run typecheck`, and `npm run build`; resolve all reported errors and update the npm lockfile before merging. The `backend/requirements.txt` has been normalized to UTF-8 text, but Python dependencies and API startup have not been executed in this environment.
