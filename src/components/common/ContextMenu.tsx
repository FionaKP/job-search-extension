import { useState, useRef, useEffect, ReactNode, MouseEvent as ReactMouseEvent } from 'react';

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
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

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
          className="fixed z-50 min-w-[160px] rounded-md bg-white py-1 shadow-lg ring-1 ring-sage/20"
          style={{ left: position.x, top: position.y }}
        >
          {items.map((item, index) => (
            item.divider ? (
              <div key={index} className="my-1 border-t border-sage/20" />
            ) : (
              <button
                key={index}
                onClick={() => handleItemClick(item)}
                className={`btn btn-ghost !h-auto !justify-start w-full gap-2 px-4 py-2 text-left text-sm rounded-none ${
                  item.danger ? 'text-flatred hover:bg-flatred-50' : ''
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            )
          ))}
        </div>
      )}
    </>
  );
}
