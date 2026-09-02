"""
Isolated LLM service for BugPilot.

Uses Groq API as primary and OpenRouter as fallback. This module is the ONLY place that
interacts with the LLM provider — swap it to change providers.

Features:
- Structured JSON extraction from LLM response
- Demo/fallback mode when API keys are missing
- Retry logic for transient failures
- True cross-provider fallback (Groq -> OpenRouter)
- Input sanitization
"""

import json
import json_repair
import os
import re
import logging
import asyncio
from typing import Optional

from groq import Groq, APIError, APIConnectionError, RateLimitError, AuthenticationError
from openai import AsyncOpenAI

from prompts.debugging_prompt import get_system_prompt, build_user_prompt
from models.schemas import AnalysisResponse, ErrorChainStep

logger = logging.getLogger(__name__)

# Maximum input lengths to prevent abuse
MAX_ERROR_LENGTH = 10000
MAX_CODE_LENGTH = 20000
MAX_LOGS_LENGTH = 10000
MAX_CONTEXT_LENGTH = 2000

MAX_RETRIES = 2


def _truncate(text: Optional[str], max_length: int) -> Optional[str]:
    """Truncate input text to prevent excessively long prompts."""
    if text is None:
        return None
    if len(text) > max_length:
        return text[:max_length] + f"\n\n[... truncated at {max_length} characters]"
    return text


def _extract_json(text: str) -> dict:
    """Extract JSON from LLM response, handling markdown code fences."""
    # 1. Strip leading and trailing whitespace
    cleaned_text = text.strip()
    
    # 2. Remove standard markdown blocks
    cleaned_text = cleaned_text.replace("```json\n", "")
    cleaned_text = cleaned_text.replace("```json", "")
    cleaned_text = cleaned_text.replace("```JSON\n", "")
    cleaned_text = cleaned_text.replace("```JSON", "")
    cleaned_text = cleaned_text.replace("```\n", "")
    cleaned_text = cleaned_text.replace("```", "")
    
    # 3. Identify the first '{' and the last '}'
    start_idx = cleaned_text.find('{')
    end_idx = cleaned_text.rfind('}')
    
    if start_idx != -1 and end_idx != -1 and end_idx >= start_idx:
        # Extract the substring between them (inclusive)
        json_candidate = cleaned_text[start_idx:end_idx + 1]
    else:
        # Fallback if no braces found
        json_candidate = cleaned_text

    # 4. Attempt to parse, outputting the exact raw text on failure
    try:
        return json_repair.loads(json_candidate)
    except Exception as e:
        raise ValueError(
            f"Could not extract valid JSON from LLM response.\n"
            f"Error: {e}\n"
            f"Attempted to parse:\n{json_candidate}\n\n"
            f"Full Raw Text:\n{text}"
        ) from e



def _get_demo_response(error: str, language: str) -> AnalysisResponse:
    """Return a clearly labeled demo response when no API key is configured."""
    return AnalysisResponse(
        title="Demo Analysis — NullPointerException in UserService",
        severity="high",
        error_type="NullPointerException",
        root_cause=(
            "This is a DEMO response. In production with a configured API key, "
            "BugPilot would analyze your specific error using AI. "
            "The demo shows the structured output format. "
            "The likely root cause pattern: an unchecked nullable return value is "
            "dereferenced without null validation."
        ),
        confidence=0,
        confidence_reasoning=(
            "This is a demo response — confidence is 0 because no actual AI analysis was performed. "
            "Configure a GROQ_API_KEY or OPENROUTER_API_KEY to get real analysis."
        ),
        explanation=(
            "This is a demonstration of BugPilot's structured debugging output. "
            "When a real API key is configured, BugPilot sends your error, code, and logs "
            "to an LLM that follows a structured debugging pipeline. "
            "The AI parses the error, identifies evidence, determines root cause, "
            "and generates actionable fixes — all returned as structured data, not free text."
        ),
        error_chain=[
            ErrorChainStep(step="API Request", detail="Incoming HTTP request triggers the flow", is_root_cause=False),
            ErrorChainStep(step="Controller", detail="Routes request to service layer", is_root_cause=False),
            ErrorChainStep(step="Service Layer", detail="Calls repository and accesses return value", is_root_cause=True),
            ErrorChainStep(step="Repository", detail="Returns null (entity not found)", is_root_cause=False),
            ErrorChainStep(step="Exception", detail="NullPointerException thrown", is_root_cause=False),
        ],
        error_chain_is_inferred=True,
        problematic_code='User user = repository.findById(id);\nreturn user.getName();  // ← potential null dereference',
        problematic_line_explanation="The return value from findById() may be null, but getName() is called without checking.",
        suggested_fix='User user = repository.findById(id);\n\nif (user == null) {\n    throw new UserNotFoundException("User not found: " + id);\n}\n\nreturn user.getName();',
        fix_explanation="Adding a null check before accessing the object prevents the NullPointerException and provides a meaningful error message.",
        alternative_fix='return Optional.ofNullable(repository.findById(id))\n    .map(User::getName)\n    .orElseThrow(() -> new UserNotFoundException("User not found: " + id));',
        alternative_fix_explanation="Using Optional provides a more functional approach that makes the nullable nature explicit and handles it fluently.",
        prevention=[
            "Add null validation before accessing objects from database queries.",
            "Use Optional<T> return types for repository methods that may not find entities.",
            "Write unit tests covering the case where the entity is not found.",
            "Add a custom exception (e.g., UserNotFoundException) for missing entities.",
            "Consider using @NonNull annotations to catch null issues at compile time.",
        ],
        additional_checks=[
            "Check if other repository.findById() calls in the codebase have the same issue.",
            "Verify the database actually contains the expected records.",
            "Review if the API endpoint validates the input ID before passing it to the service.",
        ],
        is_demo=True,
        insufficient_info=False,
        insufficient_info_details=None,
    )


class LLMService:
    """Isolated LLM service — handles multi-provider logic (Groq primary, OpenRouter fallback)."""

    def __init__(self):
        # Initialize Groq Client
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.groq_client = Groq(api_key=self.groq_api_key) if self.groq_api_key else None

        # Initialize OpenRouter Client (via OpenAI SDK)
        self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
        self.openrouter_client = AsyncOpenAI(
            api_key=self.openrouter_api_key,
            base_url="https://openrouter.ai/api/v1"
        ) if self.openrouter_api_key else None

    @property
    def is_configured(self) -> bool:
        return self.groq_client is not None or self.openrouter_client is not None

    async def analyze_bug(
        self,
        error: str,
        code: Optional[str],
        logs: Optional[str],
        language: str,
        context: Optional[str],
        mode: str = "deep",
        provider: str = "llama-70b",
    ) -> AnalysisResponse:
        """
        Analyze a bug using Groq (primary) with an automatic fallback to OpenRouter.
        """
        if not self.is_configured:
            logger.info("No API keys configured — returning demo response")
            return _get_demo_response(error, language)

        # Sanitize and truncate inputs
        error = _truncate(error, MAX_ERROR_LENGTH)
        code = _truncate(code, MAX_CODE_LENGTH)
        logs = _truncate(logs, MAX_LOGS_LENGTH)
        context = _truncate(context, MAX_CONTEXT_LENGTH)

        # Safely fallback to deep mode if an unrecognized string is received
        safe_mode = mode if mode in ["quick", "deep", "beginner"] else "deep"
        
        system_prompt = get_system_prompt(safe_mode)
        user_prompt = build_user_prompt(error, code, logs, language, context)

        async def _attempt_call(target_client: str, model_id: str):
            if target_client == "openrouter":
                if not self.openrouter_client:
                    raise AuthenticationError("OPENROUTER_API_KEY is not configured for fallback")
                
                response = await self.openrouter_client.chat.completions.create(
                    model=model_id,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=0.1,
                    max_tokens=4096,
                    response_format={"type": "json_object"},
                )
                raw_text = response.choices[0].message.content
            else:
                if not self.groq_client:
                    raise AuthenticationError("GROQ_API_KEY is not configured")

                response = self.groq_client.chat.completions.create(
                    model=model_id,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=0.1,
                    max_tokens=4096,
                    response_format={"type": "json_object"},
                )
                raw_text = response.choices[0].message.content

            parsed = _extract_json(raw_text)
            result = AnalysisResponse(**parsed)
            result.is_demo = False
            return result

        # Hardcode primary model
        primary_model = "llama-3.1-8b-instant"
        fallback_model = "qwen/qwen-2.5-coder-32b-instruct"

        last_error = None
        
        # 1. Attempt Groq (Primary)
        for attempt in range(MAX_RETRIES + 1):
            try:
                return await _attempt_call("groq", primary_model)
            except Exception as e:
                logger.warning(f"Groq primary model '{primary_model}' failed (attempt {attempt+1}): {e}")
                last_error = e
                if attempt < MAX_RETRIES:
                    await asyncio.sleep(2 ** attempt)
                continue

        # 2. Attempt OpenRouter (Fallback)
        logger.warning(f"Groq failed all retries. Immediately falling back to OpenRouter '{fallback_model}'.")
        try:
            return await _attempt_call("openrouter", fallback_model)
        except Exception as fallback_e:
            logger.error(f"OpenRouter fallback '{fallback_model}' also failed: {fallback_e}")
            raise RuntimeError(f"Both Groq and OpenRouter failed. Primary error: {last_error} | Fallback error: {fallback_e}")


# Singleton instance
llm_service = LLMService()
