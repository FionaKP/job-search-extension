import { useEffect, useCallback, ReactNode, useId } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface SlideOverPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: string;
}

export function SlideOverPanel({ isOpen, onClose, title, children, width = 'max-w-md' }: SlideOverPanelProps) {
  const titleId = useId();
  const panelRef = useFocusTrap<HTMLDivElement>(isOpen);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      {/* Backdrop with fade animation */}
      <div
        className="absolute inset-0 bg-wine/50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel with slide animation */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 animate-slide-right">
        <div className={`w-screen ${width}`} ref={panelRef}>
          <div className="flex h-full flex-col bg-white shadow-xl">
            {title && (
              <div className="flex items-center justify-between border-b border-sage/20 px-4 py-3">
                <h2 id={titleId} className="text-lg font-semibold text-wine">{title}</h2>
                <button
                  onClick={onClose}
                  aria-label="Close panel"
                  className="rounded-md text-sage hover:text-wine focus:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
