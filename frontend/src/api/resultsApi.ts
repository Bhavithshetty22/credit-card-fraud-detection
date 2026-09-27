import { ResearchResultsOverview, GARunResult, ClassifierResultGroup } from '../types/results';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export async function getResearchOverview(): Promise<ResearchResultsOverview> {
  try {
    const response = await fetch(`${API_BASE}/results/overview`);
    if (!response.ok) {
      return {
        datasetValidated: true,
        gaOptimized: false,
        experimentsCompletedCount: 0,
        totalExperiments: 15,
        evaluationFinalized: false,
        backendConnected: false,
      };
    }
    return response.json();
  } catch {
    return {
      datasetValidated: true,
      gaOptimized: false,
      experimentsCompletedCount: 0,
      totalExperiments: 15,
      evaluationFinalized: false,
      backendConnected: false,
    };
  }
}

export async function getFinalGAResults(): Promise<GARunResult> {
  const response = await fetch(`${API_BASE}/results/ga`);
  if (!response.ok) {
    throw new Error(`GA results unavailable: ${response.statusText}`);
  }
  return response.json();
}

export async function getAllClassifierResults(): Promise<ClassifierResultGroup[]> {
  const response = await fetch(`${API_BASE}/results/classifiers`);
  if (!response.ok) {
    throw new Error(`Classifier results unavailable: ${response.statusText}`);
  }
  return response.json();
}
