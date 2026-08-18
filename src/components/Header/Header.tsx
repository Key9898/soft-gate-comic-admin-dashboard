import { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ProfileDropdown from '../ProfileDropdown';
import { SIDEBAR_ITEMS } from '@/config';
import { useData } from '@/lib/DataContext';

const SEARCH_ITEMS = [...SIDEBAR_ITEMS, { title: 'My Profile', path: '/profile' }];

const Header = () => {
  const navigate = useNavigate();
  const { notifications } = useData();
  const [query, setQuery] = useState('');
  const hasUnreadNotifications = notifications.some((notification) => !notification.isRead);
  const normalizedQuery = query.trim().toLowerCase();
  const searchResults = normalizedQuery
    ? SEARCH_ITEMS.filter((item) => item.title.toLowerCase().includes(normalizedQuery))
    : [];

  const navigateTo = (path: string) => {
    navigate(path);
    setQuery('');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
          <input
            type="text"
            placeholder="Search..."
            aria-label="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && searchResults[0]) {
                navigateTo(searchResults[0].path);
              }
              if (event.key === 'Escape') {
                setQuery('');
              }
            }}
            className="w-64 rounded-lg border border-line-strong bg-surface py-2 pl-10 pr-4 text-sm text-fg transition-all placeholder:text-fg-muted focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
          />
          {normalizedQuery && (
            <div className="absolute left-0 top-full z-20 mt-2 w-64 overflow-hidden rounded-lg border border-line bg-surface py-1 shadow-lg">
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => navigateTo(item.path)}
                    className="block w-full px-4 py-2 text-left text-sm text-fg-secondary hover:bg-sg-hover hover:text-primary-600"
                  >
                    {item.title}
                  </button>
                ))
              ) : (
                <p className="px-4 py-2 text-sm text-fg-muted">No pages found</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          type="button"
          title="Notifications"
          aria-label="Notifications"
          onClick={() => navigate('/notifications')}
          className="relative rounded-lg p-2 text-fg-muted transition-colors hover:bg-sg-hover hover:text-fg-secondary"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="h-5 w-5" />
          {hasUnreadNotifications && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-burst-600" />
          )}
        </motion.button>

        <ProfileDropdown />
      </div>
    </header>
  );
};

export default Header;
