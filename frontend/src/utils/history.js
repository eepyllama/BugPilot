/**
 * Local storage history management for BugPilot analyses.
 */

const STORAGE_KEY = 'bugpilot_history';

function generateId() {
  return `bp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function saveAnalysis(analysis, inputData) {
  const history = getHistory();
  const entry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    title: analysis.title || 'Untitled Analysis',
    severity: analysis.severity || 'medium',
    language: inputData?.language || 'Unknown',
    confidence: analysis.confidence ?? 0,
    is_demo: analysis.is_demo || false,
    analysis,
    inputData,
  };
  history.unshift(entry);
  // Keep max 50 entries
  if (history.length > 50) history.pop();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return entry;
}

export function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getAnalysisById(id) {
  const history = getHistory();
  return history.find((entry) => entry.id === id) || null;
}

export function deleteAnalysis(id) {
  const history = getHistory().filter((entry) => entry.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
