export interface IntegrityCheckItem {
  checkNumber: string;
  title: string;
  statusText: string;
  statusType: 'PASS' | 'PENDING' | 'WARN';
  category: 'Configuration' | 'Architecture' | 'Validation';
  details: string;
  methodologyNote: string;
  verifiedArtifact?: string;
}

export interface PipelineIntegrityStatus {
  overallStatus: 'READY FOR EVALUATION' | 'PENDING BACKEND VALIDATION';
  stateCategory: 'PASS' | 'PENDING';
  totalChecks: number;
  passedChecks: number;
  pendingChecks: number;
  checks: IntegrityCheckItem[];
}
