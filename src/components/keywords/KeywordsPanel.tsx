import { useMemo } from 'react';
import {
  ExtractedKeyword,
  KeywordCategory,
  KEYWORD_CATEGORY_LABELS,
  KEYWORD_CATEGORY_ORDER,
} from '@/types';
import { groupKeywordsByCategory, calculateCoverage } from '@/services/keywords';
import { KeywordItem } from './KeywordItem';

interface KeywordsPanelProps {
  keywords: ExtractedKeyword[];
  onToggleAddressed: (term: string, addressed: boolean) => void;
  onRefresh: () => void;
  isExtracting?: boolean;
}

export function KeywordsPanel({
  keywords,
  onToggleAddressed,
  onRefresh,
  isExtracting = false,
}: KeywordsPanelProps) {
  const grouped = useMemo(() => groupKeywordsByCategory(keywords), [keywords]);
  const coverage = useMemo(() => calculateCoverage(keywords), [keywords]);

  if (keywords.length === 0 && !isExtracting) {
    return (
      <div className="p-4 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">No keywords extracted</h3>
        <p className="text-xs text-gray-500 mb-3">
          Extract keywords from the job description to track your application coverage.
        </p>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Extract Keywords
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Keywords Analysis</h3>
          <p className="text-xs text-gray-500">
            {keywords.length} keyword{keywords.length !== 1 ? 's' : ''} extracted
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isExtracting}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
          title="Re-extract keywords"
        >
          <svg
            className={`w-4 h-4 ${isExtracting ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Coverage progress */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Coverage</span>
          <span className="text-sm text-gray-600">
            {coverage.addressed}/{coverage.total} addressed ({coverage.percentage}%)
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${coverage.percentage}%` }}
          />
        </div>
      </div>

      {/* Keywords by category */}
      <div className="space-y-3">
        {KEYWORD_CATEGORY_ORDER.map((category) => {
          const categoryKeywords = grouped[category];
          if (categoryKeywords.length === 0) return null;

          const categoryStats = coverage.byCategory[category];

          return (
            <KeywordCategorySection
              key={category}
              category={category}
              keywords={categoryKeywords}
              addressedCount={categoryStats.addressed}
              totalCount={categoryStats.total}
              onToggleAddressed={onToggleAddressed}
            />
          );
        })}
      </div>
    </div>
  );
}

interface KeywordCategorySectionProps {
  category: KeywordCategory;
  keywords: ExtractedKeyword[];
  addressedCount: number;
  totalCount: number;
  onToggleAddressed: (term: string, addressed: boolean) => void;
}

function KeywordCategorySection({
  category,
  keywords,
  addressedCount,
  totalCount,
  onToggleAddressed,
}: KeywordCategorySectionProps) {
  return (
    <div className="border-t border-gray-100 pt-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {KEYWORD_CATEGORY_LABELS[category]} ({totalCount})
        </h4>
        <span className="text-xs text-gray-400">
          {addressedCount}/{totalCount}
        </span>
      </div>
      <div className="space-y-0.5">
        {keywords.map((keyword) => (
          <KeywordItem
            key={keyword.term}
            keyword={keyword}
            onToggleAddressed={onToggleAddressed}
          />
        ))}
      </div>
    </div>
  );
}

export default KeywordsPanel;
