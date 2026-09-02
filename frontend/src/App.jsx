import { useState, useCallback } from 'react';
import Header from './components/Header';
import ErrorInputPanel from './components/ErrorInputPanel';
import AnalysisResults from './components/AnalysisResults';
import HistoryPanel from './components/HistoryPanel';
import LoadingState from './components/LoadingState';
import { analyzeBug } from './services/api';
import { DEMO_ANALYSIS } from './utils/mockData';
import { saveAnalysis } from './utils/history';

export default function App() {
  const [view, setView] = useState('input'); // 'input' | 'results' | 'history' | 'loading'
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [lastInput, setLastInput] = useState(null);

  const handleAnalyze = useCallback(async (inputData) => {
    setView('loading');
    setError(null);
    setLastInput(inputData);

    try {
      const result = await analyzeBug(inputData);
      setAnalysis(result);
      saveAnalysis(result, inputData);
      setView('results');
    } catch (err) {
      console.error('Analysis failed:', err);

      // If backend is unreachable, use demo fallback
      if (
        err.message.includes('Cannot reach') ||
        err.message.includes('Failed to fetch') ||
        err.message.includes('NetworkError')
      ) {
        setAnalysis(DEMO_ANALYSIS);
        saveAnalysis(DEMO_ANALYSIS, inputData);
        setView('results');
        return;
      }

      setError(err.message || 'An unexpected error occurred.');
      setView('input');
    }
  }, []);

  const handleNewAnalysis = useCallback(() => {
    setView('input');
    setAnalysis(null);
    setError(null);
  }, []);

  const handleViewHistory = useCallback(() => {
    setView('history');
  }, []);

  const handleSelectHistoryItem = useCallback((entry) => {
    setAnalysis(entry.analysis);
    setLastInput(entry.inputData);
    setView('results');
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Header
        view={view}
        onNewAnalysis={handleNewAnalysis}
        onViewHistory={handleViewHistory}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-severity-high/10 border border-severity-high/20 text-severity-high text-sm animate-fade-in">
            <strong>Analysis failed: </strong>{error}
          </div>
        )}

        {/* Views */}
        {view === 'input' && (
          <ErrorInputPanel onAnalyze={handleAnalyze} loading={false} />
        )}

        {view === 'loading' && (
          <LoadingState />
        )}

        {view === 'results' && analysis && (
          <AnalysisResults
            analysis={analysis}
            onBack={handleNewAnalysis}
          />
        )}

        {view === 'history' && (
          <HistoryPanel
            onSelectAnalysis={handleSelectHistoryItem}
            onBack={handleNewAnalysis}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border-default py-4 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <span className="text-xs text-text-tertiary">
            BugPilot v1.0 — AI Bug Diagnosis & Debugging Assistant
          </span>
          <span className="text-xs text-text-tertiary">
            Powered by Groq + LLaMA 3.3
          </span>
        </div>
      </footer>
    </div>
  );
}
