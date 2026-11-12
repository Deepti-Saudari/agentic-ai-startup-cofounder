from fastapi import FastAPI, Body, HTTPException  # Added HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from typing import Dict, Optional, List, Any
import uuid
import json
import io

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER
from agents.idea_agent import generate_startup_ideas
from agents.market_agent import run_market_research
from agents.business_agent import generate_business_plan
from agents.financial_agent import generate_financial_model
from agents.legal_agent import generate_legal_document
from agents.pitch_agent import generate_pitch_deck
from agents.product_dev_agent import generate_product_plan
from agents.marketing_agent import generate_marketing_plan
from agents.funding_agent import generate_funding_plan
from agents.team_agent import generate_team_plan
from agents.roadmap_agent import generate_startup_roadmap
from agents.operations_agent import generate_operations_plan
from agents.cofounder_agent import ai_cofounder_chat
from orchestrator.startup_orchestrator import run_startup_builder

import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="AI Startup Co-founder API",
    description="Agentic backend powering AI Startup Co-founder",
    version="1.0.0",
)

# Configure CORS origins from environment variable
raw_origins = os.getenv("ALLOWED_ORIGINS", "")
if raw_origins.strip() == "*":
    allow_origins = ["*"]
    allow_credentials = False
elif raw_origins.strip():
    allow_origins = [orig.strip() for orig in raw_origins.split(",") if orig.strip()]
    allow_credentials = True
else:
    # Default for local development
    allow_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "status": "online",
        "message": "AI Startup Co-founder API is running",
        "docs_url": "/docs",
        "health_url": "/health",
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "agentic-ai-startup-cofounder-backend",
        "groq_configured": bool(os.getenv("GROQ_API_KEY")),
    }

# -------- IDEA GENERATOR --------

class IdeaRequest(BaseModel):
    skills: Optional[str] = ""
    interests: Optional[str] = ""
    experience: Optional[str] = ""
    idea: Optional[str] = ""
    mode: str = "generate"

@app.post("/generate-ideas")
async def idea_generator(data: IdeaRequest):
    """
    Generate comprehensive startup ideas with deep strategic analysis
    Returns 8 layers of analysis + 3-5 comprehensive startup ideas
    """
    try:
        # Validate inputs
        if data.mode == "generate":
            if not data.skills or not data.skills.strip():
                return {"error": "Please describe your skills and expertise", "analysis": None, "ideas": []}
            if not data.interests or not data.interests.strip():
                return {"error": "Please specify your industries of interest", "analysis": None, "ideas": []}
        elif data.mode == "enhance":
            if not data.idea or not data.idea.strip():
                return {"error": "Please describe your startup idea", "analysis": None, "ideas": []}
        else:
            return {"error": "Invalid mode. Use 'generate' or 'enhance'", "analysis": None, "ideas": []}

        print(f"Generating strategic analysis - Mode: {data.mode}")

        # Call the enhanced agent function
        result = generate_startup_ideas(
            skills=data.skills.strip(),
            interests=data.interests.strip(),
            experience=data.experience.strip() if data.experience else "",
            idea=data.idea.strip() if data.idea else "",
            mode=data.mode
        )
        
        return result

    except Exception as e:
        print(f"Error in idea generation: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": f"Failed to generate ideas: {str(e)}", "analysis": None, "ideas": []}

# -------- MARKET RESEARCH --------

class MarketRequest(BaseModel):
    industry: str
    target_market: str

@app.post("/market-research")
def market_research(data: MarketRequest):
    result = run_market_research(
        data.industry,
        data.target_market
    )
    return {"analysis": result}

# -------- BUSINESS PLANNER --------

class BusinessPlanRequest(BaseModel):
    startup_idea: str

@app.post("/business-plan")
def business_plan(data: BusinessPlanRequest):
    result = generate_business_plan(data.startup_idea)
    return {"plan": result}

# -------- FINANCE MODEL --------

class FinancialRequest(BaseModel):
    startup_idea: str
    growth_rate: str
    arpu: str
    cac: str
    churn: str
    margin: str

@app.post("/financial-model")
def financial_model(data: FinancialRequest):
    result = generate_financial_model(
        data.startup_idea,
        data.growth_rate,
        data.arpu,
        data.cac,
        data.churn,
        data.margin
    )
    return {"financials": result}

# -------- LEGAL DOCUMENTS --------

class LegalDocRequest(BaseModel):
    template_name: str
    startup_name: str
    form_data: Dict[str, str]

class LegalDocGenerateRequest(BaseModel):
    template_name: str
    startup_name: str
    form_data: dict

@app.post("/generate-legal-document")
async def generate_legal_document_endpoint(data: LegalDocGenerateRequest):
    """Generate legal document using AI"""
    try:
        result = generate_legal_document(
            data.template_name,
            {
                "startup_name": data.startup_name,
                **data.form_data
            }
        )
        return {"document": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/export-legal-pdf")
async def export_legal_pdf(data: dict = Body(...)):
    """Export legal document as PDF"""
    try:
        from reportlab.pdfgen import canvas
        import io
        
        document_content = data.get("document", "No content")
        
        # Create PDF in memory
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        
        # Add text to PDF
        y = 750  # Start from top
        x = 50   # Left margin
        
        # Clean the HTML content
        clean_text = document_content
        clean_text = clean_text.replace('<h1>', '')
        clean_text = clean_text.replace('</h1>', '')
        clean_text = clean_text.replace('<h2>', '')
        clean_text = clean_text.replace('</h2>', '')
        clean_text = clean_text.replace('<p>', '')
        clean_text = clean_text.replace('</p>', '')
        clean_text = clean_text.replace('<li>', '• ')
        clean_text = clean_text.replace('</li>', '')
        clean_text = clean_text.replace('<ol>', '')
        clean_text = clean_text.replace('</ol>', '')
        clean_text = clean_text.replace('<ul>', '')
        clean_text = clean_text.replace('</ul>', '')
        
        # Split into lines
        lines = clean_text.split('\n')
        
        # Write each line to PDF
        for line in lines:
            if line.strip():  # If line is not empty
                c.drawString(x, y, line.strip())
                y = y - 20  # Move down for next line
                
                # If we reach bottom of page, create new page
                if y < 50:
                    c.showPage()
                    y = 750
        
        c.save()
        pdf = buffer.getvalue()
        buffer.close()
        
        return Response(
            content=pdf,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=legal_document.pdf"}
        )
        
    except Exception as e:
        print("ERROR:", str(e))  # This will show in terminal
        return {"error": str(e)}

# -------- PITCH DECK --------

class PitchRequest(BaseModel):
    startup_idea: str
    target_market: str

@app.post("/pitch-deck")
def pitch_deck(data: PitchRequest):
    try:
        result = generate_pitch_deck(
            data.startup_idea,
            data.target_market
        )

        if "raw_output" in result:
            raise HTTPException(status_code=500, detail="Invalid AI response")

        return {"deck": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -------- PRODUCT DEVELOPMENT --------

class ProductDevRequest(BaseModel):
    startup_idea: str
    industry: str

@app.post("/product-development")
def product_development(data: ProductDevRequest):
    result = generate_product_plan(
        data.startup_idea,
        data.industry
    )
    return {"product_plan": result}

# -------- MARKETING STRATEGY --------

class MarketingRequest(BaseModel):
    startup_idea: str
    industry: str

@app.post("/marketing-strategy")
def marketing_strategy(data: MarketingRequest):
    result = generate_marketing_plan(
        data.startup_idea,
        data.industry
    )
    return {"marketing_plan": result}

# -------- FUNDING STRATEGY --------

class FundingRequest(BaseModel):
    startup_idea: str
    industry: str

@app.post("/funding-strategy")
def funding_strategy(data: FundingRequest):
    result = generate_funding_plan(
        data.startup_idea,
        data.industry
    )
    return {"funding_plan": result}

# -------- TEAM & HIRING --------

class TeamRequest(BaseModel):
    startup_idea: str
    industry: str

@app.post("/team-hiring")
def team_hiring(data: TeamRequest):
    result = generate_team_plan(
        data.startup_idea,
        data.industry
    )
    return {"team_plan": result}

# -------- ROADMAP --------

class RoadmapRequest(BaseModel):
    startup_idea: str
    industry: str

@app.post("/startup-roadmap")
def roadmap(data: RoadmapRequest):
    result = generate_startup_roadmap(
        data.startup_idea,
        data.industry
    )
    return {"roadmap": result}

# -------- OPERATIONS --------

class OperationsRequest(BaseModel):
    startup_idea: str
    industry: str

@app.post("/operations-plan")
def operations(data: OperationsRequest):
    result = generate_operations_plan(
        data.startup_idea,
        data.industry
    )
    return {"operations": result}

# -------- AI-COFOUNDER-CHAT --------

class ChatRequest(BaseModel):
    message: str

@app.post("/ai-cofounder")
def cofounder_chat(data: ChatRequest):
    result = ai_cofounder_chat(data.message)
    return {"reply": result}

# -------- ORCHESTRATION --------

class StartupBuilderRequest(BaseModel):
    skills: str
    interests: str
    experience: str

@app.post("/startup-builder")
def startup_builder(data: StartupBuilderRequest):
    result = run_startup_builder(
        data.skills,
        data.interests,
        data.experience
    )
    return {"startup": result}

# -------- EXPORT BUSINESS PLAN AS PDF --------

@app.post("/export-business-plan")
def export_business_plan(data: dict):
    filename = f"business_plan_{uuid.uuid4().hex}.pdf"
    c = canvas.Canvas(filename, pagesize=letter)
    y = 750

    c.drawString(50, y, "Business Plan")
    y -= 40

    c.drawString(50, y, "Lean Canvas")
    y -= 20
    c.drawString(50, y, str(data.get("lean_canvas")))
    y -= 40

    c.drawString(50, y, "SWOT")
    y -= 20
    c.drawString(50, y, str(data.get("swot")))
    y -= 40

    c.drawString(50, y, "Executive Summary")
    y -= 20
    c.drawString(50, y, str(data.get("executive_summary")))

    c.save()
    return FileResponse(filename, filename="business_plan.pdf")