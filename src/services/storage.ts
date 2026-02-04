import { Posting, Connection, AppSettings, ViewMode } from '@/types';

export const STORAGE_KEYS = {
  POSTINGS: 'postings',
  CONNECTIONS: 'connections',
  SETTINGS: 'settings',
  SCHEMA_VERSION: 'schemaVersion',
  VIEW_PREFERENCE: 'viewPreference',
} as const;

// ============ Postings ============

export async function getPostings(): Promise<Posting[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.POSTINGS);
  return result[STORAGE_KEYS.POSTINGS] || [];
}

export async function savePostings(postings: Posting[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.POSTINGS]: postings });
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

// ============ Schema Version ============

export async function getSchemaVersion(): Promise<number> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SCHEMA_VERSION);
  return result[STORAGE_KEYS.SCHEMA_VERSION] || 1;
}

export async function setSchemaVersion(version: number): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.SCHEMA_VERSION]: version });
}
