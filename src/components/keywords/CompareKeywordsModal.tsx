import { useMemo, useId } from 'react';
import { Posting, ExtractedKeyword, KeywordCategory, KEYWORD_CATEGORY_LABELS } from '@/types';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface CompareKeywordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postings: Posting[];
}

interface ComparisonResult {
  common: ExtractedKeyword[];
  unique: Map<string, ExtractedKeyword[]>; // postingId -> unique keywords
  coverage: Map<string, { total: number; addressed: number; percentage: number }>;
}

/**
 * Compare keywords across multiple job postings
 * Shows common keywords and unique ones per posting
 */
export function CompareKeywordsModal({ isOpen, onClose, postings }: CompareKeywordsModalProps) {
  const titleId = useId();
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen);

  const comparison = useMemo((): ComparisonResult => {
    const common: ExtractedKeyword[] = [];
    const unique = new Map<string, ExtractedKeyword[]>();
    const coverage = new Map<string, { total: number; addressed: number; percentage: number }>();

    if (postings.length < 2) {
      return { common, unique, coverage };
    }

    // Build keyword maps for each posting
    const keywordMaps = postings.map((p) => {
      const map = new Map<string, ExtractedKeyword>();
      (p.keywords || []).forEach((k) => map.set(k.term.toLowerCase(), k));
      return { postingId: p.id, map };
    });

    // Find common keywords (appear in ALL postings)
    const firstPostingKeywords = keywordMaps[0]?.map || new Map();
    const commonTerms = new Set<string>();

    firstPostingKeywords.forEach((keyword, term) => {
      const appearsInAll = keywordMaps.every(({ map }) => map.has(term));
      if (appearsInAll) {
        commonTerms.add(term);
        common.push(keyword);
      }
    });

    // Find unique keywords per posting
    keywordMaps.forEach(({ postingId, map }) => {
      const uniqueKeywords: ExtractedKeyword[] = [];
      map.forEach((keyword, term) => {
        if (!commonTerms.has(term)) {
          uniqueKeywords.push(keyword);
        }
      });
      unique.set(postingId, uniqueKeywords);
    });

    // Calculate coverage per posting
    postings.forEach((p) => {
      const keywords = p.keywords || [];
      const total = keywords.length;
      const addressed = keywords.filter((k) => k.addressed).length;
      coverage.set(p.id, {
        total,
        addressed,
        percentage: total > 0 ? Math.round((addressed / total) * 100) : 0,
      });
    });

    // Sort common by importance
    common.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.importance] - order[b.importance];
    });

    return { common, unique, coverage };
  }, [postings]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div
        className="modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="modal modal-lg max-h-[80vh] flex flex-col" ref={modalRef}>
          <div className="modal-header">
            <h2 id={titleId} className="modal-title">
              Compare Keywords ({postings.length} jobs)
            </h2>
            <button
              onClick={onClose}
              aria-label="Close comparison"
              className="modal-close focus-visible:ring-2 focus-visible:ring-wine"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="modal-body overflow-y-auto flex-1">
            {/* Job summary cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {postings.map((posting) => {
                const cov = comparison.coverage.get(posting.id);
                return (
                  <div
                    key={posting.id}
                    className="p-3 bg-champagne-50 rounded-lg border border-champagne-200"
                  >
                    <p className="font-medium text-wine truncate">{posting.title}</p>
                    <p className="text-sm text-wine/60 truncate">{posting.company}</p>
                    {cov && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-champagne-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full"
                            style={{ width: `${cov.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-wine/50">
                          {cov.addressed}/{cov.total}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Common keywords */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-wine mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Common Keywords ({comparison.common.length})
              </h3>
              {comparison.common.length > 0 ? (
                <KeywordGrid keywords={comparison.common} />
              ) : (
                <p className="text-sm text-wine/50 italic">No common keywords found</p>
              )}
            </div>

            {/* Unique keywords per posting */}
            <div>
              <h3 className="text-sm font-semibold text-wine mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Unique Keywords
              </h3>
              <div className="space-y-4">
                {postings.map((posting) => {
                  const uniqueKeywords = comparison.unique.get(posting.id) || [];
                  return (
                    <div key={posting.id} className="border-l-2 border-indigo-200 pl-3">
                      <p className="text-xs font-medium text-wine/70 mb-2">
                        {posting.company} - {posting.title}
                        <span className="ml-2 text-indigo-500">({uniqueKeywords.length})</span>
                      </p>
                      {uniqueKeywords.length > 0 ? (
                        <KeywordGrid keywords={uniqueKeywords} />
                      ) : (
                        <p className="text-xs text-wine/40 italic">All keywords are common</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button onClick={onClose} className="btn btn-primary">
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Grid of keyword chips grouped by category
 */
function KeywordGrid({ keywords }: { keywords: ExtractedKeyword[] }) {
  // Group by category
  const grouped = useMemo(() => {
    const groups = new Map<KeywordCategory, ExtractedKeyword[]>();
    keywords.forEach((k) => {
      const list = groups.get(k.category) || [];
      list.push(k);
      groups.set(k.category, list);
    });
    return groups;
  }, [keywords]);

  return (
    <div className="space-y-2">
      {Array.from(grouped.entries()).map(([category, kws]) => (
        <div key={category}>
          <p className="text-[10px] uppercase tracking-wide text-wine/40 mb-1">
            {KEYWORD_CATEGORY_LABELS[category]}
          </p>
          <div className="flex flex-wrap gap-1">
            {kws.map((k) => (
              <KeywordChip key={k.term} keyword={k} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function KeywordChip({ keyword }: { keyword: ExtractedKeyword }) {
  const importanceColors = {
    high: 'bg-wine/10 text-wine border-wine/20',
    medium: 'bg-pandora/10 text-pandora-700 border-pandora/20',
    low: 'bg-sage/10 text-sage-600 border-sage/20',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs ${importanceColors[keyword.importance]}`}
      title={`${keyword.term} (${keyword.importance} importance, ${keyword.frequency}x)`}
    >
      {keyword.addressed && (
        <svg className="w-3 h-3 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {keyword.term}
    </span>
  );
}

export default CompareKeywordsModal;
