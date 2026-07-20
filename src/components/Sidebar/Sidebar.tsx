import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
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
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/auth/useAuth';
import { useSidebar } from '@/lib/SidebarContext';
import { APP_NAME, SIDEBAR_ITEMS } from '@/config';
import { ComponentType } from 'react';

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  BookOpen,
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
};

const Sidebar = () => {
  const [isReady, setIsReady] = useState(false);
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { logout } = useAuth();
  const location = useLocation();

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
      className="fixed left-0 top-0 z-30 h-screen border-r border-gray-200 bg-white"
    >
      <div className="flex h-full flex-col">
        <div className="relative flex h-16 items-center border-b border-gray-200 px-4">
          {isCollapsed ? (
            <div className="absolute left-6 flex items-center justify-center">
              <img
                src="/logo/logo.jpg"
                alt="Logo"
                className="h-8 w-8 rounded-full object-cover shadow-sm"
              />
            </div>
          ) : (
            <div className="absolute left-4 flex items-center gap-2">
              <img
                src="/logo/logo.jpg"
                alt="Logo"
                className="h-8 w-8 rounded-full object-cover shadow-sm"
              />
              <span className="text-base font-bold text-gray-900">{APP_NAME}</span>
            </div>
          )}
          <button
            type="button"
            onClick={toggleSidebar}
            className="absolute right-4 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <motion.div
              initial={false}
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: isReady ? 0.15 : 0 }}
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </motion.div>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {SIDEBAR_ITEMS.map((item) => {
            const IconComponent = iconMap[item.icon];
            const active = isActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isReady ? 'transition-all duration-150' : ''
                } ${
                  active
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:translate-x-1 hover:bg-gray-100 hover:text-gray-900'
                }`}
                title={isCollapsed ? item.title : undefined}
              >
                {IconComponent && (
                  <IconComponent
                    className={`h-5 w-5 ${isReady ? 'transition-transform duration-150 group-hover:scale-110' : ''}`}
                  />
                )}
                {!isCollapsed && <span>{item.title}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 px-3 py-4">
          <button
            type="button"
            onClick={logout}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 ${
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
