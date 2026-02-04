import { Posting, Connection } from '@/types';

interface ExportData {
  exportDate: string;
  version: number;
  postings: Posting[];
  connections: Connection[];
}

/**
 * Exports postings and connections to a downloadable JSON file
 */
export function exportDataToFile(postings: Posting[], connections: Connection[] = []): void {
  const data: ExportData = {
    exportDate: new Date().toISOString(),
    version: 2,
    postings,
    connections,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `jobflow-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * Validates that imported data has the expected structure
 */
function validateImportData(data: unknown): data is ExportData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.postings)) {
    return false;
  }

  // Validate each posting has required fields
  for (const posting of obj.postings) {
    if (typeof posting !== 'object' || posting === null) {
      return false;
    }
    const p = posting as Record<string, unknown>;
    if (
      typeof p.id !== 'string' ||
      typeof p.title !== 'string' ||
      typeof p.company !== 'string' ||
      typeof p.url !== 'string'
    ) {
      return false;
    }
  }

  return true;
}

export interface ImportResult {
  success: boolean;
  postings: Posting[];
  connections: Connection[];
  error?: string;
}

/**
 * Imports data from a JSON file
 * Returns the parsed postings and connections
 */
export function importDataFromFile(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (typeof content !== 'string') {
          resolve({ success: false, postings: [], connections: [], error: 'Failed to read file' });
          return;
        }

        const data = JSON.parse(content);

        if (!validateImportData(data)) {
          resolve({
            success: false,
            postings: [],
            connections: [],
            error: 'Invalid file format. Expected JobFlow export file.',
          });
          return;
        }

        resolve({
          success: true,
          postings: data.postings,
          connections: data.connections || [],
        });
      } catch {
        resolve({
          success: false,
          postings: [],
          connections: [],
          error: 'Failed to parse JSON file',
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, postings: [], connections: [], error: 'Failed to read file' });
    };

    reader.readAsText(file);
  });
}

/**
 * Triggers a file input dialog for importing data
 * Returns a promise that resolves with the import result
 */
export function promptImportFile(): Promise<ImportResult> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve({ success: false, postings: [], connections: [], error: 'No file selected' });
        return;
      }

      const result = await importDataFromFile(file);
      resolve(result);
    };

    input.click();
  });
}
