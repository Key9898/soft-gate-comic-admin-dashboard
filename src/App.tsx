import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/useAuth';
import { DataProvider } from '@/lib/DataContext';
import { ProtectedRoute } from './components';
import { AdminLayout, AuthLayout } from './layouts';
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/ResetPasswordPage';
import InvitePage from '@/features/auth/InvitePage';
import TermsPage from '@/features/auth/TermsPage';
import PrivacyPage from '@/features/auth/PrivacyPage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import WebtoonsPage from '@/features/webtoons/WebtoonsPage';
import AuthorsPage from '@/features/authors/AuthorsPage';
import GenresPage from '@/features/genres/GenresPage';
import CoinPackagesPage from '@/features/coin-packages/CoinPackagesPage';
import EpisodesPage from '@/features/episodes/EpisodesPage';
import UsersPage from '@/features/users/UsersPage';
import CommentsPage from '@/features/comments/CommentsPage';
import AnalyticsPage from '@/features/analytics/AnalyticsPage';
import SettingsPage from '@/features/settings/SettingsPage';
import ProfilePage from '@/features/profile/ProfilePage';
import MediaLibraryPage from '@/features/media/MediaLibraryPage';
import ReportsPage from '@/features/reports/ReportsPage';
import ActivityLogPage from '@/features/activity-log/ActivityLogPage';
import RevenuePage from '@/features/revenue/RevenuePage';
import NotificationsPage from '@/features/notifications/NotificationsPage';
import SchedulePage from '@/features/schedule/SchedulePage';
import TeamPage from '@/features/team/TeamPage';

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
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token?" element={<ResetPasswordPage />} />
              <Route path="/invite/:token" element={<InvitePage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
            </Route>

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
              <Route path="/authors" element={<AuthorsPage />} />
              <Route path="/genres" element={<GenresPage />} />
              <Route path="/coin-packages" element={<CoinPackagesPage />} />
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
              <Route path="/team" element={<TeamPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
