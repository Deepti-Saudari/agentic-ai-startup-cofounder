<p align="center">

<img src="images/banner.png" width="100%">

</p>

<div align="center">

# 🚀 AI Startup Co-Founder

### Your AI-Powered Startup Companion

Transform startup ideas into investor-ready businesses using **13 Specialized AI Agents**.

<p>

<img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white"/>

<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>

<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs"/>

<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react"/>

<img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss"/>

<img src="https://img.shields.io/badge/Groq_LLM-FF6B35?style=for-the-badge"/>

</p>

</div>

---

---

# 📖 Overview

AI Startup Co-Founder is an AI-powered platform that helps entrepreneurs transform ideas into structured business plans using a team of specialized AI agents.

Instead of relying on a single chatbot, the platform distributes startup tasks across dedicated agents responsible for idea validation, market research, financial planning, pitch deck creation, marketing strategy, legal documentation, hiring plans, and roadmap generation.

The goal is to reduce the time required to move from an idea to an actionable startup strategy while providing organized, AI-assisted decision support.

---

# 🎯 Core Features

### 💡 Startup Validation

- Validate startup ideas
- Opportunity scoring
- SWOT analysis
- Problem–solution fit

### 📊 Market Research

- Competitor analysis
- Market sizing
- Industry trends
- Customer personas

### 💼 Business Planning

- Business Model Canvas
- Lean Canvas
- Revenue model
- Pricing strategy

### 💰 Financial Planning

- Revenue projections
- Expense estimation
- Break-even analysis
- Investment planning

### 📈 Growth Strategy

- Go-To-Market strategy
- Marketing roadmap
- KPI planning
- Operations planning

### 🎤 Investor Toolkit

- Pitch deck generation
- Executive summary
- Funding strategy
- Business documentation

---
# 📸 Application Preview

<div align="center">

| Dashboard | Financial Model |
|-----------|-----------------|
| <img src="docs/dashboard.png" width="100%"> | <img src="docs/financial-model.png" width="100%"> |

| Market Research | Business Plan |
|-----------------|---------------|
| <img src="docs/market-research.png" width="100%"> | <img src="docs/business-plan.png" width="100%"> |

</div>

> **Note:** Create a `docs/` folder later and place the screenshots with these exact names.

---

# 🏗️ System Architecture

```text
                           User
                             │
                             ▼
                 Next.js + React Frontend
                             │
                     REST API Requests
                             │
                             ▼
                    FastAPI Backend API
                             │
                    Agent Orchestrator
                             │
     ┌──────────────────────────────────────────┐
     │                                          │
     │   💡 Startup Validation Agent            │
     │   📊 Market Research Agent               │
     │   💼 Business Plan Agent                 │
     │   💰 Financial Model Agent               │
     │   📈 Marketing Strategy Agent            │
     │   🎤 Pitch Deck Agent                    │
     │   📄 Legal Documentation Agent           │
     │   👥 Hiring Agent                        │
     │   🛣 Roadmap Agent                       │
     │   💵 Funding Strategy Agent              │
     │   ⚙ Operations Agent                    │
     │   🤖 AI Co-Founder Agent                │
     │   📑 Report Generator                   │
     │                                          │
     └──────────────────────────────────────────┘
                             │
                             ▼
                      Groq LLM API
                             │
                             ▼
                  AI Generated Business Reports
```

---

# 🛠️ Technology Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | Next.js, React, Tailwind CSS, TypeScript |
| **Backend** | Python, FastAPI |
| **AI & LLM** | Groq LLaMA, Prompt Engineering, Multi-Agent System |
| **API** | REST APIs |
| **Tools** | Git, GitHub, VS Code |
| **Deployment Ready** | Vercel, Render |

---

# 📂 Project Structure

```text
agentic-ai-startup-cofounder/

├── app/
├── backend/
├── components/
├── agents/
├── hooks/
├── public/
├── styles/
├── data/
├── package.json
├── requirements.txt
└── README.md
```

---
# 🚀 Getting Started

## Prerequisites

Make sure you have the following installed:

- Python 3.10+
- Node.js 18+
- npm
- Git

---

## Clone the Repository

```bash
git clone https://github.com/Deepti-Saudari/agentic-ai-startup-cofounder.git

cd agentic-ai-startup-cofounder
```

---

## Frontend Setup

```bash
npm install

npm run dev
```

Frontend runs on:

```
http://localhost:3000
```

---

## Backend Setup

```bash
cd backend

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend runs on:

```
http://localhost:8000
```

---

# 🔑 Environment Variables

Create a `.env` file inside the backend directory.

```env
GROQ_API_KEY=your_groq_api_key
```

---

# 📌 Future Roadmap

- [x] Multi-Agent Architecture
- [x] Startup Validation
- [x] Market Research
- [x] Financial Planning
- [x] Pitch Deck Generation
- [x] Business Planning
- [ ] Authentication
- [ ] Team Collaboration
- [ ] PDF Export
- [ ] Analytics Dashboard
- [ ] Cloud Deployment
- [ ] Live Demo

---

# 🤝 Contributing

Contributions are welcome.

1. Fork this repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push your branch

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👩‍💻 Author

**Deepti Saudari**

- 📧 saudarideepti@gmail.com
- 💼 https://www.linkedin.com/in/deepti-saudari/
- 🐙 https://github.com/Deepti-Saudari

---

<div align="center">

## ⭐ If you found this project useful, consider giving it a Star!

It helps others discover the project and motivates future improvements.

<img src="https://capsule-render.vercel.app/api?type=waving&height=120&color=gradient&section=footer"/>

</div>
