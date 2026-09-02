import { Gauge } from 'lucide-react';

export default function ConfidenceScore({ analysis }) {
  const { confidence, confidence_reasoning } = analysis;

  const getColor = () => {
    if (confidence >= 70) return 'var(--color-confidence-high)';
    if (confidence >= 40) return 'var(--color-confidence-medium)';
    return 'var(--color-confidence-low)';
  };

  const getLabel = () => {
    if (confidence >= 80) return 'High Confidence';
    if (confidence >= 60) return 'Moderate Confidence';
    if (confidence >= 40) return 'Low Confidence';
    return 'Very Low Confidence';
  };

  // SVG circular progress
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = (confidence / 100) * circumference;

  return (
    <div className="panel animate-fade-in" style={{ animationDelay: '0.3s' }}>
      <div className="flex items-center gap-2 mb-4">
        <Gauge size={18} className="text-text-secondary" />
        <h3 className="text-base font-semibold text-text-primary">Confidence Assessment</h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Circular gauge */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke="var(--color-bg-hover)"
              strokeWidth="8"
            />
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke={getColor()}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: getColor() }}>
              {confidence}%
            </span>
            <span className="text-[10px] text-text-tertiary uppercase tracking-wide">{getLabel()}</span>
          </div>
        </div>

        {/* Reasoning */}
        <div className="flex-1">
          {confidence_reasoning && (
            <p className="text-sm text-text-secondary leading-relaxed">
              {confidence_reasoning}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
