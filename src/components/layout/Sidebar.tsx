import { useState, useEffect } from 'react';

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
};

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  jobCount?: number;
  connectionCount?: number;
}

// Navigation items configuration
const getNavItems = (jobCount?: number, connectionCount?: number): NavItem[] => [
  {
    id: 'jobs',
    label: 'Jobs',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    badge: jobCount,
  },
  {
    id: 'connections',
    label: 'Connections',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    badge: connectionCount,
  },
];

const BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'help',
    label: 'Help',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

// Tooltip component for collapsed state
function Tooltip({ children, label, show }: { children: React.ReactNode; label: string; show: boolean }) {
  const [isHovered, setIsHovered] = useState(false);

  if (!show) return <>{children}</>;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isHovered && (
        <div className="absolute left-full top-1/2 z-tooltip ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-wine-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg">
          {label}
          {/* Arrow */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-wine-600" />
        </div>
      )}
    </div>
  );
}

export function Sidebar({ currentPage, onNavigate, jobCount, connectionCount }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(() => {
    // Load saved preference
    const saved = localStorage.getItem('sidebar-expanded');
    return saved !== null ? saved === 'true' : true;
  });

  // Save preference when it changes
  useEffect(() => {
    localStorage.setItem('sidebar-expanded', String(isExpanded));
  }, [isExpanded]);

  const navItems = getNavItems(jobCount, connectionCount);

  return (
    <aside
      className={`
        flex flex-col bg-wine transition-all duration-slow ease-out
        ${isExpanded ? 'w-56' : 'w-16'}
      `}
    >
      {/* Header */}
      <div className={`flex items-center border-b border-wine-400/30 p-4 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
        {isExpanded && (
          <div className="flex items-center gap-2">
            {/* Logo */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-flatred">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-champagne">JobFlow</span>
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-champagne/70 transition-colors hover:bg-wine-400/20 hover:text-champagne"
          title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <svg
            className={`h-5 w-5 transition-transform duration-slow ${isExpanded ? '' : 'rotate-180'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <Tooltip label={item.label} show={!isExpanded}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`
                      group flex w-full items-center gap-3 rounded-lg px-3 py-2.5
                      transition-all duration-base
                      ${isActive
                        ? 'bg-flatred text-white shadow-md'
                        : 'text-champagne/80 hover:bg-pandora/20 hover:text-pandora'
                      }
                      ${!isExpanded ? 'justify-center' : ''}
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-flatred focus-visible:ring-offset-2 focus-visible:ring-offset-wine
                    `}
                  >
                    <span className={`flex-shrink-0 transition-transform duration-base ${isActive ? '' : 'group-hover:scale-110'}`}>
                      {item.icon}
                    </span>

                    {isExpanded && (
                      <>
                        <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={`
                              rounded-full px-2 py-0.5 text-xs font-bold
                              ${isActive ? 'bg-white/20 text-white' : 'bg-pandora/30 text-pandora'}
                            `}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}

                    {/* Badge for collapsed state */}
                    {!isExpanded && item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-pandora text-[10px] font-bold text-white">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </button>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-wine-400/30" />

      {/* Bottom Navigation */}
      <nav className="p-2">
        <ul className="space-y-1">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <Tooltip label={item.label} show={!isExpanded}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`
                      group flex w-full items-center gap-3 rounded-lg px-3 py-2.5
                      transition-all duration-base
                      ${isActive
                        ? 'bg-flatred text-white shadow-md'
                        : 'text-champagne/60 hover:bg-wine-400/20 hover:text-champagne'
                      }
                      ${!isExpanded ? 'justify-center' : ''}
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-flatred focus-visible:ring-offset-2 focus-visible:ring-offset-wine
                    `}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {isExpanded && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </button>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer - Keyboard shortcut hint */}
      {isExpanded && (
        <div className="border-t border-wine-400/30 p-4">
          <p className="text-xs text-champagne/50">
            Press <kbd className="rounded bg-wine-400/30 px-1.5 py-0.5 font-mono text-champagne/70">?</kbd> for shortcuts
          </p>
        </div>
      )}
    </aside>
  );
}
