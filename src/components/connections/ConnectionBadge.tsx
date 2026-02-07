import { Connection } from '@/types';

interface ConnectionBadgeProps {
  connections: Connection[];
  onClick?: () => void;
  size?: 'sm' | 'md';
}

export function ConnectionBadge({ connections, onClick, size = 'sm' }: ConnectionBadgeProps) {
  if (connections.length === 0) return null;

  const names = connections.map((c) => c.name).slice(0, 3);
  const tooltipText = names.join(', ') + (connections.length > 3 ? ` +${connections.length - 3} more` : '');

  const sizeClasses = size === 'sm'
    ? 'text-xs gap-1 px-1.5 py-0.5'
    : 'text-sm gap-1.5 px-2 py-1';

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`flex items-center ${sizeClasses} bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors`}
      title={tooltipText}
    >
      <svg className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <span>{connections.length}</span>
    </button>
  );
}

export default ConnectionBadge;
