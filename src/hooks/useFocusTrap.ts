import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to trap focus within a container (for modals, dialogs, etc.)
 * Returns a ref to attach to the container element
 */
export function useFocusTrap<T extends HTMLElement>(isActive: boolean) {
  const containerRef = useRef<T>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Get all focusable elements within container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter((el) => el.offsetParent !== null); // Only visible elements
  }, []);

  // Handle tab key to trap focus
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: if on first, go to last
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab: if on last, go to first
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [getFocusableElements]
  );

  useEffect(() => {
    if (!isActive) return;

    // Store current active element
    previousActiveElement.current = document.activeElement;

    // Focus first focusable element
    const focusable = getFocusableElements();
    if (focusable.length > 0) {
      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => {
        focusable[0].focus();
      });
    }

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus to previous element
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, getFocusableElements, handleKeyDown]);

  return containerRef;
}
