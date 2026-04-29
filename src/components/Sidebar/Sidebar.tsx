import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
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
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useSidebar } from '../../context/SidebarContext'
import { APP_NAME, SIDEBAR_ITEMS } from '../../constants'
import { ComponentType } from 'react'

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
}

const Sidebar = () => {
  const [isReady, setIsReady] = useState(false)
  const { isCollapsed, toggleSidebar } = useSidebar()
  const { logout } = useAuth()
  const location = useLocation()

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsReady(true)
    })
    return () => cancelAnimationFrame(timer)
  }, [])

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: isReady ? 0.15 : 0 }}
      className="fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-30"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 relative">
          {!isCollapsed && (
            <span className="text-xl font-bold text-primary-600 absolute left-4">{APP_NAME}</span>
          )}
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors absolute right-4"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <motion.div
              initial={false}
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: isReady ? 0.15 : 0 }}
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </motion.div>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => {
            const IconComponent = iconMap[item.icon]
            const active = isActive(item.path)
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isReady ? 'transition-all duration-150' : ''
                } ${
                  active
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:translate-x-1'
                }`}
                title={isCollapsed ? item.title : undefined}
              >
                {IconComponent && (
                  <IconComponent
                    className={`w-5 h-5 ${isReady ? 'transition-transform duration-150 group-hover:scale-110' : ''}`}
                  />
                )}
                {!isCollapsed && <span>{item.title}</span>}
              </NavLink>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={logout}
            className={`group flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 ${
              isReady ? 'transition-all duration-150 hover:translate-x-1' : ''
            }`}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut
              className={`w-5 h-5 ${isReady ? 'transition-transform duration-150 group-hover:scale-110' : ''}`}
            />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </motion.aside>
  )
}

export default Sidebar
