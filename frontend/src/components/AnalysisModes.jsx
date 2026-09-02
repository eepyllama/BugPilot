import { Zap, Search, GraduationCap } from 'lucide-react';

const MODES = [
  {
    id: 'quick',
    label: 'Quick Fix',
    description: 'Fast diagnosis and fix',
    icon: Zap,
  },
  {
    id: 'deep',
    label: 'Deep Analysis',
    description: 'Root cause, chain, code, fix, prevention',
    icon: Search,
  },
  {
    id: 'beginner',
    label: 'Explain for Beginners',
    description: 'No jargon, step-by-step',
    icon: GraduationCap,
  },
];

export default function AnalysisModes({ mode, onModeChange, provider = 'llama-70b', onProviderChange }) {
  return (
    <div className="space-y-6">
      {/* Analysis Mode Selection */}
      <div>
        <label className="text-sm font-medium text-text-secondary mb-2 block">
          Analysis Mode
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                className={`mode-card ${mode === m.id ? 'active' : ''}`}
                onClick={() => onModeChange(m.id)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={16} className={mode === m.id ? 'text-accent-primary' : 'text-text-tertiary'} />
                  <span className="text-sm font-semibold text-text-primary">{m.label}</span>
                </div>
                <p className="text-xs text-text-tertiary">{m.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Model Provider Selection */}
      {onProviderChange && (
        <div>
          <label className="text-sm font-medium text-text-secondary mb-2 block">
            AI Provider / Model
          </label>
          <div className="flex gap-3">
            <button
              className={`px-4 py-2 rounded-md border text-sm font-semibold transition-colors ${provider === 'llama-70b' ? 'bg-accent-primary border-accent-primary text-white' : 'bg-bg-secondary border-border-primary text-text-secondary hover:border-text-tertiary'}`}
              onClick={() => onProviderChange('llama-70b')}
            >
              LLaMA 3.1 8B (Groq)
            </button>
            <button
              className={`px-4 py-2 rounded-md border text-sm font-semibold transition-colors ${provider === 'llama-8b' ? 'bg-accent-primary border-accent-primary text-white' : 'bg-bg-secondary border-border-primary text-text-secondary hover:border-text-tertiary'}`}
              onClick={() => onProviderChange('llama-8b')}
            >
              Qwen 2.5 Coder (OpenRouter)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
