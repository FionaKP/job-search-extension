import { useState } from 'react';
import { Posting, PostingStatus, STATUS_LABELS, isTerminalStatus, Connection, InterestLevel } from '@/types';
import { PriorityStars, TagChip, ContextMenu } from '@/components/common';
import { ConnectionBadge } from '@/components/connections';
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

// Color coding for days: 0-3 subtle, 4-7 warning, 8+ urgent
function getDaysColorClass(days: number, isStale: boolean): string {
  if (days <= 3) return 'text-sage';
  if (days <= 7) return 'text-pandora';
  return isStale ? 'text-flatred font-semibold' : 'text-flatred';
}

// A posting is stale if non-terminal and no update in 7+ days
function checkIsStale(posting: Posting): boolean {
  if (isTerminalStatus(posting.status)) return false;
  return getDaysSinceModified(posting.dateModified) >= 7;
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

  const isStale = checkIsStale(posting);
  const daysSince = getDaysSinceModified(posting.dateModified);
  const daysColorClass = getDaysColorClass(daysSince, isStale);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(posting.id);
    }
  };

  if (variant === 'list') {
    return (
      <ContextMenu items={contextMenuItems}>
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelect(posting.id)}
          onKeyDown={handleKeyDown}
          aria-label={`${posting.title} at ${posting.company}${posting.location ? `, ${posting.location}` : ''}. Status: ${STATUS_LABELS[posting.status]}${isStale ? '. Needs attention' : ''}`}
          className="group flex cursor-pointer items-center bg-white px-4 py-3 transition-colors hover:bg-champagne-50/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-wine focus-visible:bg-champagne-50/50"
        >
          {/* Logo */}
          <div className="relative w-12 flex-shrink-0">
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
            {isStale && (
              <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-flatred text-white">
                <span className="text-[10px] font-bold">!</span>
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

          {/* Updated */}
          <div className={`w-[50px] flex-shrink-0 px-2 text-right text-xs ${daysColorClass}`}>
            {getDaysSinceLabel(posting.dateModified)}
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
          onClick={() => onSelect(posting.id)}
          onKeyDown={handleKeyDown}
          aria-label={`${posting.title} at ${posting.company}${posting.location ? `, ${posting.location}` : ''}${isStale ? '. Needs attention' : ''}`}
          className={`relative group cursor-pointer rounded-lg border bg-white shadow-sm transition-all duration-base hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2 ${
            isStale ? 'border-flatred/30' : 'border-sage/20'
          } ${isSelected ? 'bg-champagne-50 ring-2 ring-champagne-300' : ''} px-3 py-2`}
        >
          {/* Compact horizontal layout */}
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="relative flex-shrink-0">
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
              {isStale && (
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-flatred-50">
                  <svg className="h-3 w-3 text-flatred" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
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
              {/* Row 2: Location | Stars | Tags */}
              <div className="flex items-center gap-2 mt-0.5">
                {posting.location && (
                  <>
                    <p className="truncate text-xs text-wine/50 max-w-[120px]">{posting.location}</p>
                    <span className="text-wine/20 flex-shrink-0">|</span>
                  </>
                )}
                <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <PriorityStars priority={posting.interest} onChange={(p) => onPriorityChange(posting.id, p)} size="sm" />
                </div>
                <div className="flex gap-1 overflow-hidden">
                  {posting.tags.slice(0, 2).map((tag) => (
                    <TagChip key={tag} tag={tag} size="sm" />
                  ))}
                  {posting.tags.length > 2 && (
                    <span className="text-xs text-sage flex-shrink-0">+{posting.tags.length - 2}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: connections & days */}
            <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <ConnectionBadge connections={linkedConnections} onClick={onConnectionClick} size="sm" />
              <div className={`flex items-center gap-1 text-xs ${daysColorClass}`}>
                {isStale && (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                {getDaysSinceLabel(posting.dateModified)}
              </div>
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
        onClick={() => onSelect(posting.id)}
        onKeyDown={handleKeyDown}
        aria-label={`${posting.title} at ${posting.company}${posting.location ? `, ${posting.location}` : ''}${isStale ? '. Needs attention' : ''}`}
        className={`relative group cursor-pointer rounded-lg border bg-white shadow-sm transition-all duration-base hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2 ${
          isStale ? 'border-flatred/30' : 'border-sage/20'
        } ${isSelected ? 'bg-champagne-50 ring-2 ring-champagne-300' : ''} p-3`}
      >
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
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
            {isStale && (
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-flatred-50">
                <svg className="h-3 w-3 text-flatred" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-wine">{posting.title}</p>
            <p className="truncate text-sm text-wine/70">{posting.company}</p>
            {!isCompact && <p className="truncate text-xs text-wine/50">{posting.location}</p>}
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <PriorityStars priority={posting.interest} onChange={(p) => onPriorityChange(posting.id, p)} size="sm" />
            {!isCompact && (
              <>
                <div className="flex gap-1 overflow-hidden">
                  {posting.tags.slice(0, 2).map((tag) => (
                    <TagChip key={tag} tag={tag} size="sm" />
                  ))}
                  {posting.tags.length > 2 && (
                    <span className="text-xs text-sage">+{posting.tags.length - 2}</span>
                  )}
                </div>
                <ConnectionBadge connections={linkedConnections} onClick={onConnectionClick} size="sm" />
              </>
            )}
          </div>
          <div className={`flex items-center gap-1 text-xs ${daysColorClass}`}>
            {isStale && (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {getDaysSinceLabel(posting.dateModified)}
          </div>
        </div>
      </div>
    </ContextMenu>
  );
}
