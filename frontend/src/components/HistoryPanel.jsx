import { Clock, Trash2, ChevronRight, AlertCircle } from 'lucide-react';
import { getHistory, deleteAnalysis } from '../utils/history';
import { useState } from 'react';

const SEVERITY_COLORS = {
  critical: 'text-severity-critical',
  high: 'text-severity-high',
  medium: 'text-severity-medium',
  low: 'text-severity-low',
};

export default function HistoryPanel({ onSelectAnalysis, onBack }) {
  const [history, setHistory] = useState(getHistory());

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteAnalysis(id);
    setHistory(getHistory());
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  if (history.length === 0) {
    return (
      <div className="panel text-center py-16 animate-fade-in">
        <Clock size={40} className="mx-auto text-text-tertiary mb-4" />
        <h3 className="text-lg font-semibold text-text-primary mb-1">No history yet</h3>
        <p className="text-sm text-text-tertiary mb-6">
          Your bug analyses will appear here after you run them.
        </p>
        <button className="btn-primary" onClick={onBack}>
          Start your first analysis
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">Analysis History</h2>
        <span className="text-sm text-text-tertiary">{history.length} analyses</span>
      </div>

      <div className="space-y-2">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="panel !p-4 cursor-pointer group hover:border-accent-primary/30 transition-all duration-200"
            onClick={() => onSelectAnalysis(entry)}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-xs font-semibold uppercase ${SEVERITY_COLORS[entry.severity] || 'text-text-tertiary'}`}>
                    {entry.severity}
                  </span>
                  <span className="text-xs text-text-tertiary">•</span>
                  <span className="text-xs text-text-tertiary font-mono">{entry.language}</span>
                  {entry.is_demo && (
                    <>
                      <span className="text-xs text-text-tertiary">•</span>
                      <span className="text-xs text-severity-medium">Demo</span>
                    </>
                  )}
                </div>
                <h3 className="text-sm font-medium text-text-primary truncate group-hover:text-accent-primary-hover transition-colors">
                  {entry.title}
                </h3>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-text-tertiary flex items-center gap-1">
                    <Clock size={11} />
                    {formatDate(entry.timestamp)}
                  </span>
                  <span className="text-xs text-text-tertiary">
                    Confidence: {entry.confidence}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="p-2 rounded-md text-text-tertiary hover:text-severity-high hover:bg-severity-high/10 transition-all opacity-0 group-hover:opacity-100"
                  onClick={(e) => handleDelete(e, entry.id)}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
                <ChevronRight size={16} className="text-text-tertiary group-hover:text-accent-primary transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
