import { useState, useRef, useEffect } from 'react';

interface TagFilterDropdownProps {
  availableTags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export function TagFilterDropdown({
  availableTags,
  selectedTags,
  onChange,
}: TagFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const hasSelection = selectedTags.length > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
          hasSelection
            ? 'border-wine bg-champagne-50 text-wine'
            : 'border-sage/30 bg-white text-wine hover:bg-champagne-50'
        }`}
      >
        <span>Tags</span>
        {hasSelection && (
          <span className="rounded-full bg-wine px-1.5 py-0.5 text-xs text-white">
            {selectedTags.length}
          </span>
        )}
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 z-20 mt-1 w-56 rounded-md bg-white py-1 shadow-lg ring-1 ring-sage/20">
          {availableTags.length === 0 ? (
            <div className="px-4 py-2 text-sm text-sage">No tags available</div>
          ) : (
            <>
              <div className="max-h-60 overflow-y-auto">
                {availableTags.map((tag) => (
                  <label
                    key={tag}
                    className="checkbox-label px-4 py-2 hover:bg-champagne-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                      className="checkbox checkbox-sm"
                    />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
              {hasSelection && (
                <div className="border-t border-sage/20 px-4 py-2">
                  <button
                    onClick={() => onChange([])}
                    className="text-sm text-flatred hover:text-flatred-600"
                  >
                    Clear selection
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
