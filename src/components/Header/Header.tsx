import { Bell, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import ProfileDropdown from '../ProfileDropdown'
import { useTheme } from '../../hooks/useTheme'

const Header = () => {
  const { theme, toggleTheme } = useTheme()
  const isDarkMode = theme === 'dark'

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            aria-label="Search"
            className="w-64 pl-10 pr-4 py-2 rounded-lg bg-gray-100 border-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm text-gray-900 placeholder-gray-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          type="button"
          title="Notifications"
          aria-label="Notifications"
          className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </motion.button>

        <ProfileDropdown onThemeToggle={toggleTheme} isDarkMode={isDarkMode} />
      </div>
    </header>
  )
}

export default Header
