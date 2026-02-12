import { useEffect } from 'react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string; description: string }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Global',
    shortcuts: [
      { keys: '/', description: 'Focus search' },
      { keys: '⌘K', description: 'Focus search (alt)' },
      { keys: 'Esc', description: 'Close panel / clear search' },
      { keys: '?', description: 'Show this help' },
      { keys: 'N', description: 'New posting' },
    ],
  },
  {
    title: 'Status Filter',
    shortcuts: [
      { keys: '1-7', description: 'Filter by status' },
      { keys: '0', description: 'Clear status filter' },
    ],
  },
  {
    title: 'Card Navigation',
    shortcuts: [
      { keys: 'J / ↓', description: 'Next card' },
      { keys: 'K / ↑', description: 'Previous card' },
      { keys: 'Space', description: 'Toggle detail panel' },
      { keys: '↵', description: 'Open detail panel' },
    ],
  },
  {
    title: 'Card Actions',
    shortcuts: [
      { keys: 'S / →', description: 'Move to next status' },
      { keys: '⇧S / ←', description: 'Move to previous status' },
      { keys: 'P', description: 'Cycle priority stars' },
      { keys: 'O', description: 'Open original URL' },
      { keys: 'D', description: 'Delete posting' },
    ],
  },
];

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose} />

      {/* Modal Container */}
      <div className="modal-container">
        <div className="modal modal-lg">
          <div className="modal-header">
            <h2 className="modal-title">Keyboard Shortcuts</h2>
            <button onClick={onClose} className="modal-close">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="modal-body">
            <div className="grid gap-6 sm:grid-cols-2">
              {SHORTCUT_GROUPS.map((group) => (
                <div key={group.title}>
                  <h3 className="mb-3 text-sm font-semibold uppercase text-sage">{group.title}</h3>
                  <div className="space-y-2">
                    {group.shortcuts.map((shortcut) => (
                      <div key={shortcut.keys} className="flex items-center justify-between gap-4">
                        <span className="text-sm text-wine/70">{shortcut.description}</span>
                        <kbd className="rounded bg-champagne-100 px-2 py-1 text-xs font-mono text-wine">
                          {shortcut.keys}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer justify-center">
            <span className="text-sm text-wine/60">
              Press <kbd className="rounded bg-champagne-100 px-1.5 py-0.5 font-mono text-xs text-wine">Esc</kbd> to close
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
