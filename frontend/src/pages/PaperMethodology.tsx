import React from 'react';
import { BookOpen } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';
import { PageId } from '../types';

interface PaperMethodologyPageProps {
  onNavigate: (page: PageId) => void;
}

export const PaperMethodologyPage: React.FC<PaperMethodologyPageProps> = ({ onNavigate }) => {
  return (
    <EmptyState
      icon={BookOpen}
      moduleName="Reference Paper Methodology"
      moduleCode="REFERENCE 01 • METHODOLOGY GUIDE"
      description="Detailed technical breakdown of the published research paper titled 'A Machine Learning Based Credit Card Fraud Detection Using the GA Algorithm for Feature Selection'."
      plannedFeatures={[
        'Full summary of the original paper architecture, hypotheses, and experimental design',
        'Mathematical formulation of the Genetic Algorithm fitness function and genetic operators',
        'Theoretical motivation for combining SMOTE minority balancing with evolutionary feature selection',
        'Overview of the 5 baseline machine learning classifiers explored in the literature',
        'Citation metadata and academic bibliography references',
      ]}
      paperReference="Reference Study: 'A Machine Learning Based Credit Card Fraud Detection Using the GA Algorithm for Feature Selection'."
      onNavigateHome={() => onNavigate('dashboard')}
    />
  );
};
