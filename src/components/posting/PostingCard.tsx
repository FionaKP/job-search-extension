import { useState } from 'react';
import { Posting, PostingStatus, STATUS_LABELS, Connection, InterestLevel, REJECTION_STAGE_LABELS } from '@/types';
import { PriorityStars, TagChip, ContextMenu } from '@/components/common';
import { ConnectionBadge } from '@/components/connections';
import { KeywordMatchBadge } from '@/components/keywords';
import { getLogoUrl } from '@/utils/logo';

// Status badge colors matching the vintage palette
// Red = rejected, Green = applied, Blue/Wine = interviewing
const STATUS_BADGE_COLORS: Record<PostingStatus, string> = {
  saved: 'bg-pandora/15 text-pandora-600 border-pandora/30',
  in_progress: 'bg-champagne-200/50 text-champagne-700 border-champagne-400/30',
  applied: 'bg-teal/10 text-teal-600 border-teal/30',
  interviewing: 'bg-wine/10 text-wine border-wine/30',
  offer: 'bg-pandora-500/15 text-pandora-600 border-pandora-500/30',
  accepted: 'bg-teal-600/15 text-teal-700 border-teal-600/30',
  rejected: 'bg-flatred/10 text-flatred border-flatred/30',
  withdrawn: 'bg-sage/10 text-sage-500 border-sage/20',
};

interface PostingCardProps {
  posting: Posting;
  onSelect: (id: string) => void;
  onPriorityChange: (id: string, interest: InterestLevel) => void;
  onStatusChange: (id: string, status: PostingStatus) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
  variant?: 'kanban' | 'list';
  linkedConnections?: Connection[];
  onConnectionClick?: () => void;
  isSelected?: boolean;
  columnWidth?: number;
  // Multi-select mode
  isMultiSelectMode?: boolean;
  isMultiSelected?: boolean;
  onMultiSelect?: (id: string) => void;
}

function getInitials(company: string): string {
  return company
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function getDaysSinceModified(timestamp: number): number {
  return Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
}

function getDaysSinceLabel(timestamp: number): string {
  const days = getDaysSinceModified(timestamp);
  if (days === 0) return 'Today';
  if (days === 1) return '1d';
  return `${days}d`;
}

// Unified date stamp - shows deadline if set, otherwise days since modified
function DateStamp({ posting }: { posting: Posting }) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Check for goal deadline (saved/in_progress)
  if (posting.applicationGoalDate && (posting.status === 'saved' || posting.status === 'in_progress')) {
    const goalDate = new Date(posting.applicationGoalDate);
    goalDate.setHours(0, 0, 0, 0);
    const daysUntil = Math.floor((goalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const isOverdue = daysUntil < 0;
    const isSoon = daysUntil >= 0 && daysUntil <= 3;

    const colorClass = isOverdue
      ? 'text-flatred font-semibold'
      : isSoon
        ? 'text-pandora-600 font-semibold'
        : 'text-teal-600';

    const label = isOverdue
      ? `${Math.abs(daysUntil)}d late`
      : daysUntil === 0
        ? 'Today'
        : `${daysUntil}d`;

    return (
      <div className={`flex items-center gap-1 text-xs ${colorClass}`} title={`Goal: Apply by ${posting.applicationGoalDate}`}>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {label}
      </div>
    );
  }

  // Check for upcoming interview (interviewing)
  if (posting.status === 'interviewing' && posting.interviews?.length) {
    const upcomingInterview = posting.interviews
      .filter((i) => !i.completed && i.date)
      .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
      .find((i) => {
        const interviewDate = new Date(i.date!);
        interviewDate.setHours(0, 0, 0, 0);
        return interviewDate >= now;
      });

    if (upcomingInterview?.date) {
      const interviewDate = new Date(upcomingInterview.date);
      interviewDate.setHours(0, 0, 0, 0);
      const daysUntil = Math.floor((interviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      const colorClass = daysUntil === 0
        ? 'text-flatred font-semibold'
        : daysUntil <= 2
          ? 'text-pandora-600 font-semibold'
          : 'text-indigo-600';

      const label = daysUntil === 0 ? 'Today' : daysUntil === 1 ? '1d' : `${daysUntil}d`;

      return (
        <div
          className={`flex items-center gap-1 text-xs ${colorClass}`}
          title={`${upcomingInterview.roundName} on ${upcomingInterview.date}${upcomingInterview.time ? ` at ${upcomingInterview.time}` : ''}`}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {label}
        </div>
      );
    }
  }

  // Check for offer deadline
  if (posting.status === 'offer' && posting.offerDetails?.deadline) {
    const deadlineDate = new Date(posting.offerDetails.deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const daysUntil = Math.floor((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const isExpired = daysUntil < 0;
    const isUrgent = daysUntil >= 0 && daysUntil <= 2;

    const colorClass = isExpired
      ? 'text-flatred font-semibold'
      : isUrgent
        ? 'text-pandora-600 font-semibold'
        : 'text-teal-600';

    const label = isExpired
      ? `${Math.abs(daysUntil)}d ago`
      : daysUntil === 0
        ? 'Today'
        : `${daysUntil}d`;

    return (
      <div className={`flex items-center gap-1 text-xs ${colorClass}`} title={`Offer deadline: ${posting.offerDetails.deadline}`}>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {label}
      </div>
    );
  }

  // Default: days since modified (neutral)
  return (
    <div className="text-xs text-wine/50">
      {getDaysSinceLabel(posting.dateModified)}
    </div>
  );
}

// Interview badge - only shows round progress (e.g., "R2/3"), date info is in DateStamp
function InterviewBadge({ posting }: { posting: Posting }) {
  if (posting.status !== 'interviewing' || !posting.interviews?.length) return null;

  const totalRounds = posting.interviews.length;
  const completedRounds = posting.interviews.filter((i) => i.completed).length;

  if (totalRounds === 0) return null;

  return (
    <span
      className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-wine/10 text-wine"
      title={`${completedRounds}/${totalRounds} rounds completed`}
    >
      R{completedRounds}/{totalRounds}
    </span>
  );
}

// Rejection badge component - simple pill showing stage reached
function RejectionBadge({ posting }: { posting: Posting }) {
  if (posting.status !== 'rejected' || !posting.rejectionDetails) return null;

  const stage = posting.rejectionDetails.stage;

  // Very short labels for badge
  const shortLabels: Record<string, string> = {
    application: 'App',
    phone: 'Phone',
    technical: 'Tech',
    onsite: 'Onsite',
    offer: 'Offer',
    unknown: '?',
  };

  const shortLabel = shortLabels[stage] || stage;

  return (
    <span
      className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-sage/20 text-wine/60"
      title={`Rejected at ${REJECTION_STAGE_LABELS[stage]}`}
    >
      @{shortLabel}
    </span>
  );
}

export function PostingCard({
  posting,
  onSelect,
  onPriorityChange,
  onStatusChange,
  onDelete,
  onEdit: _onEdit,
  variant = 'kanban',
  linkedConnections = [],
  onConnectionClick,
  isSelected = false,
  columnWidth = 280,
  isMultiSelectMode = false,
  isMultiSelected = false,
  onMultiSelect,
}: PostingCardProps) {
  const [logoError, setLogoError] = useState(false);

  // Get logo URL with Google favicon fallback
  const logoUrl = getLogoUrl(posting.companyLogo, posting.company);
  const showLogo = logoUrl && !logoError;

  // Check if loaded image is Google's default favicon (16x16 globe)
  const handleLogoLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // Google's default favicon is 16x16, treat as error to show initials
    if (img.naturalWidth <= 16 && img.naturalHeight <= 16) {
      setLogoError(true);
    }
  };

  // Determine if we should use compact layout based on column width
  const isCompact = columnWidth < 260;
  const isWide = columnWidth > 350;
  const contextMenuItems = [
    {
      label: 'Open URL',
      onClick: () => window.open(posting.url, '_blank'),
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      ),
    },
    { divider: true, label: '', onClick: () => {} },
    ...(['saved', 'in_progress', 'applied', 'interviewing', 'offer', 'rejected'] as PostingStatus[])
      .filter((s) => s !== posting.status)
      .map((status) => ({
        label: `Move to ${STATUS_LABELS[status]}`,
        onClick: () => onStatusChange(posting.id, status),
      })),
    { divider: true, label: '', onClick: () => {} },
    {
      label: 'Delete',
      onClick: () => onDelete(posting.id),
      danger: true,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
    },
  ];


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isMultiSelectMode && onMultiSelect) {
        onMultiSelect(posting.id);
      } else {
        onSelect(posting.id);
      }
    }
  };

  const handleClick = () => {
    if (isMultiSelectMode && onMultiSelect) {
      onMultiSelect(posting.id);
    } else {
      onSelect(posting.id);
    }
  };

  // Checkbox for multi-select mode
  const MultiSelectCheckbox = () => (
    <div
      className="flex-shrink-0 mr-2"
      onClick={(e) => {
        e.stopPropagation();
        onMultiSelect?.(posting.id);
      }}
    >
      <div
        className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
          isMultiSelected
            ? 'bg-indigo-600 border-indigo-600'
            : 'border-gray-300 hover:border-indigo-400'
        }`}
      >
        {isMultiSelected && (
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </div>
  );

  if (variant === 'list') {
    return (
      <ContextMenu items={contextMenuItems}>
        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          aria-label={`${posting.title} at ${posting.company}${posting.location ? `, ${posting.location}` : ''}. Status: ${STATUS_LABELS[posting.status]}${isMultiSelectMode ? `. ${isMultiSelected ? 'Selected' : 'Not selected'}` : ''}`}
          className={`group flex cursor-pointer items-center bg-white px-4 py-3 transition-colors hover:bg-champagne-50/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-wine focus-visible:bg-champagne-50/50 ${
            isMultiSelected ? 'bg-indigo-50/50' : ''
          }`}
        >
          {/* Multi-select checkbox */}
          {isMultiSelectMode && <MultiSelectCheckbox />}

          {/* Logo */}
          <div className="w-12 flex-shrink-0">
            {showLogo ? (
              <img
                src={logoUrl}
                alt={posting.company}
                className="h-9 w-9 rounded-md object-contain bg-white"
                onLoad={handleLogoLoad}
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-champagne-100 text-xs font-semibold text-wine/70">
                {getInitials(posting.company)}
              </div>
            )}
          </div>

          {/* Title & Company */}
          <div className="min-w-[200px] flex-1 pr-4">
            <p className="truncate text-sm font-medium text-wine group-hover:text-flatred transition-colors">{posting.title}</p>
            <p className="truncate text-xs text-wine/50">{posting.company}</p>
          </div>

          {/* Location */}
          <div className="w-[120px] flex-shrink-0 px-2">
            <span className="text-xs text-wine/60 truncate block">{posting.location || '—'}</span>
          </div>

          {/* Status */}
          <div className="w-[100px] flex-shrink-0 px-2">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STATUS_BADGE_COLORS[posting.status]}`}>
              {STATUS_LABELS[posting.status]}
            </span>
          </div>

          {/* Tags */}
          <div className="w-[140px] flex-shrink-0 px-2 overflow-hidden">
            {posting.tags.length > 0 ? (
              <div className="flex flex-nowrap gap-1 overflow-x-auto scrollbar-hide">
                {posting.tags.map((tag) => (
                  <TagChip key={tag} tag={tag} size="sm" className="flex-shrink-0" />
                ))}
              </div>
            ) : (
              <span className="text-xs text-wine/30">—</span>
            )}
          </div>

          {/* Priority */}
          <div className="w-[70px] flex-shrink-0 px-2" onClick={(e) => e.stopPropagation()}>
            <PriorityStars priority={posting.interest} onChange={(p) => onPriorityChange(posting.id, p)} size="sm" />
          </div>

          {/* Updated / Deadline */}
          <div className="w-[60px] flex-shrink-0 px-2 flex justify-end">
            <DateStamp posting={posting} />
          </div>

          {/* Connections */}
          <div className="w-[36px] flex-shrink-0 flex justify-center" onClick={(e) => e.stopPropagation()}>
            <ConnectionBadge connections={linkedConnections} onClick={onConnectionClick} size="sm" />
          </div>
        </div>
      </ContextMenu>
    );
  }

  // Wide layout: compact horizontal (less vertical space)
  if (isWide) {
    return (
      <ContextMenu items={contextMenuItems}>
        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          aria-label={`${posting.title} at ${posting.company}${posting.location ? `, ${posting.location}` : ''}${isMultiSelectMode ? `. ${isMultiSelected ? 'Selected' : 'Not selected'}` : ''}`}
          className={`relative group cursor-pointer rounded-lg border border-sage/20 bg-white shadow-sm transition-all duration-base hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2 ${
            isSelected ? 'bg-champagne-50 ring-2 ring-champagne-300' : ''
          } ${isMultiSelected ? 'ring-2 ring-indigo-400 bg-indigo-50/30' : ''} px-3 py-2`}
        >
          {/* Compact horizontal layout */}
          <div className="flex items-center gap-3">
            {/* Multi-select checkbox */}
            {isMultiSelectMode && <MultiSelectCheckbox />}

            {/* Logo */}
            <div className="flex-shrink-0">
              {showLogo ? (
                <img
                  src={logoUrl}
                  alt={posting.company}
                  className="h-10 w-10 rounded object-contain bg-white"
                  onLoad={handleLogoLoad}
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded bg-champagne-200 text-sm font-medium text-wine">
                  {getInitials(posting.company)}
                </div>
              )}
            </div>

            {/* Title & details - horizontal flow */}
            <div className="min-w-0 flex-1">
              {/* Row 1: Title • Company */}
              <div className="flex items-baseline gap-1.5">
                <p className="truncate font-medium text-wine">{posting.title}</p>
                <span className="text-wine/30 flex-shrink-0">•</span>
                <p className="truncate text-sm text-wine/60">{posting.company}</p>
              </div>
              {/* Row 2: Location | Stars | Tags | Badges */}
              <div className="flex items-center gap-1.5 mt-0.5 overflow-hidden">
                {posting.location && (
                  <p className="truncate text-xs text-wine/50 max-w-[100px] flex-shrink-0">{posting.location}</p>
                )}
                <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <PriorityStars priority={posting.interest} onChange={(p) => onPriorityChange(posting.id, p)} size="sm" />
                </div>
                <div className="flex gap-1 overflow-hidden min-w-0">
                  {posting.tags.slice(0, 1).map((tag) => (
                    <TagChip key={tag} tag={tag} size="sm" />
                  ))}
                  {posting.tags.length > 1 && (
                    <span className="text-[10px] text-sage flex-shrink-0">+{posting.tags.length - 1}</span>
                  )}
                </div>
                <KeywordMatchBadge keywords={posting.keywords} size="sm" />
                <InterviewBadge posting={posting} />
                <RejectionBadge posting={posting} />
              </div>
            </div>

            {/* Right side: connections & date/deadline */}
            <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <ConnectionBadge connections={linkedConnections} onClick={onConnectionClick} size="sm" />
              <DateStamp posting={posting} />
            </div>
          </div>
        </div>
      </ContextMenu>
    );
  }

  // Default/compact layout: stacked vertical
  return (
    <ContextMenu items={contextMenuItems}>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`${posting.title} at ${posting.company}${posting.location ? `, ${posting.location}` : ''}${isMultiSelectMode ? `. ${isMultiSelected ? 'Selected' : 'Not selected'}` : ''}`}
        className={`relative group cursor-pointer rounded-lg border border-sage/20 bg-white shadow-sm transition-all duration-base hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2 ${
          isSelected ? 'bg-champagne-50 ring-2 ring-champagne-300' : ''
        } ${isMultiSelected ? 'ring-2 ring-indigo-400 bg-indigo-50/30' : ''} p-3`}
      >
        <div className="flex items-start gap-3">
          {/* Multi-select checkbox */}
          {isMultiSelectMode && <MultiSelectCheckbox />}
          <div className="flex-shrink-0">
            {showLogo ? (
              <img
                src={logoUrl}
                alt={posting.company}
                className="h-10 w-10 rounded object-contain bg-white"
                onLoad={handleLogoLoad}
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded bg-champagne-200 text-sm font-medium text-wine">
                {getInitials(posting.company)}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-wine">{posting.title}</p>
            <p className="truncate text-sm text-wine/70">{posting.company}</p>
            {!isCompact && <p className="truncate text-xs text-wine/50">{posting.location}</p>}
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 gap-2">
          <div className="flex items-center gap-1.5 overflow-hidden min-w-0" onClick={(e) => e.stopPropagation()}>
            <PriorityStars priority={posting.interest} onChange={(p) => onPriorityChange(posting.id, p)} size="sm" />
            {!isCompact && (
              <>
                <div className="flex gap-1 overflow-hidden min-w-0">
                  {posting.tags.slice(0, 1).map((tag) => (
                    <TagChip key={tag} tag={tag} size="sm" />
                  ))}
                  {posting.tags.length > 1 && (
                    <span className="text-[10px] text-sage flex-shrink-0">+{posting.tags.length - 1}</span>
                  )}
                </div>
                <KeywordMatchBadge keywords={posting.keywords} size="sm" />
                <InterviewBadge posting={posting} />
                <RejectionBadge posting={posting} />
                <ConnectionBadge connections={linkedConnections} onClick={onConnectionClick} size="sm" />
              </>
            )}
          </div>
          <DateStamp posting={posting} />
        </div>
      </div>
    </ContextMenu>
  );
}
