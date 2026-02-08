import { useState } from 'react';
import { ExtractedKeyword } from '@/types';
import { KeywordContextPopover } from './KeywordContextPopover';

interface KeywordItemProps {
  keyword: ExtractedKeyword;
  onToggleAddressed: (term: string, addressed: boolean) => void;
}

export function KeywordItem({ keyword, onToggleAddressed }: KeywordItemProps) {
  const [showContext, setShowContext] = useState(false);

  const importanceDots = (
    <span className="flex gap-0.5" title={`${keyword.importance} importance`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`inline-block w-1.5 h-1.5 rounded-full ${
            (keyword.importance === 'high' && i < 3) ||
            (keyword.importance === 'medium' && i < 2) ||
            (keyword.importance === 'low' && i < 1)
              ? 'bg-teal'
              : 'bg-sage/30'
          }`}
        />
      ))}
    </span>
  );

  return (
    <div className="relative">
      <div className="flex items-center gap-2 py-1.5 group">
        <input
          type="checkbox"
          checked={keyword.addressed}
          onChange={(e) => onToggleAddressed(keyword.term, e.target.checked)}
          className="checkbox checkbox-sm"
        />
        <button
          onClick={() => setShowContext(!showContext)}
          className={`flex-1 text-left text-sm ${
            keyword.addressed ? 'text-sage line-through' : 'text-wine'
          } hover:text-wine/70 transition-colors`}
        >
          {keyword.term}
        </button>
        {importanceDots}
        <span className="text-xs text-sage opacity-0 group-hover:opacity-100 transition-opacity">
          {keyword.frequency}x
        </span>
      </div>

      {showContext && keyword.contexts && keyword.contexts.length > 0 && (
        <KeywordContextPopover
          keyword={keyword}
          onClose={() => setShowContext(false)}
        />
      )}
    </div>
  );
}

export default KeywordItem;
