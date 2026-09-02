import { useEffect, useState } from 'react';
import { Search, Code, Wrench, Shield, CheckCircle } from 'lucide-react';

const STEPS = [
  { icon: Search, label: 'Parsing error message...' },
  { icon: Code, label: 'Analyzing source code...' },
  { icon: Wrench, label: 'Identifying root cause...' },
  { icon: Shield, label: 'Generating fix and recommendations...' },
  { icon: CheckCircle, label: 'Building report...' },
];

export default function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="panel max-w-lg mx-auto text-center py-12 animate-fade-in">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-primary/10 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
      </div>

      <h3 className="text-lg font-semibold text-text-primary mb-2">
        Analyzing your bug...
      </h3>
      <p className="text-sm text-text-tertiary mb-8">
        BugPilot is running the AI debugging pipeline.
      </p>

      <div className="space-y-3 text-left max-w-xs mx-auto">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === currentStep;
          const isDone = i < currentStep;

          return (
            <div
              key={i}
              className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                isDone
                  ? 'text-accent-secondary'
                  : isActive
                  ? 'text-accent-primary'
                  : 'text-text-tertiary'
              }`}
            >
              <Icon size={16} className={isActive ? 'animate-pulse' : ''} />
              <span className={isDone ? 'line-through opacity-60' : ''}>
                {step.label}
              </span>
              {isDone && <CheckCircle size={14} className="ml-auto text-accent-secondary" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
