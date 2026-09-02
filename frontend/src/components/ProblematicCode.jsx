import { FileCode, AlertCircle } from 'lucide-react';

export default function ProblematicCode({ analysis }) {
  if (!analysis.problematic_code) return null;

  const lines = analysis.problematic_code.split('\n');

  return (
    <div className="panel animate-fade-in" style={{ animationDelay: '0.15s' }}>
      <div className="flex items-center gap-2 mb-3">
        <FileCode size={18} className="text-severity-high" />
        <h3 className="text-base font-semibold text-text-primary">Problematic Code</h3>
      </div>

      <div className="code-block relative">
        <div className="space-y-0">
          {lines.map((line, i) => {
            // Detect lines marked with ← or // problem or similar comment markers
            const isProblematic = line.includes('←') || line.includes('// problem') ||
                                  line.includes('# problem') || line.includes('NPE') ||
                                  line.includes('Crashes here') || line.includes('null dereference');
            return (
              <div
                key={i}
                className={`flex ${isProblematic ? 'bg-severity-high/10 -mx-4 px-4 border-l-2 border-severity-high' : ''}`}
              >
                <span className="text-text-tertiary select-none w-8 flex-shrink-0 text-right mr-4 text-xs leading-[1.7]">
                  {i + 1}
                </span>
                <span className={isProblematic ? 'text-severity-high' : ''}>
                  {line}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {analysis.problematic_line_explanation && (
        <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-severity-high/5 border border-severity-high/15">
          <AlertCircle size={14} className="text-severity-high mt-0.5 flex-shrink-0" />
          <p className="text-sm text-text-secondary">
            {analysis.problematic_line_explanation}
          </p>
        </div>
      )}
    </div>
  );
}
