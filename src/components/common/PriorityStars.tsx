import { InterestLevel } from '@/types';

interface InterestStarsProps {
  interest: InterestLevel;
  onChange?: (interest: InterestLevel) => void;
  size?: 'sm' | 'md';
  readOnly?: boolean;
}

// Alias for backwards compatibility during migration
interface PriorityStarsProps {
  priority: InterestLevel;
  onChange?: (priority: InterestLevel) => void;
  size?: 'sm' | 'md';
  readOnly?: boolean;
}

export function InterestStars({ interest, onChange, size = 'md', readOnly = false }: InterestStarsProps) {
  const sizeClasses = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const gapClass = size === 'sm' ? 'gap-0' : 'gap-0.5';

  const handleClick = (star: InterestLevel) => {
    if (!readOnly && onChange) {
      onChange(star);
    }
  };

  return (
    <div className={`flex ${gapClass}`} title={`Interest: ${interest}/5`}>
      {([1, 2, 3, 4, 5] as const).map((star) => (
        <button
          key={star}
          onClick={() => handleClick(star)}
          disabled={readOnly}
          className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          title={`Interest ${star}`}
        >
          <svg
            className={`${sizeClasses} ${star <= interest ? 'text-pandora' : 'text-sage/30'}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

// Backwards compatible alias - maps priority to interest
export function PriorityStars({ priority, onChange, size = 'md', readOnly = false }: PriorityStarsProps) {
  return (
    <InterestStars
      interest={priority}
      onChange={onChange}
      size={size}
      readOnly={readOnly}
    />
  );
}
