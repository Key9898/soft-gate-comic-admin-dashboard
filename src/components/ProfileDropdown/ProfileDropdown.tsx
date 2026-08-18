import { useState, useRef, useEffect, type ReactNode } from 'react';
import { User, Settings, LogOut, Moon, Sun, Monitor, HelpCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/features/auth/useAuth';
import { useNavigate } from 'react-router-dom';
import { formatAdminRole } from '@/lib/format';
import { ThemePreference, useTheme } from '@/lib/theme';

const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: ReactNode;
}[] = [
  { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
  { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
];

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { preference, resolvedTheme, setPreference } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const menuItems = [
    {
      icon: <User className="h-4 w-4" />,
      label: 'My Profile',
      onClick: () => {
        navigate('/profile');
        setIsOpen(false);
      },
    },
    {
      icon: <Settings className="h-4 w-4" />,
      label: 'Settings',
      onClick: () => {
        navigate('/settings');
        setIsOpen(false);
      },
    },
    {
      icon: <HelpCircle className="h-4 w-4" />,
      label: 'Help & Support',
      onClick: () => {
        setIsOpen(false);
        setIsHelpOpen(true);
      },
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-lg border-l border-line p-2 pl-4 transition-colors hover:bg-sg-hover"
      >
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary-100 dark:bg-primary-900">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.displayName} className="h-8 w-8 object-cover" />
          ) : (
            <User className="h-4 w-4 text-primary-600 dark:text-primary-300" />
          )}
        </div>
        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium text-fg">{user?.displayName || 'Admin'}</p>
          <p className="text-xs text-fg-muted">{formatAdminRole(user?.role)}</p>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-line bg-surface py-2 shadow-lg"
          >
            <div className="border-b border-line px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary-100 dark:bg-primary-900">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="h-10 w-10 object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-primary-600 dark:text-primary-300" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-fg">{user?.displayName || 'Admin'}</p>
                  <p className="text-xs text-fg-muted">
                    {user?.email || 'admin@softgatecomic.com'}
                  </p>
                  <span className="mt-1 inline-block rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                    {formatAdminRole(user?.role)}
                  </span>
                </div>
              </div>
            </div>

            <div className="py-2">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15, delay: index * 0.03 }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-fg-secondary transition-colors hover:bg-sg-hover"
                >
                  {item.icon}
                  {item.label}
                </motion.button>
              ))}
            </div>

            <div className="border-t border-line px-2 py-2">
              <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-fg-muted">
                Theme
              </p>
              {THEME_OPTIONS.map((option) => {
                const selected = preference === option.value;
                const resolvedLabel = resolvedTheme === 'dark' ? 'Dark' : 'Light';
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setPreference(option.value);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors ${
                      selected
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                        : 'text-fg-secondary hover:bg-sg-hover'
                    }`}
                  >
                    {option.icon}
                    <span className="flex-1 text-left">
                      <span className="block">{option.label}</span>
                      {selected && (
                        <span className="block text-xs font-normal text-fg-muted">
                          {option.value === 'system'
                            ? `Using ${resolvedLabel}`
                            : `Active: ${resolvedLabel}`}
                        </span>
                      )}
                    </span>
                    {selected && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-line pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isHelpOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsHelpOpen(false)} />
          <div className="relative mx-4 w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-fg">Help & Support</h3>
            <p className="mt-2 text-sm text-fg-secondary">
              Need help with SoftGate Comic Admin? Reach the SoftGate team using the contacts below.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-fg-secondary">
              <li>
                Email:{' '}
                <a
                  className="text-primary-600 hover:underline dark:text-primary-400"
                  href="mailto:admin@softgatecomic.com"
                >
                  admin@softgatecomic.com
                </a>
              </li>
              <li>
                Website:{' '}
                <a
                  className="text-primary-600 hover:underline dark:text-primary-400"
                  href="https://softgatecomic.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  softgatecomic.com
                </a>
              </li>
            </ul>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
