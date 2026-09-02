import { Shield, CheckCircle } from 'lucide-react';

export default function Prevention({ analysis }) {
  const items = analysis.prevention;
  if (!items || items.length === 0) return null;

  return (
    <div className="panel animate-fade-in" style={{ animationDelay: '0.25s' }}>
      <div className="flex items-center gap-2 mb-3">
        <Shield size={18} className="text-accent-primary" />
        <h3 className="text-base font-semibold text-text-primary">Prevention Recommendations</h3>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-bg-tertiary">
            <CheckCircle size={16} className="text-accent-secondary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-text-secondary">{item}</p>
          </div>
        ))}
      </div>

      {/* Additional Checks */}
      {analysis.additional_checks && analysis.additional_checks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border-default">
          <h4 className="text-sm font-medium text-text-secondary mb-2">Additional Checks</h4>
          <ul className="space-y-1.5">
            {analysis.additional_checks.map((check, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-tertiary">
                <span className="text-text-tertiary mt-1.5 w-1 h-1 rounded-full bg-text-tertiary flex-shrink-0" />
                {check}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
