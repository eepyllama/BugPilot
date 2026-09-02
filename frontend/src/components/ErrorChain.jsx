import { ArrowDown, AlertTriangle, Info } from 'lucide-react';

export default function ErrorChain({ analysis }) {
  const chain = analysis.error_chain;
  if (!chain || chain.length === 0) return null;

  return (
    <div className="panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-text-primary">Error Flow</h3>
        {analysis.error_chain_is_inferred && (
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary bg-bg-tertiary px-2 py-1 rounded">
            <Info size={12} />
            <span>Inferred from available evidence</span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center">
        {chain.map((step, i) => (
          <div key={i} className="w-full max-w-md">
            {/* Node */}
            <div className={`chain-node ${step.is_root_cause ? 'root-cause' : ''}`}>
              <div className="flex items-center gap-2">
                {step.is_root_cause && (
                  <AlertTriangle size={14} className="text-severity-high flex-shrink-0" />
                )}
                <span className="text-sm font-semibold text-text-primary">{step.step}</span>
              </div>
              <p className="text-xs text-text-secondary mt-1">{step.detail}</p>
              {step.is_root_cause && (
                <span className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-severity-high">
                  Root Cause
                </span>
              )}
            </div>

            {/* Connector */}
            {i < chain.length - 1 && (
              <div className="flex flex-col items-center py-1">
                <div className="chain-connector" />
                <ArrowDown size={14} className="text-text-tertiary -mt-1" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
