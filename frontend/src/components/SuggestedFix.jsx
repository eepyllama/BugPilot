import { Wrench, RefreshCw } from 'lucide-react';

export default function SuggestedFix({ analysis }) {
  if (!analysis.suggested_fix) return null;

  return (
    <div className="panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center gap-2 mb-3">
        <Wrench size={18} className="text-accent-secondary" />
        <h3 className="text-base font-semibold text-text-primary">Suggested Fix</h3>
      </div>

      <div className="code-block border-accent-secondary/30">
        {analysis.suggested_fix}
      </div>

      {analysis.fix_explanation && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-accent-secondary mb-1.5">Why this fixes the bug</h4>
          <p className="text-sm text-text-secondary leading-relaxed">
            {analysis.fix_explanation}
          </p>
        </div>
      )}

      {/* Alternative Fix */}
      {analysis.alternative_fix && (
        <div className="mt-6 pt-5 border-t border-border-default">
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw size={16} className="text-text-tertiary" />
            <h4 className="text-sm font-semibold text-text-secondary">Alternative Approach</h4>
          </div>

          <div className="code-block">
            {analysis.alternative_fix}
          </div>

          {analysis.alternative_fix_explanation && (
            <p className="mt-2 text-sm text-text-tertiary leading-relaxed">
              {analysis.alternative_fix_explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
