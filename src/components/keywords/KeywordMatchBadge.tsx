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

  // Color based on coverage - simple pill style without border
  const coverageColor =
    stats.percentage >= 75
      ? 'bg-teal-100 text-teal-700'
      : stats.percentage >= 50
        ? 'bg-pandora-100 text-pandora-700'
        : 'bg-sage/20 text-sage-600';

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {/* Coverage badge */}
      <span
        className={`rounded-full font-medium ${sizeClasses} ${coverageColor}`}
        title={`${stats.addressed}/${stats.total} keywords addressed (${stats.percentage}%)`}
      >
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
