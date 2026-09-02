import { ArrowLeft } from 'lucide-react';
import BugOverview from './BugOverview';
import RootCause from './RootCause';
import ErrorChain from './ErrorChain';
import ProblematicCode from './ProblematicCode';
import SuggestedFix from './SuggestedFix';
import Prevention from './Prevention';
import ConfidenceScore from './ConfidenceScore';

export default function AnalysisResults({ analysis, onBack }) {
  if (!analysis) return null;

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <button
        className="btn-ghost mb-4"
        onClick={onBack}
      >
        <ArrowLeft size={16} />
        New Analysis
      </button>

      {/* Results grid */}
      <div className="space-y-4">
        <BugOverview analysis={analysis} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RootCause analysis={analysis} />
          <ErrorChain analysis={analysis} />
        </div>

        <ProblematicCode analysis={analysis} />
        <SuggestedFix analysis={analysis} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Prevention analysis={analysis} />
          <ConfidenceScore analysis={analysis} />
        </div>
      </div>
    </div>
  );
}
