import { Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import ProfileDropdown from '../ProfileDropdown';
import { useTheme } from '@/lib/theme';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            aria-label="Search"
            className="w-64 rounded-lg border-none bg-gray-100 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 transition-all focus:bg-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          type="button"
          title="Notifications"
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-burst-600" />
        </motion.button>

        <ProfileDropdown onThemeToggle={toggleTheme} isDarkMode={isDarkMode} />
      </div>
    </header>
  );
};

export default Header;
