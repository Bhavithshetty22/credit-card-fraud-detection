import React from 'react';
import { LineChart } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';
import { PageId } from '../types';

interface RocAnalysisPageProps {
  onNavigate: (page: PageId) => void;
}

export const RocAnalysisPage: React.FC<RocAnalysisPageProps> = ({ onNavigate }) => {
  return (
    <EmptyState
      icon={LineChart}
      moduleName="ROC Curves & Precision-Recall Analysis"
      moduleCode="ANALYSIS 02 • THRESHOLD METRICS"
      description="Receiver Operating Characteristic (ROC) and Precision-Recall (PR) threshold curves comparing classifier sensitivity under extreme class imbalance conditions."
      plannedFeatures={[
        'Interactive multi-model ROC Curve overlay (TPR vs FPR) with Area Under Curve (ROC-AUC) rankings',
        'Precision-Recall (PR) Curve overlay with Average Precision (AP) scores (crucial for 0.172% fraud distribution)',
        'Decision threshold slider dynamically updating sensitivity, specificity, and false alert rate',
        'Iso-F1 contour curves indicating optimal operating thresholds for each classifier',
        'Comparative table of AUC scores across Full Features vs GA-selected feature subsets',
      ]}
      paperReference="Precision-Recall curves are widely considered more informative than standard ROC curves when evaluating binary classifiers on severe class imbalance."
      onNavigateHome={() => onNavigate('dashboard')}
    />
  );
};
