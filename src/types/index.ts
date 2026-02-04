// ============ Postings ============

export type PostingStatus =
  | 'saved'
  | 'in_progress'
  | 'applied'
  | 'interviewing'
  | 'offer'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export const POSTING_STATUSES: PostingStatus[] = [
  'saved',
  'in_progress',
  'applied',
  'interviewing',
  'offer',
  'accepted',
  'rejected',
  'withdrawn',
];

export const STATUS_LABELS: Record<PostingStatus, string> = {
  saved: 'Saved',
  in_progress: 'In Progress',
  applied: 'Applied',
  interviewing: 'Interviewing',
  offer: 'Offer',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

export const KANBAN_COLUMNS: PostingStatus[] = [
  'saved',
  'in_progress',
  'applied',
  'interviewing',
  'offer',
  'accepted',
  'rejected',
];

export interface Posting {
  id: string;
  url: string;
  company: string;
  companyLogo?: string;
  title: string;
  location: string;
  description: string;
  salary?: string;
  status: PostingStatus;
  priority: 1 | 2 | 3;
  tags: string[];
  notes: string;
  dateAdded: number;
  dateModified: number;
  dateApplied?: number;
  nextActionDate?: string;
  connectionIds: string[];
}

// ============ Connections ============

export interface Connection {
  id: string;
  name: string;
  company: string;
  role?: string;
  relationshipNotes: string;
  lastContactDate?: string;
  nextFollowUp?: string;
  linkedPostingIds: string[];
}

// ============ App State ============

export type ViewMode = 'kanban' | 'list';

export interface AppSettings {
  defaultView: ViewMode;
  theme: 'light' | 'dark';
  collapsedColumns: PostingStatus[];
}

export interface FilterState {
  searchQuery: string;
  priorityFilter: 1 | 2 | 3 | null;
  statusFilter: PostingStatus | null;
  // Advanced filters
  tagFilters: string[];
  companyFilter: string;
  dateRange: {
    from: string | null; // ISO date string
    to: string | null;
  };
  hasDeadline: boolean;
  deadlineSoon: boolean; // Within 7 days
  needsAction: boolean; // No update in 7+ days, non-terminal status
}

export const TERMINAL_STATUSES: PostingStatus[] = ['accepted', 'rejected', 'withdrawn'];

export function isTerminalStatus(status: PostingStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export interface AppState {
  postings: Posting[];
  connections: Connection[];
  settings: AppSettings;
  filters: FilterState;
  ui: {
    currentView: ViewMode;
    selectedPostingId: string | null;
    detailPanelOpen: boolean;
    isLoading: boolean;
  };
}

// ============ V1 Types (for migration) ============

export interface V1Application {
  id: string;
  url: string;
  company: string;
  title: string;
  location: string;
  description: string;
  salary?: string;
  status: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn';
  dateAdded: string;
  dateApplied?: string;
  notes: string;
  tags: string[];
  interest?: number;
}

// ============ Scraper Types ============

/** @deprecated Use ScrapedData instead */
export interface ScrapedJobData {
  url: string;
  title: string;
  company: string;
  location: string;
  description: string;
  detectedSite: string;
  scrapedAt: string;
  salary?: string;
}

/** New scraper response format (Phase 3) */
export interface ScrapedData {
  title: string | null;
  company: string | null;
  companyLogo: string | null;
  location: string | null;
  salary: string | null;
  description: string | null;
  url: string;
  scrapedAt: number;
  source: string; // e.g., 'linkedin', 'greenhouse', 'generic'
  confidence: number; // 0-1, how reliable the scrape was
}

// ============ Stats ============

export interface Stats {
  total: number;
  saved: number;
  applied: number;
  interviewing: number;
  offer: number;
  rejected: number;
  withdrawn: number;
}
