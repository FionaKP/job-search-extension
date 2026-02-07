import { ExtractedKeyword } from '@/types';

interface KeywordContextPopoverProps {
  keyword: ExtractedKeyword;
  onClose: () => void;
}

export function KeywordContextPopover({ keyword, onClose }: KeywordContextPopoverProps) {
  if (!keyword.contexts || keyword.contexts.length === 0) {
    return null;
  }

  // Highlight the keyword in context
  const highlightTerm = (context: string) => {
    const escapedTerm = keyword.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    const parts = context.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className="mt-1 mb-2 ml-6 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-700">
          "{keyword.term}" appears {keyword.frequency} time{keyword.frequency !== 1 ? 's' : ''}
        </span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-2">
        {keyword.contexts.map((context, index) => (
          <div key={index} className="text-gray-600 text-xs leading-relaxed">
            <span className="text-gray-400 mr-1">{index + 1}.</span>
            {highlightTerm(context)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default KeywordContextPopover;
