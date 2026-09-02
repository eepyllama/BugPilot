import { AlertTriangle, Info } from 'lucide-react';

const SEVERITY_CONFIG = {
  critical: { emoji: '🔴', class: 'severity-critical' },
  high: { emoji: '🟠', class: 'severity-high' },
  medium: { emoji: '🟡', class: 'severity-medium' },
  low: { emoji: '🟢', class: 'severity-low' },
};

export default function BugOverview({ analysis }) {
  const sev = SEVERITY_CONFIG[analysis.severity] || SEVERITY_CONFIG.medium;

  return (
    <div className="panel animate-fade-in">
      {/* Demo Banner */}
      {analysis.is_demo && (
        <div className="demo-banner mb-4">
          <Info size={18} />
          <span>
            <strong>Demo Analysis</strong> — This is a sample response. Configure a GROQ_API_KEY for real AI analysis.
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className={`severity-badge ${sev.class}`}>
              {sev.emoji} {analysis.severity}
            </span>
            <span className="text-xs text-text-tertiary font-mono bg-bg-tertiary px-2 py-1 rounded">
              {analysis.error_type}
            </span>
          </div>
          <h2 className="text-xl font-bold text-text-primary mt-2">
            {analysis.title}
          </h2>
        </div>

        {/* Confidence */}
        <div className="text-right flex-shrink-0">
          <div className="text-3xl font-bold" style={{
            color: analysis.confidence >= 70
              ? 'var(--color-confidence-high)'
              : analysis.confidence >= 40
              ? 'var(--color-confidence-medium)'
              : 'var(--color-confidence-low)'
          }}>
            {analysis.confidence}%
          </div>
          <div className="text-xs text-text-tertiary mt-0.5">Confidence</div>
        </div>
      </div>

      {/* Insufficient info warning */}
      {analysis.insufficient_info && (
        <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-severity-medium/10 border border-severity-medium/20">
          <AlertTriangle size={16} className="text-severity-medium mt-0.5 flex-shrink-0" />
          <div className="text-sm text-severity-medium">
            <strong>Insufficient information.</strong>{' '}
            {analysis.insufficient_info_details || 'Additional context would improve this analysis.'}
          </div>
        </div>
      )}
    </div>
  );
}
