export type PageId =
  | 'dashboard'
  | 'dataset'
  | 'preprocessing'
  | 'genetic-algorithm'
  | 'pipeline-integrity'
  | 'model-laboratory'
  | 'model-comparison'
  | 'comparative-analysis'
  | 'evaluation'
  | 'fraud-detection'
  | 'single-transaction'
  | 'batch-detection'
  | 'explainability'
  | 'roc-auc'
  | 'research-results'
  | 'paper-reference'
  | 'paper-methodology'
  | 'paper-comparison'
  | 'export-center'
  | 'about-project'
  | 'presentation-mode'
  | 'card-shield'
  | 'settings';

export interface NavItem {
  id: PageId;
  label: string;
  iconName: string;
  badge?: string;
  isImplemented?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface MetricData {
  title: string;
  value: string | number;
  label: string;
  icon: string;
  subtext?: string;
  accent?: 'cyan' | 'rose' | 'emerald' | 'indigo';
}

export interface PipelineStage {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  status: 'completed' | 'active' | 'pending';
  highlight?: boolean;
}

export interface ClassifierInfo {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: string;
  status: 'Ready' | 'Configured' | 'Training';
  featureModes: ('Full Features' | 'GA Features' | 'Random Features')[];
}

export interface SystemStatusItem {
  name: string;
  status: 'Loaded' | 'Ready' | 'Available' | 'Pending' | 'Optimal';
  color: 'emerald' | 'cyan' | 'amber' | 'blue';
  detail?: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  timestamp: string;
  type: 'artifact' | 'dataset' | 'system' | 'model';
  status: 'success' | 'info' | 'ready';
}

export * from './dataset';
export * from './preprocessing';
export * from './pipeline';
export * from './ga';
export * from './models';
export * from './evaluation';
export * from './comparison';
export * from './fraudDetection';
export * from './explainability';
export * from './results';
export * from './paper';
export * from './export';
export * from './presentation';
