import { useState, useRef, useEffect } from 'react'
import { User, Settings, LogOut, Moon, Sun, HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

interface ProfileDropdownProps {
  onThemeToggle: () => void
  isDarkMode: boolean
}

const ProfileDropdown = ({ onThemeToggle, isDarkMode }: ProfileDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
    setIsOpen(false)
  }

  const menuItems = [
    {
      icon: <User className="w-4 h-4" />,
      label: 'My Profile',
      onClick: () => {
        navigate('/profile')
        setIsOpen(false)
      },
    },
    {
      icon: <Settings className="w-4 h-4" />,
      label: 'Settings',
      onClick: () => {
        navigate('/settings')
        setIsOpen(false)
      },
    },
    {
      icon: isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
      label: isDarkMode ? 'Light Mode' : 'Dark Mode',
      onClick: () => {
        onThemeToggle()
        setIsOpen(false)
      },
    },
    {
      icon: <HelpCircle className="w-4 h-4" />,
      label: 'Help & Support',
      onClick: () => setIsOpen(false),
    },
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-lg p-2 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.displayName} className="w-8 h-8 object-cover" />
          ) : (
            <User className="w-4 h-4 text-primary-600" />
          )}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900">{user?.displayName || 'Admin'}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role || 'admin'}</p>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-10 h-10 object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-primary-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.displayName || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full capitalize">
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
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {item.icon}
                  {item.label}
                </motion.button>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProfileDropdown
