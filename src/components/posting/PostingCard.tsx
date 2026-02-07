import { Posting, PostingStatus, STATUS_LABELS, isTerminalStatus, Connection } from '@/types';
import { PriorityStars, TagChip, ContextMenu } from '@/components/common';
import { ConnectionBadge } from '@/components/connections';

interface PostingCardProps {
  posting: Posting;
  onSelect: (id: string) => void;
  onPriorityChange: (id: string, priority: 1 | 2 | 3) => void;
  onStatusChange: (id: string, status: PostingStatus) => void;
  onDelete: (id: string) => void;
  variant?: 'kanban' | 'list';
  linkedConnections?: Connection[];
  onConnectionClick?: () => void;
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

// Color coding for days: 0-3 gray, 4-7 orange, 8+ red
function getDaysColorClass(days: number, isStale: boolean): string {
  if (days <= 3) return 'text-gray-400';
  if (days <= 7) return 'text-orange-500';
  return isStale ? 'text-red-500 font-semibold' : 'text-red-500';
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
  variant = 'kanban',
  linkedConnections = [],
  onConnectionClick,
}: PostingCardProps) {
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

  if (variant === 'list') {
    return (
      <ContextMenu items={contextMenuItems}>
        <div
          onClick={() => onSelect(posting.id)}
          className="flex cursor-pointer items-center gap-4 border-b border-gray-200 bg-white px-4 py-3 hover:bg-gray-50"
        >
          <div className="relative">
            {posting.companyLogo ? (
              <img src={posting.companyLogo} alt={posting.company} className="h-10 w-10 rounded object-contain" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-200 text-sm font-medium text-gray-600">
                {getInitials(posting.company)}
              </div>
            )}
            {isStale && (
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-100">
                <svg className="h-3 w-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-gray-900">{posting.title}</p>
            <p className="truncate text-sm text-gray-500">{posting.company}</p>
          </div>
          <div className="flex-shrink-0 text-sm text-gray-500">{posting.location}</div>
          <div className="flex-shrink-0">
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
              {STATUS_LABELS[posting.status]}
            </span>
          </div>
          <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <PriorityStars priority={posting.priority} onChange={(p) => onPriorityChange(posting.id, p)} size="sm" />
          </div>
          <div className={`flex flex-shrink-0 items-center gap-1 text-xs ${daysColorClass}`}>
            {isStale && (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {getDaysSinceLabel(posting.dateModified)}
          </div>
          <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <ConnectionBadge connections={linkedConnections} onClick={onConnectionClick} size="sm" />
          </div>
        </div>
      </ContextMenu>
    );
  }

  return (
    <ContextMenu items={contextMenuItems}>
      <div
        onClick={() => onSelect(posting.id)}
        className={`cursor-pointer rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${
          isStale ? 'border-red-200' : 'border-gray-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            {posting.companyLogo ? (
              <img src={posting.companyLogo} alt={posting.company} className="h-10 w-10 rounded object-contain" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-200 text-sm font-medium text-gray-600">
                {getInitials(posting.company)}
              </div>
            )}
            {isStale && (
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-100">
                <svg className="h-3 w-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-gray-900">{posting.title}</p>
            <p className="truncate text-sm text-gray-600">{posting.company}</p>
            <p className="truncate text-xs text-gray-500">{posting.location}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <PriorityStars priority={posting.priority} onChange={(p) => onPriorityChange(posting.id, p)} size="sm" />
            <div className="flex gap-1 overflow-hidden">
              {posting.tags.slice(0, 2).map((tag) => (
                <TagChip key={tag} tag={tag} size="sm" />
              ))}
              {posting.tags.length > 2 && (
                <span className="text-xs text-gray-400">+{posting.tags.length - 2}</span>
              )}
            </div>
            <ConnectionBadge connections={linkedConnections} onClick={onConnectionClick} size="sm" />
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
