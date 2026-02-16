import { useState, useRef, useEffect, ReactNode, MouseEvent as ReactMouseEvent, useCallback } from 'react';

interface MenuItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  danger?: boolean;
  divider?: boolean;
}

interface ContextMenuProps {
  children: ReactNode;
  items: MenuItem[];
}

export function ContextMenu({ children, items }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Filter out dividers for keyboard navigation
  const actionItems = items.filter(item => !item.divider);

  const focusItem = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, actionItems.length - 1));
    setFocusedIndex(clampedIndex);
    // Find the actual index in the full items array
    let actualIndex = 0;
    let count = 0;
    for (let i = 0; i < items.length; i++) {
      if (!items[i].divider) {
        if (count === clampedIndex) {
          actualIndex = i;
          break;
        }
        count++;
      }
    }
    itemRefs.current[actualIndex]?.focus();
  }, [actionItems.length, items]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          setIsOpen(false);
          break;
        case 'ArrowDown':
          e.preventDefault();
          focusItem(focusedIndex + 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          focusItem(focusedIndex - 1);
          break;
        case 'Home':
          e.preventDefault();
          focusItem(0);
          break;
        case 'End':
          e.preventDefault();
          focusItem(actionItems.length - 1);
          break;
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, focusedIndex, focusItem, actionItems.length]);

  // Focus first item when menu opens
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(0);
      requestAnimationFrame(() => focusItem(0));
    }
  }, [isOpen, focusItem]);

  const handleContextMenu = (e: ReactMouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  };

  const handleItemClick = (item: MenuItem) => {
    item.onClick();
    setIsOpen(false);
  };

  return (
    <>
      <div onContextMenu={handleContextMenu}>{children}</div>
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Context menu"
          className="fixed z-50 min-w-[160px] rounded-md bg-white py-1 shadow-lg ring-1 ring-sage/20"
          style={{ left: position.x, top: position.y }}
        >
          {items.map((item, index) => (
            item.divider ? (
              <div key={index} className="my-1 border-t border-sage/20" role="separator" />
            ) : (
              <button
                key={index}
                ref={el => itemRefs.current[index] = el}
                role="menuitem"
                onClick={() => handleItemClick(item)}
                className={`btn btn-ghost !h-auto !justify-start w-full gap-2 px-4 py-2 text-left text-sm rounded-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-wine ${
                  item.danger ? 'text-flatred hover:bg-flatred-50' : ''
                }`}
              >
                {item.icon && <span aria-hidden="true">{item.icon}</span>}
                {item.label}
              </button>
            )
          ))}
        </div>
      )}
    </>
  );
}
