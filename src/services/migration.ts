import { V1Application, Posting, Connection } from '@/types';
import { getSchemaVersion, setSchemaVersion, savePostings, getConnections, saveConnections } from './storage';

const CURRENT_SCHEMA_VERSION = 3;

// V1 storage keys to check
const V1_STORAGE_KEYS = ['jobApplications', 'applications'];

/**
 * Run migration if needed on app startup
 */
export async function runMigrationIfNeeded(): Promise<void> {
  const currentVersion = await getSchemaVersion();

  // Already at current version
  if (currentVersion >= CURRENT_SCHEMA_VERSION) {
    return;
  }

  console.log(`[Migration] Current schema version: ${currentVersion}, target: ${CURRENT_SCHEMA_VERSION}`);

  // Check for V1 data under various possible keys
  const result = await chrome.storage.local.get([...V1_STORAGE_KEYS, 'postings']);

  // Find V1 data
  let v1Data: V1Application[] = [];
  let foundKey = '';

  for (const key of V1_STORAGE_KEYS) {
    if (result[key] && Array.isArray(result[key]) && result[key].length > 0) {
      v1Data = result[key];
      foundKey = key;
      break;
    }
  }

  if (v1Data.length > 0) {
    console.log(`[Migration] Found ${v1Data.length} V1 postings under key: ${foundKey}`);

    // Migrate V1 to V2
    const migratedPostings = migrateV1ToV2(v1Data);

    // Merge with any existing V2 postings (avoid duplicates by URL)
    const existingPostings = result.postings || [];
    const existingUrls = new Set(existingPostings.map((p: Posting) => p.url));
    const newPostings = migratedPostings.filter((p) => !existingUrls.has(p.url));
    const merged = [...existingPostings, ...newPostings];

    // Save migrated data
    await savePostings(merged);

    // Backup V1 data
    await chrome.storage.local.set({ _v1_backup: v1Data });

    console.log(`[Migration] Migrated ${newPostings.length} new postings, ${migratedPostings.length - newPostings.length} duplicates skipped`);
  }

  // Migrate connections from V2 to V3 (add new fields)
  if (currentVersion < 3) {
    await migrateConnectionsToV3();
  }

  // Set schema version
  await setSchemaVersion(CURRENT_SCHEMA_VERSION);
  console.log(`[Migration] Schema version updated to ${CURRENT_SCHEMA_VERSION}`);
}

/**
 * Migrate connections to V3 schema (add new fields with defaults)
 */
async function migrateConnectionsToV3(): Promise<void> {
  const connections = await getConnections();

  if (connections.length === 0) {
    console.log('[Migration] No connections to migrate');
    return;
  }

  const migratedConnections = connections.map((c: Connection & { relationshipNotes?: string }) => ({
    ...c,
    // Add new fields with defaults if they don't exist
    email: c.email || undefined,
    linkedInUrl: c.linkedInUrl || undefined,
    relationshipType: c.relationshipType || 'other',
    howWeMet: c.howWeMet || undefined,
    relationshipStrength: c.relationshipStrength || 2,
    notes: c.notes || c.relationshipNotes || '', // Migrate old relationshipNotes to notes
    contactHistory: c.contactHistory || [],
    dateAdded: c.dateAdded || Date.now(),
    dateModified: c.dateModified || Date.now(),
  }));

  await saveConnections(migratedConnections as Connection[]);
  console.log(`[Migration] Migrated ${migratedConnections.length} connections to V3 schema`);
}

/**
 * Convert V1 applications to V2 postings
 */
export function migrateV1ToV2(v1Data: V1Application[]): Posting[] {
  return v1Data.map((v1) => ({
    id: v1.id,
    url: v1.url,
    company: v1.company,
    companyLogo: undefined,
    title: v1.title,
    location: v1.location,
    description: v1.description,
    salary: v1.salary,
    status: mapV1Status(v1.status),
    interest: mapV1InterestToInterest(v1.interest),
    tags: v1.tags || [],
    notes: v1.notes || '',
    dateAdded: parseTimestamp(v1.dateAdded),
    dateModified: parseTimestamp(v1.dateAdded),
    dateApplied: v1.dateApplied ? parseTimestamp(v1.dateApplied) : undefined,
    nextActionDate: undefined,
    connectionIds: [],
  }));
}

/**
 * Map V1 status to V2 status (V1 statuses are a subset of V2)
 */
function mapV1Status(status: V1Application['status']): Posting['status'] {
  // V1 statuses: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn'
  // These all exist in V2, so direct mapping works
  return status;
}

/**
 * Map V1 interest (0-5) to new interest scale (1-5)
 */
function mapV1InterestToInterest(interest?: number): 1 | 2 | 3 | 4 | 5 {
  if (!interest || interest <= 1) return 2;
  if (interest === 2) return 3;
  if (interest === 3) return 3;
  if (interest === 4) return 4;
  return 5;
}

/**
 * Migrate old priority (1-3) to new interest (1-5)
 * Called for existing V2 postings that have priority instead of interest
 * Mapping: 1→2 (low→low), 2→3 (medium→medium), 3→5 (high→very excited)
 */
export function migratePriorityToInterest(priority: 1 | 2 | 3): 1 | 2 | 3 | 4 | 5 {
  const mapping: Record<1 | 2 | 3, 1 | 2 | 3 | 4 | 5> = {
    1: 2,
    2: 3,
    3: 5,
  };
  return mapping[priority];
}

/**
 * Parse timestamp from V1 (ISO string) or V2 (number) format
 */
function parseTimestamp(value: string | number): number {
  if (typeof value === 'number') return value;
  const parsed = new Date(value).getTime();
  return isNaN(parsed) ? Date.now() : parsed;
}

/**
 * Detect the data version in storage
 */
export async function detectDataVersion(): Promise<'v1' | 'v2' | 'none'> {
  const result = await chrome.storage.local.get(['schemaVersion', 'postings', ...V1_STORAGE_KEYS]);

  if (result.schemaVersion === 2) {
    return 'v2';
  }

  for (const key of V1_STORAGE_KEYS) {
    if (result[key] && Array.isArray(result[key]) && result[key].length > 0) {
      return 'v1';
    }
  }

  if (result.postings && Array.isArray(result.postings) && result.postings.length > 0) {
    return 'v2';
  }

  return 'none';
}
