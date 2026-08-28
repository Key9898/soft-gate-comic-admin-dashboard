import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  PenTool,
  LayoutGrid,
  Coins,
  FileText,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Image,
  Flag,
  History,
  DollarSign,
  Bell,
  Calendar,
  UserPlus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/auth/useAuth';
import { useSidebar } from '@/lib/SidebarContext';
import { useData } from '@/lib/DataContext';
import { APP_NAME, SIDEBAR_SECTIONS } from '@/config';
import { ComponentType } from 'react';

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  BookOpen,
  PenTool,
  LayoutGrid,
  Coins,
  FileText,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Image,
  Flag,
  History,
  DollarSign,
  Bell,
  Calendar,
  UserPlus,
};

const Sidebar = () => {
  const [isReady, setIsReady] = useState(false);
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { logout } = useAuth();
  const { settings } = useData();
  const location = useLocation();
  const brandName = settings.siteName?.trim() || APP_NAME;

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsReady(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: isReady ? 0.15 : 0 }}
      className="fixed left-0 top-0 z-30 h-screen overflow-visible border-r border-line bg-surface"
    >
      <div className="flex h-full flex-col">
        <div className="relative flex h-16 items-center border-b border-line px-4">
          {isCollapsed ? (
            <div className="flex w-full justify-center">
              <img
                src="/logo/logo.svg"
                alt={brandName}
                className="h-8 w-8 rounded-full object-contain shadow-sm"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <img
                src="/logo/logo.svg"
                alt={brandName}
                className="h-8 w-8 rounded-full object-contain shadow-sm"
              />
              <span className="text-base font-bold text-fg">{brandName}</span>
            </div>
          )}
          <button
            type="button"
            onClick={toggleSidebar}
            className="absolute right-0 top-1/2 z-40 flex h-8 w-8 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
          {SIDEBAR_SECTIONS.map((section, index) => (
            <div key={section.label ?? `section-${index}`}>
              {section.label && !isCollapsed ? (
                <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-fg-muted">
                  {section.label}
                </p>
              ) : null}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const IconComponent = iconMap[item.icon];
                  const active = isActive(item.path);
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                        isReady ? 'transition-all duration-150' : ''
                      } ${
                        active
                          ? 'bg-nav-active text-nav-active-fg'
                          : 'text-fg-secondary hover:translate-x-1 hover:bg-sg-hover hover:text-fg'
                      }`}
                      title={isCollapsed ? item.title : undefined}
                    >
                      {active && (
                        <span
                          aria-hidden
                          className="absolute bottom-1.5 left-0 top-1.5 w-1 rounded-full bg-nav-active-bar"
                        />
                      )}
                      {IconComponent && (
                        <IconComponent
                          className={`h-5 w-5 ${isReady ? 'transition-transform duration-150 group-hover:scale-110' : ''}`}
                        />
                      )}
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-line px-3 py-4">
          <button
            type="button"
            onClick={logout}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 ${
              isReady ? 'transition-all duration-150 hover:translate-x-1' : ''
            }`}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut
              className={`h-5 w-5 ${isReady ? 'transition-transform duration-150 group-hover:scale-110' : ''}`}
            />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
