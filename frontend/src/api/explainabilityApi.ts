import { FeatureImportanceItem, LocalExplanationData, ExplainabilityStatus } from '../types/explainability';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Fetch local explainability (feature attribution) for a given transaction and model
 */
export async function getLocalExplanation(
  transactionFeatures: Record<string, number>,
  classifier: string,
  featureStrategy: string
): Promise<LocalExplanationData> {
  const response = await fetch(`${API_BASE}/explainability/local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      features: transactionFeatures,
      classifier,
      feature_strategy: featureStrategy,
    }),
  });

  if (!response.ok) {
    throw new Error(`Explainability service error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch global feature importances for a trained classifier
 */
export async function getGlobalFeatureImportance(
  classifier: string,
  featureStrategy: string
): Promise<FeatureImportanceItem[]> {
  const response = await fetch(
    `${API_BASE}/explainability/global?classifier=${encodeURIComponent(classifier)}&strategy=${encodeURIComponent(featureStrategy)}`
  );

  if (!response.ok) {
    throw new Error(`Global explainability unavailable: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Check explainability engine status
 */
export async function getExplainabilityEngineStatus(): Promise<ExplainabilityStatus> {
  try {
    const response = await fetch(`${API_BASE}/explainability/status`);
    if (!response.ok) {
      return {
        isAvailable: false,
        engine: 'SHAP / TreeExplainer',
        supportedMethods: ['Tree Feature Importance', 'Permutation Importance', 'SHAP (Kernel/Tree)', 'LIME'],
        statusMessage: 'Awaiting Explainability Backend Connection',
      };
    }
    return response.json();
  } catch {
    return {
      isAvailable: false,
      engine: 'SHAP / TreeExplainer',
      supportedMethods: ['Tree Feature Importance', 'Permutation Importance', 'SHAP (Kernel/Tree)', 'LIME'],
      statusMessage: 'Awaiting Explainability Backend Connection',
    };
  }
}
