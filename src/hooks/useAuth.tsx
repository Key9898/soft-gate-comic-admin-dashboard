import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { AdminUser } from '@webpad/shared'

interface AuthContextType {
  user: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('webpad_admin_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (email && password) {
      const adminUser: AdminUser = {
        id: '1',
        email,
        username: email.split('@')[0],
        displayName: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        role: 'super_admin',
        createdAt: new Date().toISOString().split('T')[0],
      }
      setUser(adminUser)
      localStorage.setItem('webpad_admin_user', JSON.stringify(adminUser))
    } else {
      throw new Error('Invalid credentials')
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('webpad_admin_user')
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
