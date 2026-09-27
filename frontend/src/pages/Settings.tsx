import React from 'react';
import { Settings } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';
import { PageId } from '../types';

interface SettingsPageProps {
  onNavigate: (page: PageId) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  return (
    <EmptyState
      icon={Settings}
      moduleName="Platform & ML Backend Settings"
      moduleCode="CONFIG • ENVIRONMENT SETTINGS"
      description="Configuration parameters for local Python ML backend connectivity, artifact caching paths, classification threshold defaults, and research reporting preferences."
      plannedFeatures={[
        'Python FastAPI / Flask backend endpoint URL configuration',
        'Model artifact directory path selector (models/ and models/trained/)',
        'Inference classification threshold fine-tuning defaults (default 0.50)',
        'Theme and UI display preferences (Dark-first high contrast mode)',
        'Export formats configuration (LaTeX, Markdown, CSV, JSON)',
      ]}
      paperReference="Configurable pipeline parameters ensure flexible deployment across academic research and production testing environments."
      onNavigateHome={() => onNavigate('dashboard')}
    />
  );
};
