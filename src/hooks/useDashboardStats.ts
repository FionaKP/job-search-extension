import { useMemo } from 'react';
import { Posting, PostingStatus, isTerminalStatus } from '@/types';

export interface DashboardStats {
  total: number;
  active: number; // Non-terminal statuses
  thisWeek: number; // Added in last 7 days
  stale: number; // Needs action (7+ days, non-terminal)
  byStatus: Record<PostingStatus, number>;
}

function isStale(posting: Posting): boolean {
  if (isTerminalStatus(posting.status)) return false;
  const daysSinceUpdate = (Date.now() - posting.dateModified) / (1000 * 60 * 60 * 24);
  return daysSinceUpdate >= 7;
}

function isAddedThisWeek(posting: Posting): boolean {
  const daysSinceAdded = (Date.now() - posting.dateAdded) / (1000 * 60 * 60 * 24);
  return daysSinceAdded <= 7;
}

export function useDashboardStats(postings: Posting[]): DashboardStats {
  return useMemo(() => {
    const byStatus: Record<PostingStatus, number> = {
      saved: 0,
      in_progress: 0,
      applied: 0,
      interviewing: 0,
      offer: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0,
    };

    let active = 0;
    let thisWeek = 0;
    let staleCount = 0;

    postings.forEach((posting) => {
      byStatus[posting.status]++;

      if (!isTerminalStatus(posting.status)) {
        active++;
      }

      if (isAddedThisWeek(posting)) {
        thisWeek++;
      }

      if (isStale(posting)) {
        staleCount++;
      }
    });

    return {
      total: postings.length,
      active,
      thisWeek,
      stale: staleCount,
      byStatus,
    };
  }, [postings]);
}
