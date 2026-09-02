"""
BugPilot — FastAPI Backend

Endpoints:
  POST /api/analyze  — Submit error for AI debugging analysis
  GET  /api/health   — Health check
"""

import logging
import os

# Load .env BEFORE any other imports so env vars are available
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env"))
load_dotenv()  # Also try current directory

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    HealthResponse,
    ErrorResponse,
)
from services.llm_service import LLMService

# Initialize LLM service after env is loaded
_llm = LLMService()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="BugPilot API",
    description="AI Bug Diagnosis & Debugging Assistant",
    version="1.0.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Check if the backend is running and the LLM is configured."""
    return HealthResponse(
        status="ok",
        version="1.0.0",
        llm_configured=_llm.is_configured,
    )


@app.post("/api/analyze", response_model=AnalysisResponse, responses={
    400: {"model": ErrorResponse},
    500: {"model": ErrorResponse},
    503: {"model": ErrorResponse},
})
async def analyze_bug(request: AnalysisRequest):
    """
    Analyze a bug using the AI debugging pipeline.

    Accepts error/stack trace, optional source code, logs, and context.
    Returns a structured debugging report.
    """
    # Validate that error is not just whitespace
    if not request.error.strip():
        raise HTTPException(
            status_code=400,
            detail="Error message cannot be empty."
        )

    try:
        logger.info(
            f"Analyzing bug: language={request.language}, mode={request.mode}, "
            f"error_length={len(request.error)}, has_code={bool(request.code)}, "
            f"llm_configured={_llm.is_configured}"
        )

        result = await _llm.analyze_bug(
            error=request.error,
            code=request.code,
            logs=request.logs,
            language=request.language,
            context=request.context,
            mode=request.mode.value,
            provider=request.provider,
        )


        logger.info(f"Analysis complete: title='{result.title}', confidence={result.confidence}")
        return result

    except RuntimeError as e:
        error_msg = str(e)
        logger.error(f"Analysis failed: {error_msg}")

        if "rate" in error_msg.lower() or "limit" in error_msg.lower():
            raise HTTPException(status_code=429, detail=error_msg)
        else:
            raise HTTPException(status_code=500, detail=error_msg)

    except Exception as e:
        logger.exception("Unexpected error during analysis")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred during analysis. Please try again."
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
