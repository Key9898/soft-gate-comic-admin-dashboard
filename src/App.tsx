import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider } from '@/features/auth/useAuth';
import { DataProvider } from '@/lib/DataContext';
import { ProtectedRoute } from './components';
import { AdminLayout } from './layouts';

const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const WebtoonsPage = lazy(() => import('@/features/webtoons/WebtoonsPage'));
const EpisodesPage = lazy(() => import('@/features/episodes/EpisodesPage'));
const UsersPage = lazy(() => import('@/features/users/UsersPage'));
const CommentsPage = lazy(() => import('@/features/comments/CommentsPage'));
const AnalyticsPage = lazy(() => import('@/features/analytics/AnalyticsPage'));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'));
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'));
const MediaLibraryPage = lazy(() => import('@/features/media/MediaLibraryPage'));
const ReportsPage = lazy(() => import('@/features/reports/ReportsPage'));
const ActivityLogPage = lazy(() => import('@/features/activity-log/ActivityLogPage'));
const RevenuePage = lazy(() => import('@/features/revenue/RevenuePage'));
const NotificationsPage = lazy(() => import('@/features/notifications/NotificationsPage'));
const SchedulePage = lazy(() => import('@/features/schedule/SchedulePage'));

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-100">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="h-12 w-12 rounded-full border-4 border-primary-200 border-t-primary-600"
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-sm text-gray-500"
      >
        Loading...
      </motion.p>
    </motion.div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/webtoons" element={<WebtoonsPage />} />
                <Route path="/episodes" element={<EpisodesPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/comments" element={<CommentsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/media" element={<MediaLibraryPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/activity-log" element={<ActivityLogPage />} />
                <Route path="/revenue" element={<RevenuePage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/schedule" element={<SchedulePage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
