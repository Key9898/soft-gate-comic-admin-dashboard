import { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, Moon, Sun, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/features/auth/useAuth';
import { useNavigate } from 'react-router-dom';

interface ProfileDropdownProps {
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

const ProfileDropdown = ({ onThemeToggle, isDarkMode }: ProfileDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
      icon: isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
      label: isDarkMode ? 'Light Mode' : 'Dark Mode',
      onClick: () => {
        onThemeToggle();
        setIsOpen(false);
      },
    },
    {
      icon: <HelpCircle className="h-4 w-4" />,
      label: 'Help & Support',
      onClick: () => setIsOpen(false),
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-lg border-l border-gray-200 p-2 pl-4 transition-colors hover:bg-gray-50"
      >
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary-100">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.displayName} className="h-8 w-8 object-cover" />
          ) : (
            <User className="h-4 w-4 text-primary-600" />
          )}
        </div>
        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium text-gray-900">{user?.displayName || 'Admin'}</p>
          <p className="text-xs capitalize text-gray-500">{user?.role || 'admin'}</p>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white py-2 shadow-lg"
          >
            <div className="border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary-100">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="h-10 w-10 object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-primary-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.displayName || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</p>
                  <span className="mt-1 inline-block rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium capitalize text-primary-700">
                    {user?.role || 'admin'}
                  </span>
                </div>
              </div>
            </div>

            <div className="py-2">
              {menuItems.map((item, index) => (
                <motion.button
                  key={index}
                  onClick={item.onClick}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15, delay: index * 0.03 }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  {item.icon}
                  {item.label}
                </motion.button>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-2">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;
