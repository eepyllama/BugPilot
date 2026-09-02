/**
 * BugPilot API Service
 *
 * Handles all communication with the FastAPI backend.
 * Falls back to mock data when the backend is unavailable.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Analyze a bug using the backend AI pipeline.
 */
export async function analyzeBug({ error, code, logs, language, context, mode }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error, code, logs, language, context, mode }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const detail = errorData.detail || `Server error (${response.status})`;

      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      if (response.status === 503) {
        throw new Error('AI service is not configured. Check your API key.');
      }
      throw new Error(detail);
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      throw new Error('Analysis timed out. The AI service may be overloaded — please try again.');
    }
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error(
        'Cannot reach the backend server. Make sure the FastAPI backend is running on port 8000.'
      );
    }
    throw err;
  }
}

/**
 * Check if the backend is running and the LLM is configured.
 */
export async function healthCheck() {
  try {
    const response = await fetch(`${API_BASE}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return { status: 'error', llm_configured: false };
    return await response.json();
  } catch {
    return { status: 'unreachable', llm_configured: false };
  }
}
