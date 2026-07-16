import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarProvider, useSidebar } from '@/lib/SidebarContext';
import { Sidebar, Header } from '../components';

const AdminLayoutContent = () => {
  const [isReady, setIsReady] = useState(false);
  const { isCollapsed } = useSidebar();
  const location = useLocation();

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsReady(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div
        className={isReady ? 'transition-[margin] duration-150 ease-out' : ''}
        style={{ marginLeft: isCollapsed ? 80 : 256 }}
      >
        <Header />
        <main className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <AdminLayoutContent />
    </SidebarProvider>
  );
};

export default AdminLayout;
