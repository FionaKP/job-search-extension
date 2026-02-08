interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-[1.5px]',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-2',
  };

  return (
    <div
      className={`rounded-full border-wine/20 border-t-wine animate-spin ${sizeClasses[size]} ${className}`}
    />
  );
}

// Full page loading overlay
interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <span className="text-sm text-wine/70">{message}</span>
      </div>
    </div>
  );
}

// Inline loading state
interface InlineLoadingProps {
  message?: string;
  className?: string;
}

export function InlineLoading({ message, className = '' }: InlineLoadingProps) {
  return (
    <div className={`flex items-center gap-2 text-wine/60 ${className}`}>
      <Spinner size="sm" />
      {message && <span className="text-sm">{message}</span>}
    </div>
  );
}

// Button loading state (replaces button content)
export function ButtonLoading({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Spinner size="sm" className="border-current border-t-white" />
      <span>Loading...</span>
    </div>
  );
}

// Progress bar for bulk operations
interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ progress, className = '', showLabel = true }: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={className}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-champagne-100">
        <div
          className="h-full bg-teal transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-xs text-wine/60 text-right">
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  );
}

// Dots loading animation
export function DotsLoading({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="w-2 h-2 rounded-full bg-wine/40 animate-pulse" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 rounded-full bg-wine/40 animate-pulse" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 rounded-full bg-wine/40 animate-pulse" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

// Save indicator (shows saving/saved states)
interface SaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  className?: string;
}

export function SaveIndicator({ status, className = '' }: SaveIndicatorProps) {
  if (status === 'idle') return null;

  return (
    <div className={`flex items-center gap-1.5 text-xs ${className}`}>
      {status === 'saving' && (
        <>
          <Spinner size="sm" className="border-sage/40 border-t-sage" />
          <span className="text-sage">Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <svg className="w-4 h-4 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-teal">Saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <svg className="w-4 h-4 text-flatred" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="text-flatred">Error saving</span>
        </>
      )}
    </div>
  );
}
