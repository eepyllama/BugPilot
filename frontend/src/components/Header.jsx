import { Bug, Plus, History } from 'lucide-react';

export default function Header({ view, onNewAnalysis, onViewHistory }) {
  return (
    <header className="border-b border-border-default bg-bg-secondary/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={onNewAnalysis}>
            <div className="w-9 h-9 rounded-lg bg-accent-primary flex items-center justify-center">
              <Bug size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-primary leading-none">BugPilot</h1>
              <p className="text-[11px] text-text-tertiary leading-none mt-0.5">AI Debugging Assistant</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              className={`btn-ghost ${view === 'input' ? 'text-text-primary bg-bg-hover' : ''}`}
              onClick={onNewAnalysis}
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New Analysis</span>
            </button>
            <button
              className={`btn-ghost ${view === 'history' ? 'text-text-primary bg-bg-hover' : ''}`}
              onClick={onViewHistory}
            >
              <History size={16} />
              <span className="hidden sm:inline">History</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
