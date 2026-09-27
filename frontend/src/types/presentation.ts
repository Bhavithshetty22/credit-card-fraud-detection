export interface PresentationStep {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  keyPoints: string[];
  vivaChecklist: string[];
  defaultSpeakerNotes: {
    whatToExplain: string;
    researchContribution: string;
    vivaDefenseTips: string;
    backendIntegrationNote: string;
  };
}

export interface DemoChecklistItem {
  id: string;
  label: string;
  stage: string;
  isReady: boolean;
  statusText: string;
}
