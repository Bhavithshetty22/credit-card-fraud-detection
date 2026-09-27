import { ExportCategory, ExportFormat, ReportConfig } from '../types/export';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Trigger backend export for specified data category and format
 */
export async function exportDatasetOrResults(category: ExportCategory, format: ExportFormat): Promise<Blob> {
  const response = await fetch(`${API_BASE}/export/${category}?format=${format}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Export service error: ${response.status} ${response.statusText}. Ensure the Python ML backend is running.`);
  }

  return response.blob();
}

/**
 * Trigger automated research report generation
 */
export async function generateResearchReport(config: ReportConfig): Promise<Blob> {
  const response = await fetch(`${API_BASE}/export/generate-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    throw new Error(`Report generation unavailable: ${response.statusText}`);
  }

  return response.blob();
}
