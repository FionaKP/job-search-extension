import { Posting, Connection, AppSettings, ViewMode, VisualColumnId, VISUAL_COLUMNS } from '@/types';
import { debounce } from '@/utils/debounce';

export const STORAGE_KEYS = {
  POSTINGS: 'postings',
  CONNECTIONS: 'connections',
  SETTINGS: 'settings',
  SCHEMA_VERSION: 'schemaVersion',
  VIEW_PREFERENCE: 'viewPreference',
  COLLAPSED_COLUMNS: 'collapsedColumns',
} as const;

// Debounce delay for storage operations (ms)
const STORAGE_DEBOUNCE_DELAY = 300;

// ============ Postings ============

export async function getPostings(): Promise<Posting[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.POSTINGS);
  return result[STORAGE_KEYS.POSTINGS] || [];
}

export async function savePostings(postings: Posting[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.POSTINGS]: postings });
}

// Debounced version for frequent updates
const debouncedSavePostingsInternal = debounce(async (postings: Posting[]) => {
  await chrome.storage.local.set({ [STORAGE_KEYS.POSTINGS]: postings });
}, STORAGE_DEBOUNCE_DELAY);

export function savePostingsDebounced(postings: Posting[]): void {
  debouncedSavePostingsInternal(postings);
}

export async function savePosting(posting: Posting): Promise<void> {
  const postings = await getPostings();
  const index = postings.findIndex((p) => p.id === posting.id);

  if (index >= 0) {
    postings[index] = { ...posting, dateModified: Date.now() };
  } else {
    postings.push(posting);
  }

  await savePostings(postings);
}

export async function deletePosting(id: string): Promise<void> {
  const postings = await getPostings();
  const filtered = postings.filter((p) => p.id !== id);
  await savePostings(filtered);
}

// ============ Connections ============

export async function getConnections(): Promise<Connection[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.CONNECTIONS);
  return result[STORAGE_KEYS.CONNECTIONS] || [];
}

export async function saveConnections(connections: Connection[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.CONNECTIONS]: connections });
}

// Debounced version for frequent updates
const debouncedSaveConnectionsInternal = debounce(async (connections: Connection[]) => {
  await chrome.storage.local.set({ [STORAGE_KEYS.CONNECTIONS]: connections });
}, STORAGE_DEBOUNCE_DELAY);

export function saveConnectionsDebounced(connections: Connection[]): void {
  debouncedSaveConnectionsInternal(connections);
}

export async function saveConnection(connection: Connection): Promise<void> {
  const connections = await getConnections();
  const index = connections.findIndex((c) => c.id === connection.id);

  if (index >= 0) {
    connections[index] = { ...connection, dateModified: Date.now() };
  } else {
    connections.push(connection);
  }

  await saveConnections(connections);
}

export async function deleteConnection(id: string): Promise<void> {
  const connections = await getConnections();
  const filtered = connections.filter((c) => c.id !== id);
  await saveConnections(filtered);

  // Also remove this connection from any linked postings
  const postings = await getPostings();
  const updatedPostings = postings.map((p) => ({
    ...p,
    connectionIds: p.connectionIds.filter((cid) => cid !== id),
  }));
  await savePostings(updatedPostings);
}

// Link a connection to a posting (bidirectional)
export async function linkConnectionToPosting(connectionId: string, postingId: string): Promise<void> {
  const connections = await getConnections();
  const postings = await getPostings();

  // Update connection
  const connectionIndex = connections.findIndex((c) => c.id === connectionId);
  if (connectionIndex >= 0) {
    const connection = connections[connectionIndex];
    if (!connection.linkedPostingIds.includes(postingId)) {
      connections[connectionIndex] = {
        ...connection,
        linkedPostingIds: [...connection.linkedPostingIds, postingId],
        dateModified: Date.now(),
      };
    }
  }

  // Update posting
  const postingIndex = postings.findIndex((p) => p.id === postingId);
  if (postingIndex >= 0) {
    const posting = postings[postingIndex];
    if (!posting.connectionIds.includes(connectionId)) {
      postings[postingIndex] = {
        ...posting,
        connectionIds: [...posting.connectionIds, connectionId],
        dateModified: Date.now(),
      };
    }
  }

  await saveConnections(connections);
  await savePostings(postings);
}

// Unlink a connection from a posting (bidirectional)
export async function unlinkConnectionFromPosting(connectionId: string, postingId: string): Promise<void> {
  const connections = await getConnections();
  const postings = await getPostings();

  // Update connection
  const connectionIndex = connections.findIndex((c) => c.id === connectionId);
  if (connectionIndex >= 0) {
    const connection = connections[connectionIndex];
    connections[connectionIndex] = {
      ...connection,
      linkedPostingIds: connection.linkedPostingIds.filter((id) => id !== postingId),
      dateModified: Date.now(),
    };
  }

  // Update posting
  const postingIndex = postings.findIndex((p) => p.id === postingId);
  if (postingIndex >= 0) {
    const posting = postings[postingIndex];
    postings[postingIndex] = {
      ...posting,
      connectionIds: posting.connectionIds.filter((id) => id !== connectionId),
      dateModified: Date.now(),
    };
  }

  await saveConnections(connections);
  await savePostings(postings);
}

// ============ Settings ============

export async function getSettings(): Promise<AppSettings> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
  return result[STORAGE_KEYS.SETTINGS] || getDefaultSettings();
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings });
}

function getDefaultSettings(): AppSettings {
  return {
    defaultView: 'kanban',
    theme: 'light',
    collapsedColumns: ['rejected'], // Default: collapse rejected column
  };
}

// ============ View Preference ============

export async function getViewPreference(): Promise<ViewMode> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.VIEW_PREFERENCE);
  return result[STORAGE_KEYS.VIEW_PREFERENCE] || 'kanban';
}

export async function saveViewPreference(view: ViewMode): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.VIEW_PREFERENCE]: view });
}

// ============ Collapsed Columns ============

// Valid visual column IDs for migration
const VALID_VISUAL_COLUMN_IDS = VISUAL_COLUMNS.map((c) => c.id);

// Migrate old PostingStatus-based collapsed columns to VisualColumnId
function migrateCollapsedColumns(columns: string[]): VisualColumnId[] {
  const migrated: VisualColumnId[] = [];

  for (const col of columns) {
    // Map old statuses to visual column IDs
    if (col === 'in_progress') {
      // in_progress is now merged into 'saved' - skip (don't collapse saved)
      continue;
    }
    if (col === 'accepted') {
      // accepted is now merged into 'offer' - skip (don't collapse offer)
      continue;
    }
    if (col === 'withdrawn') {
      // withdrawn is no longer a column - skip
      continue;
    }
    // If it's a valid visual column ID, keep it
    if (VALID_VISUAL_COLUMN_IDS.includes(col as VisualColumnId)) {
      migrated.push(col as VisualColumnId);
    }
  }

  return migrated;
}

export async function getCollapsedColumns(): Promise<VisualColumnId[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.COLLAPSED_COLUMNS);
  const stored = result[STORAGE_KEYS.COLLAPSED_COLUMNS];

  if (!stored) {
    // Default to ['rejected'] if not set
    return ['rejected'];
  }

  // Migrate old format if needed
  const migrated = migrateCollapsedColumns(stored);

  // Save migrated version if different
  if (JSON.stringify(migrated) !== JSON.stringify(stored)) {
    await saveCollapsedColumns(migrated);
  }

  return migrated;
}

export async function saveCollapsedColumns(columns: VisualColumnId[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.COLLAPSED_COLUMNS]: columns });
}

// ============ Schema Version ============

export async function getSchemaVersion(): Promise<number> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SCHEMA_VERSION);
  return result[STORAGE_KEYS.SCHEMA_VERSION] || 1;
}

export async function setSchemaVersion(version: number): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.SCHEMA_VERSION]: version });
}
