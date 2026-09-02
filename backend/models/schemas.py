"""
Pydantic models for BugPilot API request/response schemas.
"""

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class AnalysisMode(str, Enum):
    quick = "quick"
    deep = "deep"
    beginner = "beginner"


class Severity(str, Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"


class AnalysisRequest(BaseModel):
    """Input schema for bug analysis."""
    error: str = Field(..., min_length=1, description="Error message or stack trace")
    code: Optional[str] = Field(None, description="Relevant source code")
    logs: Optional[str] = Field(None, description="Application logs")
    language: str = Field("Python", description="Programming language")
    context: Optional[str] = Field(None, description="Additional context about the error")
    mode: AnalysisMode = Field(AnalysisMode.deep, description="Analysis depth mode")
    provider: str = Field("llama-70b", description="Model preference (llama-70b or llama-8b)")





class ErrorChainStep(BaseModel):
    """A single step in the error propagation chain."""
    step: str
    detail: str
    is_root_cause: bool = False


class AnalysisResponse(BaseModel):
    """Structured output from the AI debugging analysis."""
    title: str = Field(..., description="Short descriptive title of the bug")
    severity: Severity = Field(..., description="Bug severity classification")
    error_type: str = Field(..., description="Type/category of the error")
    root_cause: str = Field(..., description="Explanation of the root cause")
    confidence: int = Field(..., ge=0, le=100, description="Confidence score 0-100")
    confidence_reasoning: str = Field("", description="Why this confidence level")
    explanation: str = Field(..., description="Detailed explanation of the bug")
    error_chain: list[ErrorChainStep] = Field(default_factory=list, description="Error propagation chain")
    error_chain_is_inferred: bool = Field(False, description="Whether the chain is inferred vs evidence-based")
    problematic_code: Optional[str] = Field(None, description="The problematic code section")
    problematic_line_explanation: Optional[str] = Field(None, description="Explanation of the problematic line")
    suggested_fix: Optional[str] = Field(None, description="Suggested code fix")
    fix_explanation: Optional[str] = Field(None, description="Why this fix works")
    alternative_fix: Optional[str] = Field(None, description="Alternative fix approach")
    alternative_fix_explanation: Optional[str] = Field(None, description="Why the alternative works")
    prevention: list[str] = Field(default_factory=list, description="Prevention recommendations")
    additional_checks: list[str] = Field(default_factory=list, description="Additional things to verify")
    is_demo: bool = Field(False, description="Whether this is a demo/mock response")
    insufficient_info: bool = Field(False, description="Whether there was insufficient info for full analysis")
    insufficient_info_details: Optional[str] = Field(None, description="What additional info would help")


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "ok"
    version: str = "1.0.0"
    llm_configured: bool = False


class ErrorResponse(BaseModel):
    """Error response for API errors."""
    error: str
    detail: Optional[str] = None
