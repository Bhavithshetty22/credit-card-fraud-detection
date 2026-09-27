import React from 'react';
import { GitCompare } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';
import { PageId } from '../types';

interface PaperComparisonPageProps {
  onNavigate: (page: PageId) => void;
}

export const PaperComparisonPage: React.FC<PaperComparisonPageProps> = ({ onNavigate }) => {
  return (
    <EmptyState
      icon={GitCompare}
      moduleName="Paper vs Implementation Benchmark"
      moduleCode="REFERENCE 02 • REPRODUCIBILITY AUDIT"
      description="Systematic audit comparing the original published literature findings against our zero-leakage, rigorously validated Python implementation."
      plannedFeatures={[
        'Published paper reported metrics side-by-side with our empirical pipeline outcomes',
        'Detailed documentation of methodological improvements (zero-leakage sub-split validation, strict SMOTE train-only protocol)',
        'Discussion of discrepancies and computational reproduction factors',
        'Hardware and environmental reproducibility profile',
        'Peer-review reproducibility checklist',
      ]}
      paperReference="Our implementation maintains clear separation between published literature claims and verified local serialized experimental artifacts."
      onNavigateHome={() => onNavigate('dashboard')}
    />
  );
};
