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
  // Offer Details (V2)
  offerDetails?: OfferDetails;
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

// ============ Offer Details (V2) ============

export type BonusType = 'percentage' | 'fixed';
export type WorkLocation = 'remote' | 'hybrid' | 'onsite';

export interface OfferDetails {
  baseSalary?: number;
  bonus?: {
    type: BonusType;
    value: number;
  };
  equity?: {
    shares?: number;
    value?: number;          // Estimated annual value
    vestingYears?: number;   // Typically 4
  };
  signOn?: number;
  benefits: string[];
  workLocation?: WorkLocation;
  pto?: string;              // e.g., "Unlimited", "20 days"
  deadline?: string;         // ISO date - offer expiration
  notes: string;
  negotiationHistory?: NegotiationNote[];
}

export interface NegotiationNote {
  id: string;
  date: string;              // ISO date
  note: string;
}

export const WORK_LOCATION_LABELS: Record<WorkLocation, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'Onsite',
};

export const COMMON_BENEFITS = [
  'Health Insurance',
  'Dental/Vision',
  '401k Match',
  'Unlimited PTO',
  'Remote Work',
  'Stock Options',
  'Signing Bonus',
  'Relocation Assistance',
  'Parental Leave',
  'Learning Budget',
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

// ============ Roadmap Goals (V2) ============

export type GoalType = 'application' | 'networking' | 'interview' | 'followup' | 'custom';

export interface Goal {
  id: string;
  title: string;
  type?: GoalType;

  // Progress tracking
  targetCount?: number;
  currentCount?: number;
  completed: boolean;
  completedAt?: string | number;

  // Timing
  dueDate: string;  // ISO date
  createdAt: string | number;

  // Recurring goals
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;

  // Dependencies
  dependsOn?: string[];  // Goal IDs this goal depends on

  // Links
  linkedPostingIds?: string[];
  linkedConnectionIds?: string[];

  // Reminders
  reminders?: GoalReminderConfig[];

  notes?: string;
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;  // Every N days/weeks/months
  endDate?: string;  // ISO date - when to stop recurring
  daysOfWeek?: number[];  // 0-6 for weekly patterns
}

export interface GoalReminderConfig {
  id: string;
  goalId: string;
  type: 'before_due' | 'daily' | 'custom';
  timing: number;          // Minutes before (e.g., 1440 = 1 day)
  sent: boolean;
  dismissed: boolean;
  customTime?: string;     // HH:MM format for custom reminders
}

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  application: 'Application',
  networking: 'Networking',
  interview: 'Interview Prep',
  followup: 'Follow-up',
  custom: 'Custom',
};

export const GOAL_TYPE_ICONS: Record<GoalType, string> = {
  application: '📝',
  networking: '👥',
  interview: '🎯',
  followup: '📧',
  custom: '⭐',
};

// ============ Timeline Events (V2) ============

export type TimelineEventType = 'interview' | 'followup' | 'deadline' | 'goal' | 'connection' | 'status_change';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  date: string;  // ISO date
  postingId?: string;
  connectionId?: string;
  goalId?: string;
  title: string;
  notes?: string;
  metadata?: {
    fromStatus?: PostingStatus;
    toStatus?: PostingStatus;
    interviewRound?: number;
    eventType?: ContactEventType;
  };
}

export const TIMELINE_EVENT_COLORS: Record<TimelineEventType, string> = {
  interview: '#8B5CF6',      // Purple
  followup: '#F59E0B',       // Amber
  deadline: '#EF4444',       // Red
  goal: '#10B981',           // Emerald
  connection: '#3B82F6',     // Blue
  status_change: '#6B7280',  // Gray
};

// ============ Goal Analytics (V2) ============

export interface GoalAnalytics {
  totalGoalsCreated: number;
  totalGoalsCompleted: number;
  completionRate: number;  // 0-1
  currentStreak: number;   // Days in a row with goal completions
  longestStreak: number;
  averageCompletionTime: number;  // Days from creation to completion
  goalsByType: Record<GoalType, { created: number; completed: number }>;
  weeklyCompletions: { week: string; count: number }[];
}

// ============ Notification Settings (V2) ============

export interface NotificationSettings {
  enabled: boolean;
  goalReminders: boolean;
  interviewReminders: boolean;
  offerDeadlines: boolean;
  weeklySummary: boolean;
  networkingNudges: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;    // "22:00"
  quietHoursEnd: string;      // "08:00"
  goalReminderTiming: number; // Minutes before
  interviewReminderTiming: number;
}

export interface RoadmapSettings {
  defaultZoom: 'week' | 'month' | 'quarter';
  showConnections: boolean;
  showCompletedGoals: boolean;
  defaultView: 'timeline' | 'board';
}

// ============ Goal Templates (V2) ============

export interface GoalTemplate {
  id: string;
  category: GoalType;
  title: string;
  defaultTargetCount?: number;
  suggestedTiming: 'weekly' | 'monthly' | 'before_event';
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
  { id: 'apply-5', category: 'application', title: 'Apply to 5 roles', defaultTargetCount: 5, suggestedTiming: 'weekly' },
  { id: 'apply-10-month', category: 'application', title: 'Submit 10 applications this month', defaultTargetCount: 10, suggestedTiming: 'monthly' },
  { id: 'reach-out-3', category: 'networking', title: 'Reach out to 3 connections', defaultTargetCount: 3, suggestedTiming: 'weekly' },
  { id: 'coffee-chats', category: 'networking', title: 'Schedule 2 coffee chats', defaultTargetCount: 2, suggestedTiming: 'monthly' },
  { id: 'interview-prep', category: 'interview', title: 'Complete interview prep', suggestedTiming: 'before_event' },
  { id: 'follow-up', category: 'followup', title: 'Follow up on applications', defaultTargetCount: 3, suggestedTiming: 'weekly' },
  { id: 'research-companies', category: 'custom', title: 'Research 5 companies', defaultTargetCount: 5, suggestedTiming: 'weekly' },
];

// ============ Roadmap Goal Stops (V2) ============

export type GoalStopItemType =
  | 'application-goal'
  | 'interview'
  | 'offer-deadline'
  | 'follow-up'
  | 'goal';

export interface GoalStopItemBase {
  id: string;
  type: GoalStopItemType;
  date: Date;
  completed: boolean;
}

export interface ApplicationGoalItem extends GoalStopItemBase {
  type: 'application-goal';
  posting: Posting;
}

export interface InterviewItem extends GoalStopItemBase {
  type: 'interview';
  posting: Posting;
  interview: Interview;
}

export interface OfferDeadlineItem extends GoalStopItemBase {
  type: 'offer-deadline';
  posting: Posting;
  deadline: string;
}

export interface FollowUpItem extends GoalStopItemBase {
  type: 'follow-up';
  connection: Connection;
}

export interface GoalItem extends GoalStopItemBase {
  type: 'goal';
  goal: Goal;
}

export type GoalStopItem =
  | ApplicationGoalItem
  | InterviewItem
  | OfferDeadlineItem
  | FollowUpItem
  | GoalItem;

export interface GoalStopProgress {
  completed: number;
  total: number;
}

export interface GoalStop {
  id: string;
  date: Date;
  weekLabel: string;
  items: GoalStopItem[];
  progress: GoalStopProgress;
}

// Snooze options for roadmap items
export type SnoozeDuration = 1 | 3 | 7; // days
