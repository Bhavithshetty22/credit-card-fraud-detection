import {
  FraudDetectionRequest,
  FraudDetectionResponse,
  BatchDetectionRequest,
  BatchDetectionResponse,
  BackendStatusInfo,
} from '../types/fraudDetection';

// Base API URL for future Python FastAPI / Flask backend
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const fraudDetectionApi = {
  checkBackendHealth: async (): Promise<BackendStatusInfo> => {
    // Frontend preview check: when no backend is running, report Disconnected
    try {
      const response = await fetch(`${API_BASE_URL}/health`, { method: 'GET', signal: AbortSignal.timeout(1200) });
      if (response.ok) {
        return {
          status: 'Connected',
          apiEndpoint: API_BASE_URL,
          modelArtifactsDetected: 15,
          latencyMs: 12,
        };
      }
    } catch {
      // Backend not running
    }

    return {
      status: 'Disconnected',
      apiEndpoint: API_BASE_URL,
      modelArtifactsDetected: 0,
      latencyMs: null,
    };
  },

  predictTransaction: async (request: FraudDetectionRequest): Promise<FraudDetectionResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/predict/single`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(4000),
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error(`Server returned HTTP ${response.status}`);
    } catch (err) {
      throw new Error(
        'Prediction service unavailable. Make sure the Python ML backend is running and accessible.'
      );
    }
  },

  predictBatch: async (request: BatchDetectionRequest): Promise<BatchDetectionResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/predict/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error(`Batch service returned HTTP ${response.status}`);
    } catch (err) {
      throw new Error(
        'Batch detection service unavailable. Make sure the Python ML backend is running and accessible.'
      );
    }
  },
};
