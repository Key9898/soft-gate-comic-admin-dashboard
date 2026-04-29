import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthProvider } from './hooks/useAuth'
import { ProtectedRoute } from './components'
import { AdminLayout } from './layouts'

const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const WebtoonsPage = lazy(() => import('./pages/webtoons/WebtoonsPage'))
const EpisodesPage = lazy(() => import('./pages/episodes/EpisodesPage'))
const UsersPage = lazy(() => import('./pages/users/UsersPage'))
const CommentsPage = lazy(() => import('./pages/comments/CommentsPage'))
const AnalyticsPage = lazy(() => import('./pages/analytics/AnalyticsPage'))
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'))
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'))
const MediaLibraryPage = lazy(() => import('./pages/media/MediaLibraryPage'))
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'))
const ActivityLogPage = lazy(() => import('./pages/activity-log/ActivityLogPage'))
const RevenuePage = lazy(() => import('./pages/revenue/RevenuePage'))
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'))
const SchedulePage = lazy(() => import('./pages/schedule/SchedulePage'))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full"
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-500 text-sm"
      >
        Loading...
      </motion.p>
    </motion.div>
  </div>
)

function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  )
}

export default App
