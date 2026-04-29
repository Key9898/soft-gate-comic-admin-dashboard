import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar, Header } from '../components'
import { SidebarProvider, useSidebar } from '../context/SidebarContext'

const AdminLayoutContent = () => {
  const [isReady, setIsReady] = useState(false)
  const { isCollapsed } = useSidebar()

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsReady(true)
    })
    return () => cancelAnimationFrame(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div
        className={isReady ? 'transition-[margin] duration-150 ease-out' : ''}
        style={{ marginLeft: isCollapsed ? 80 : 256 }}
      >
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <AdminLayoutContent />
    </SidebarProvider>
  )
}

export default AdminLayout
