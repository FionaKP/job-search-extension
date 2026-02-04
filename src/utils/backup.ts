import { Posting, Connection, AppSettings, V1Application } from '@/types';
import { getPostings, savePostings, getConnections, saveConnections, getSettings } from '@/services/storage';
import { migrateV1ToV2 } from '@/services/migration';

// ============ Types ============

export interface BackupData {
  version: 2;
  exportDate: string;
  postings: Posting[];
  connections: Connection[];
  settings: AppSettings;
}

export interface ImportResult {
  success: boolean;
  postings: number;
  connections: number;
  errors: string[];
  skipped: number;
}

export interface ParsedBackupFile {
  success: boolean;
  data: BackupData | null;
  fileName: string;
  error?: string;
}

// ============ Export ============

/**
 * Creates a BackupData object from current storage
 */
export async function createBackupData(): Promise<BackupData> {
  const [postings, connections, settings] = await Promise.all([
    getPostings(),
    getConnections(),
    getSettings(),
  ]);

  return {
    version: 2,
    exportDate: new Date().toISOString(),
    postings,
    connections,
    settings,
  };
}

/**
 * Exports all data to a downloadable JSON file
 */
export async function exportData(): Promise<void> {
  const data = await createBackupData();

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `jobflow-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

// ============ Import ============

/**
 * Parses a backup file and validates its structure
 * Does NOT save to storage - use importData for that
 */
export async function parseBackupFile(file: File): Promise<ParsedBackupFile> {
  try {
    const text = await file.text();
    const rawData = JSON.parse(text);

    // Check if it's V1 format and needs migration
    let data: BackupData;
    if (rawData.version === 1 || !rawData.version) {
      // Attempt V1 migration
      const v1Postings = rawData.postings || rawData.applications || [];
      const migratedPostings = migrateV1ToV2(v1Postings as V1Application[]);
      data = {
        version: 2,
        exportDate: rawData.exportDate || new Date().toISOString(),
        postings: migratedPostings,
        connections: rawData.connections || [],
        settings: rawData.settings || { defaultView: 'kanban', theme: 'light' },
      };
    } else {
      data = rawData as BackupData;
    }

    // Validate postings array exists
    if (!Array.isArray(data.postings)) {
      return {
        success: false,
        data: null,
        fileName: file.name,
        error: 'Invalid file format: missing postings array',
      };
    }

    return {
      success: true,
      data,
      fileName: file.name,
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      fileName: file.name,
      error: err instanceof Error ? err.message : 'Failed to parse JSON file',
    };
  }
}

/**
 * Validates a posting has required fields
 */
function isValidPosting(posting: unknown): posting is Posting {
  if (typeof posting !== 'object' || posting === null) {
    return false;
  }
  const p = posting as Record<string, unknown>;
  return (
    typeof p.id === 'string' &&
    typeof p.title === 'string' &&
    typeof p.company === 'string' &&
    typeof p.url === 'string' &&
    p.id.length > 0 &&
    p.title.length > 0
  );
}

/**
 * Merges imported postings with existing ones
 * Import wins if newer (based on dateModified) or if doesn't exist
 */
export function mergePostings(existing: Posting[], imported: Posting[]): Posting[] {
  const map = new Map(existing.map((p) => [p.id, p]));

  for (const p of imported) {
    const current = map.get(p.id);
    // Import wins if newer, or if doesn't exist
    if (!current || p.dateModified > current.dateModified) {
      map.set(p.id, p);
    }
  }

  return Array.from(map.values());
}

/**
 * Merges imported connections with existing ones
 * Simple merge: import wins if same ID
 */
export function mergeConnections(existing: Connection[], imported: Connection[]): Connection[] {
  const map = new Map(existing.map((c) => [c.id, c]));

  for (const c of imported) {
    map.set(c.id, c);
  }

  return Array.from(map.values());
}

/**
 * Imports data from a parsed backup file into storage
 * Uses merge strategy: adds new items, updates existing if newer
 */
export async function importData(backupData: BackupData): Promise<ImportResult> {
  const errors: string[] = [];
  let skipped = 0;

  // Validate and filter postings
  const validPostings: Posting[] = [];
  for (let i = 0; i < backupData.postings.length; i++) {
    const posting = backupData.postings[i];
    if (isValidPosting(posting)) {
      // Ensure all required fields have defaults
      validPostings.push({
        ...posting,
        status: posting.status || 'saved',
        priority: posting.priority || 2,
        tags: posting.tags || [],
        notes: posting.notes || '',
        dateAdded: posting.dateAdded || Date.now(),
        dateModified: posting.dateModified || Date.now(),
        connectionIds: posting.connectionIds || [],
      });
    } else {
      errors.push(`Posting ${i + 1}: missing required field (id or title)`);
      skipped++;
    }
  }

  // Get existing data
  const [existingPostings, existingConnections] = await Promise.all([
    getPostings(),
    getConnections(),
  ]);

  // Merge data
  const mergedPostings = mergePostings(existingPostings, validPostings);
  const mergedConnections = mergeConnections(existingConnections, backupData.connections || []);

  // Save merged data
  await Promise.all([
    savePostings(mergedPostings),
    saveConnections(mergedConnections),
  ]);

  return {
    success: errors.length === 0,
    postings: validPostings.length,
    connections: backupData.connections?.length || 0,
    errors,
    skipped,
  };
}

/**
 * Opens file picker and returns the selected file
 */
export function promptForFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      resolve(file || null);
    };

    // Handle cancel
    input.addEventListener('cancel', () => resolve(null));

    input.click();
  });
}
