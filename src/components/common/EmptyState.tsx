import { ReactNode } from 'react';

type EmptyStateType = 'postings' | 'search' | 'connections' | 'notes' | 'keywords' | 'generic';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const EMPTY_STATE_CONFIG: Record<EmptyStateType, { icon: ReactNode; title: string; description: string }> = {
  postings: {
    icon: (
      <svg className="w-16 h-16 text-champagne-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'No job postings yet',
    description: 'Start tracking your job applications by saving postings from job sites.',
  },
  search: {
    icon: (
      <svg className="w-16 h-16 text-champagne-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'No results found',
    description: 'Try adjusting your search or filters to find what you\'re looking for.',
  },
  connections: {
    icon: (
      <svg className="w-16 h-16 text-champagne-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'No connections yet',
    description: 'Add your professional connections to link them with job postings.',
  },
  notes: {
    icon: (
      <svg className="w-16 h-16 text-champagne-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    title: 'No notes',
    description: 'Add notes to keep track of important details about this opportunity.',
  },
  keywords: {
    icon: (
      <svg className="w-16 h-16 text-champagne-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    title: 'No keywords extracted',
    description: 'Extract keywords from the job description to highlight matching skills.',
  },
  generic: {
    icon: (
      <svg className="w-16 h-16 text-champagne-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
    title: 'Nothing here',
    description: 'There\'s nothing to display at the moment.',
  },
};

export function EmptyState({
  type = 'generic',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[type];

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {/* Icon with subtle background */}
      <div className="mb-4 rounded-full bg-champagne-50 p-4">
        {config.icon}
      </div>

      {/* Title */}
      <h3 className="text-lg font-medium text-wine mb-1">
        {title || config.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-wine/60 max-w-sm mb-4">
        {description || config.description}
      </p>

      {/* Optional action */}
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
}

// Compact variant for inline use
export function EmptyStateInline({
  message,
  className = '',
}: {
  message: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center py-8 text-wine/50 text-sm ${className}`}>
      <span>{message}</span>
    </div>
  );
}
