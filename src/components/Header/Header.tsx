import { Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ProfileDropdown from '../ProfileDropdown';
import { useCommandPalette } from '../CommandPalette';
import { paletteShortcutLabel } from '@/lib/commands';
import { useData } from '@/lib/DataContext';

const Header = () => {
  const navigate = useNavigate();
  const { notifications } = useData();
  const { open } = useCommandPalette();
  const hasUnreadNotifications = notifications.some((notification) => !notification.isRead);

  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={open}
          className="flex w-64 items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 py-2 text-left text-sm text-fg-muted transition-all hover:border-primary-500"
          aria-label="Search or jump"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate">Search or jump…</span>
          <kbd className="hidden rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-fg-muted sm:inline">
            {paletteShortcutLabel()}
          </kbd>
        </button>
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
