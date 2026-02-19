import { useMemo } from 'react';
import { ExtractedKeyword } from '@/types';

interface KeywordMatchBadgeProps {
  keywords?: ExtractedKeyword[];
  size?: 'sm' | 'md';
  showTopKeywords?: boolean;
}

/**
 * Small badge showing keyword coverage and optionally top keywords
 * Used on PostingCard to give quick visibility into keyword match
 */
export function KeywordMatchBadge({
  keywords,
  size = 'sm',
  showTopKeywords = false,
}: KeywordMatchBadgeProps) {
  const stats = useMemo(() => {
    if (!keywords || keywords.length === 0) {
      return null;
    }

    const total = keywords.length;
    const addressed = keywords.filter((k) => k.addressed).length;
    const percentage = Math.round((addressed / total) * 100);

    // Get top 3 high-importance keywords
    const topKeywords = keywords
      .filter((k) => k.importance === 'high')
      .slice(0, 3)
      .map((k) => k.term);

    return { total, addressed, percentage, topKeywords };
  }, [keywords]);

  if (!stats) {
    return null;
  }

  const sizeClasses = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1';

  // Color based on coverage
  const coverageColor =
    stats.percentage >= 75
      ? 'bg-teal-50 text-teal-700 border-teal-200'
      : stats.percentage >= 50
        ? 'bg-pandora-50 text-pandora-700 border-pandora-200'
        : 'bg-sage-50 text-sage-600 border-sage-200';

  return (
    <div className="flex items-center gap-1">
      {/* Coverage badge */}
      <span
        className={`inline-flex items-center gap-0.5 rounded border font-medium ${sizeClasses} ${coverageColor}`}
        title={`${stats.addressed}/${stats.total} keywords addressed (${stats.percentage}%)`}
      >
        <svg
          className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
        {stats.percentage}%
      </span>

      {/* Top keywords preview */}
      {showTopKeywords && stats.topKeywords.length > 0 && (
        <div className="flex gap-0.5 overflow-hidden">
          {stats.topKeywords.slice(0, 2).map((term) => (
            <span
              key={term}
              className="text-[10px] px-1 py-0.5 bg-indigo-50 text-indigo-600 rounded truncate max-w-[60px]"
              title={term}
            >
              {term}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default KeywordMatchBadge;
