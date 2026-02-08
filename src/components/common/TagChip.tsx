interface TagChipProps {
  tag: string;
  onRemove?: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function TagChip({ tag, onRemove, size = 'sm', className = '' }: TagChipProps) {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1 rounded bg-wine/10 text-wine/70 whitespace-nowrap ${sizeClasses} ${className}`}>
      {tag}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded hover:bg-wine/20 hover:text-wine"
        >
          <svg className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </span>
  );
}
