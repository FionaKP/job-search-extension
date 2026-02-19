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

export type InterestLevel = 1 | 2 | 3 | 4 | 5;

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
  interest: InterestLevel;
  tags: string[];
  notes: string;
  dateAdded: number;
  dateModified: number;
  dateApplied?: number;
  nextActionDate?: string;
  connectionIds: string[];
  // Keywords (Phase 5)
  keywords?: ExtractedKeyword[];
  keywordsExtractedAt?: number;
  // Application Goals (V2)
  applicationGoalDate?: string;  // ISO date - target date to apply by
  snoozedUntil?: string;         // ISO date - hide reminders until this date
  goalReminders?: GoalReminder[];
  // Interview Prep (V2)
  interviews?: Interview[];
  prepNotes?: string;
  questionsToAsk?: InterviewQuestion[];
  // Rejection Insights (V2)
  rejectionDetails?: RejectionDetails;
}

// ============ Goal Reminders (V2) ============

export type GoalReminderType = 'apply' | 'followup' | 'custom';

export interface GoalReminder {
  id: string;
  type: GoalReminderType;
  date: string;          // ISO date
  message?: string;      // Custom message for 'custom' type
  completed: boolean;
}

export const GOAL_REMINDER_TYPE_LABELS: Record<GoalReminderType, string> = {
  apply: 'Apply Reminder',
  followup: 'Follow Up',
  custom: 'Custom Reminder',
};

// ============ Interview Prep (V2) ============

export type InterviewType = 'phone' | 'video' | 'onsite';
export type InterviewOutcome = 'positive' | 'neutral' | 'negative' | 'unknown';

export interface Interview {
  id: string;
  round: number;
  roundName: string;           // "Phone Screen", "Technical", "Onsite", etc.
  date?: string;               // ISO date
  time?: string;               // HH:MM format
  type: InterviewType;
  interviewers: string[];      // Names/roles of interviewers
  notes: string;               // Notes about this round
  completed: boolean;
  outcome?: InterviewOutcome;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  asked: boolean;
  answer?: string;             // Notes on their answer
}

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  phone: 'Phone',
  video: 'Video',
  onsite: 'Onsite',
};

export const INTERVIEW_OUTCOME_LABELS: Record<InterviewOutcome, string> = {
  positive: 'Went Well',
  neutral: 'Neutral',
  negative: 'Could Be Better',
  unknown: 'Unknown',
};

// Common round name suggestions
export const COMMON_ROUND_NAMES = [
  'Phone Screen',
  'Recruiter Call',
  'Technical Screen',
  'Coding Interview',
  'System Design',
  'Behavioral',
  'Hiring Manager',
  'Team Interview',
  'Onsite',
  'Final Round',
];

// Default questions to suggest
export const DEFAULT_INTERVIEW_QUESTIONS = [
  'What does success look like in the first 90 days?',
  'How does the team handle technical debt?',
  'What\'s the biggest challenge the team is facing right now?',
  'Can you describe the team structure and dynamics?',
  'What does the typical career path look like?',
  'How do you measure performance?',
  'What\'s the work-life balance like?',
  'What are the next steps in the interview process?',
];

// ============ Rejection Insights (V2) ============

export type RejectionStage =
  | 'application'
  | 'phone'
  | 'technical'
  | 'onsite'
  | 'offer'
  | 'unknown';

export interface RejectionDetails {
  stage: RejectionStage;
  reason?: string;       // Brief reason if known
  feedback?: string;     // Detailed feedback from company
  takeaway?: string;     // User's lessons learned
  rejectedAt: string;    // ISO date
}

export const REJECTION_STAGE_LABELS: Record<RejectionStage, string> = {
  application: 'Application Stage',
  phone: 'Phone Screen',
  technical: 'Technical Interview',
  onsite: 'Onsite Interview',
  offer: 'Offer Stage',
  unknown: 'Unknown Stage',
};

export const REJECTION_STAGE_ORDER: RejectionStage[] = [
  'application',
  'phone',
  'technical',
  'onsite',
  'offer',
  'unknown',
];

// ============ Keywords (Phase 5) ============

export type KeywordCategory =
  | 'required_skill'
  | 'preferred_skill'
  | 'soft_skill'
  | 'experience'
  | 'education'
  | 'values'
  | 'tools'
  | 'industry';

export type KeywordImportance = 'high' | 'medium' | 'low';

export interface ExtractedKeyword {
  term: string;
  category: KeywordCategory;
  importance: KeywordImportance;
  frequency: number;
  contexts?: string[]; // Surrounding text snippets
  addressed: boolean; // User marked as addressed in their application
}

export const KEYWORD_CATEGORY_LABELS: Record<KeywordCategory, string> = {
  required_skill: 'Required Skills',
  preferred_skill: 'Preferred Skills',
  soft_skill: 'Soft Skills',
  experience: 'Experience',
  education: 'Education',
  values: 'Values & Culture',
  tools: 'Tools',
  industry: 'Industry',
};

export const KEYWORD_CATEGORY_ORDER: KeywordCategory[] = [
  'required_skill',
  'preferred_skill',
  'soft_skill',
  'experience',
  'education',
  'tools',
  'values',
  'industry',
];

// ============ Connections ============

export type RelationshipType = 'recruiter' | 'employee' | 'referral' | 'alumni' | 'other';

export type ContactEventType = 'email' | 'call' | 'meeting' | 'linkedin' | 'other';

export interface ContactEvent {
  id: string;
  date: string; // ISO date string
  type: ContactEventType;
  notes?: string;
}

export interface Connection {
  id: string;
  name: string;
  email?: string;
  linkedInUrl?: string;
  company: string;
  role?: string;

  // Relationship
  relationshipType: RelationshipType;
  howWeMet?: string;
  relationshipStrength: 1 | 2 | 3; // 1=weak, 2=moderate, 3=strong

  // Communication
  notes: string;
  lastContactDate?: string;
  nextFollowUp?: string;
  contactHistory: ContactEvent[];

  // Links
  linkedPostingIds: string[];

  // Meta
  dateAdded: number;
  dateModified: number;
}

export const RELATIONSHIP_TYPE_LABELS: Record<RelationshipType, string> = {
  recruiter: 'Recruiter',
  employee: 'Employee',
  referral: 'Referral',
  alumni: 'Alumni',
  other: 'Other',
};

export const RELATIONSHIP_STRENGTH_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Weak',
  2: 'Moderate',
  3: 'Strong',
};

export const CONTACT_EVENT_TYPE_LABELS: Record<ContactEventType, string> = {
  email: 'Email',
  call: 'Call',
  meeting: 'Meeting',
  linkedin: 'LinkedIn',
  other: 'Other',
};

// ============ App State ============

export type ViewMode = 'kanban' | 'list';

export interface AppSettings {
  defaultView: ViewMode;
  theme: 'light' | 'dark';
  collapsedColumns: PostingStatus[];
}

export interface FilterState {
  searchQuery: string;
  interestFilter: InterestLevel | null;
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
