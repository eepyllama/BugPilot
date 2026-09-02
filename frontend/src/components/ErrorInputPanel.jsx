import { useState } from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';
import AnalysisModes from './AnalysisModes';
import ExampleBugs from './ExampleBugs';
import { EXAMPLE_BUGS } from '../utils/mockData';

const LANGUAGES = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Other',
];

const TABS = [
  { id: 'error', label: 'Error / Stack Trace' },
  { id: 'code', label: 'Source Code' },
  { id: 'logs', label: 'Logs' },
];

export default function ErrorInputPanel({ onAnalyze, loading }) {
  const [activeTab, setActiveTab] = useState('error');
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [logs, setLogs] = useState('');
  const [language, setLanguage] = useState('Python');
  const [context, setContext] = useState('');
  const [mode, setMode] = useState('deep');
  const [provider, setProvider] = useState('llama-70b'); // NEW: Added provider state
  const [validationError, setValidationError] = useState('');

  const handleSelectExample = (example) => {
    setError(example.error);
    setCode(example.code);
    setLogs(example.logs || '');
    setLanguage(example.language);
    setContext(example.context || '');
    setActiveTab('error');
    setValidationError('');
  };

  const handleSubmit = () => {
    if (!error.trim()) {
      setValidationError('Please provide an error message or stack trace.');
      setActiveTab('error');
      return;
    }
    setValidationError('');
    // NEW: Include provider in the payload sent to the backend
    onAnalyze({ error, code, logs, language, context, mode, provider });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="text-center py-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Turn confusing errors into actionable fixes.
        </h2>
        <p className="text-text-secondary text-sm sm:text-base max-w-xl mx-auto">
          Paste your error, add context, and let AI identify the root cause and generate a fix.
        </p>
      </div>

      {/* Examples */}
      <ExampleBugs examples={EXAMPLE_BUGS} onSelectExample={handleSelectExample} />

      {/* Input Panel */}
      <div className="panel">
        {/* Tabs */}
        <div className="tab-group">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.id === 'error' && <span className="text-severity-high ml-1">*</span>}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[180px]">
          {activeTab === 'error' && (
            <textarea
              className="code-editor"
              rows={8}
              placeholder={`Type or paste your error here...\n\nExample:\nNullPointerException: Cannot invoke "User.getName()"\n  at UserService.getProfile(UserService.java:142)\n  at UserController.profile(UserController.java:58)`}
              value={error}
              onChange={(e) => {
                setError(e.target.value);
                if (validationError) setValidationError('');
              }}
            />
          )}
          {activeTab === 'code' && (
            <textarea
              className="code-editor"
              rows={8}
              placeholder="Paste the relevant source code here (optional)..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          )}
          {activeTab === 'logs' && (
            <textarea
              className="code-editor"
              rows={8}
              placeholder="Paste application logs here (optional)..."
              value={logs}
              onChange={(e) => setLogs(e.target.value)}
            />
          )}
        </div>

        {/* Language + Context Row */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block">
              Language
            </label>
            <select
              className="select-input w-full"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block">
              Additional Context <span className="text-text-tertiary">(optional)</span>
            </label>
            <input
              type="text"
              className="code-editor !min-h-0 !resize-none"
              style={{ padding: '10px 12px', fontFamily: 'var(--font-sans)', fontSize: '14px' }}
              placeholder="What were you trying to do when this error occurred?"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>
        </div>

        {/* Mode Selector */}
        <div className="mt-4">
          {/* NEW: Passed provider and onProviderChange down to AnalysisModes */}
          <AnalysisModes
            mode={mode}
            onModeChange={setMode}
            provider={provider}
            onProviderChange={setProvider}
          />
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="mt-4 flex items-center gap-2 text-severity-high text-sm">
            <AlertCircle size={16} />
            {validationError}
          </div>
        )}

        {/* Submit */}
        <div className="mt-6 flex justify-end">
          <button
            className="btn-primary text-base px-6 py-3"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze Bug
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
