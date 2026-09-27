import { useState, useEffect } from 'react';
import { PageId } from './types';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { DatasetPage } from './pages/Dataset';
import { PreprocessingPage } from './pages/Preprocessing';
import { GeneticAlgorithmPage } from './pages/GeneticAlgorithm';
import { PipelineIntegrityPage } from './pages/PipelineIntegrity';
import { ModelLaboratoryPage } from './pages/ModelLaboratory';
import { ModelComparisonPage } from './pages/ModelComparison';
import { ComparativeAnalysisPage } from './pages/ComparativeAnalysis';
import { EvaluationPage } from './pages/Evaluation';
import { FraudDetectionPage } from './pages/FraudDetection';
import { StatementCheckPage } from './pages/StatementCheck';
import { BatchDetectionPage } from './pages/BatchDetection';
import { ExplainabilityPage } from './pages/Explainability';
import { RocAnalysisPage } from './pages/RocAnalysis';
import { ResearchResultsPage } from './pages/ResearchResults';
import { PaperReferencePage } from './pages/PaperReference';
import { PaperMethodologyPage } from './pages/PaperMethodology';
import { PaperComparisonPage } from './pages/PaperComparison';
import { ExportCenterPage } from './pages/ExportCenter';
import { AboutProjectPage } from './pages/AboutProject';
import { PresentationModePage } from './pages/PresentationMode';
import { SettingsPage } from './pages/Settings';

import { CardShieldPage } from './pages/CardShield';

export function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'batch-detection':
        return <StatementCheckPage onNavigate={setCurrentPage} />;
      case 'fraud-detection':
        return <FraudDetectionPage onNavigate={setCurrentPage} />;
      case 'explainability':
        return <ExplainabilityPage onNavigate={setCurrentPage} />;
      case 'card-shield':
        return <CardShieldPage onNavigate={setCurrentPage} />;
      case 'dataset':
      case 'preprocessing':
        return <DatasetPage onNavigate={setCurrentPage} initialSubTab={currentPage === 'preprocessing' ? 'preprocessing' : 'overview'} />;
      case 'genetic-algorithm':
        return <GeneticAlgorithmPage onNavigate={setCurrentPage} />;
      case 'model-comparison':
      case 'comparative-analysis':
      case 'model-laboratory':
      case 'evaluation':
        return <ModelComparisonPage onNavigate={setCurrentPage} />;
      case 'pipeline-integrity':
        return <PipelineIntegrityPage onNavigate={setCurrentPage} />;
      case 'about-project':
      case 'paper-reference':
      case 'paper-methodology':
      case 'paper-comparison':
        return <AboutProjectPage onNavigate={setCurrentPage} />;
      case 'presentation-mode':
        return <PresentationModePage onNavigate={setCurrentPage} />;
      case 'export-center':
        return <ExportCenterPage onNavigate={setCurrentPage} />;
      case 'settings':
        return <SettingsPage onNavigate={setCurrentPage} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <AppLayout currentPage={currentPage} onSelectPage={setCurrentPage}>
      {renderPageContent()}
    </AppLayout>
  );
}

export default App;
