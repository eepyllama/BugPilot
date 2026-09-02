import { Crosshair } from 'lucide-react';

export default function RootCause({ analysis }) {
  return (
    <div className="panel animate-fade-in" style={{ animationDelay: '0.05s' }}>
      <div className="flex items-center gap-2 mb-3">
        <Crosshair size={18} className="text-accent-primary" />
        <h3 className="text-base font-semibold text-text-primary">Root Cause</h3>
      </div>

      <div className="p-4 rounded-lg bg-accent-primary/5 border border-accent-primary/15">
        <p className="text-text-primary leading-relaxed">
          {analysis.root_cause}
        </p>
      </div>

      {analysis.explanation && analysis.explanation !== analysis.root_cause && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-text-secondary mb-2">Detailed Explanation</h4>
          <p className="text-sm text-text-secondary leading-relaxed">
            {analysis.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
