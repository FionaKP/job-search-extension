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
      { keys: '1', description: 'Filter to Saved' },
      { keys: '2', description: 'Filter to In Progress' },
      { keys: '3', description: 'Filter to Applied' },
      { keys: '4', description: 'Filter to Interviewing' },
      { keys: '5', description: 'Filter to Offer' },
      { keys: '6', description: 'Filter to Accepted' },
      { keys: '7', description: 'Filter to Rejected' },
      { keys: '0', description: 'Clear status filter' },
    ],
  },
  {
    title: 'Card Navigation',
    shortcuts: [
      { keys: 'J / ↓', description: 'Next card' },
      { keys: 'K / ↑', description: 'Previous card' },
      { keys: '↵', description: 'Open detail panel' },
    ],
  },
  {
    title: 'Card Actions',
    shortcuts: [
      { keys: 'S', description: 'Cycle priority' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="relative max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 text-sm font-semibold uppercase text-gray-500">{group.title}</h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut) => (
                  <div key={shortcut.keys} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-gray-600">{shortcut.description}</span>
                    <kbd className="rounded bg-gray-100 px-2 py-1 text-xs font-mono text-gray-700">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 text-center text-sm text-gray-500">
          Press <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}
