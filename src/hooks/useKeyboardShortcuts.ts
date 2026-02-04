import { useEffect, useCallback } from 'react';

type ShortcutHandler = () => void;

interface ShortcutConfig {
  key: string;
  handler: ShortcutHandler;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  allowInInput?: boolean; // Allow shortcut even when typing in input/textarea
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInInput =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable;

      for (const shortcut of shortcuts) {
        // Skip if in input and shortcut doesn't allow it (except Escape which always works)
        if (isInInput && !shortcut.allowInInput && e.key !== 'Escape') {
          continue;
        }

        // Check modifiers
        const metaMatch = shortcut.meta ? e.metaKey : !e.metaKey;
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey : !e.ctrlKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;

        // Check key (case-insensitive for letters)
        const keyMatch =
          e.key.toLowerCase() === shortcut.key.toLowerCase() ||
          e.key === shortcut.key;

        if (keyMatch && metaMatch && ctrlMatch && shiftMatch) {
          e.preventDefault();
          shortcut.handler();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Helper to create shortcut label for display
export function getShortcutLabel(config: Partial<ShortcutConfig>): string {
  const parts: string[] = [];
  if (config.meta) parts.push('⌘');
  if (config.ctrl) parts.push('Ctrl');
  if (config.shift) parts.push('⇧');

  let key = config.key || '';
  // Format special keys
  switch (key) {
    case 'Escape':
      key = 'Esc';
      break;
    case 'ArrowUp':
      key = '↑';
      break;
    case 'ArrowDown':
      key = '↓';
      break;
    case 'ArrowLeft':
      key = '←';
      break;
    case 'ArrowRight':
      key = '→';
      break;
    case ' ':
      key = 'Space';
      break;
    case 'Enter':
      key = '↵';
      break;
    default:
      // Capitalize single letters
      if (key.length === 1) key = key.toUpperCase();
  }

  parts.push(key);
  return parts.join('+');
}
