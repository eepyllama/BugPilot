import { Play } from 'lucide-react';

export default function ExampleBugs({ examples, onSelectExample }) {
  return (
    <div className="panel">
      <h3 className="text-sm font-semibold text-text-secondary mb-3">Try an Example</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {examples.map((ex) => (
          <button
            key={ex.id}
            className="group text-left p-3 rounded-lg border border-border-default bg-bg-tertiary
                       hover:border-accent-primary/50 hover:bg-bg-hover transition-all duration-200"
            onClick={() => onSelectExample(ex)}
          >
            <div className="text-xl mb-2">{ex.icon}</div>
            <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary-hover transition-colors">
              {ex.title}
            </p>
            <p className="text-xs text-text-tertiary mt-0.5">{ex.language}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-text-tertiary group-hover:text-accent-primary transition-colors">
              <Play size={10} />
              <span>Load example</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
