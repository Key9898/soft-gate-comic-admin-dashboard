import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/useAuth';
import { DataProvider } from '@/lib/DataContext';
import { ProtectedRoute } from './components';
import { AdminLayout, AuthLayout } from './layouts';
import LoginPage from '@/features/auth/LoginPage';
import SetupPage from '@/features/auth/SetupPage';
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/ResetPasswordPage';
import InvitePage from '@/features/auth/InvitePage';
import TermsPage from '@/features/auth/TermsPage';
import PrivacyPage from '@/features/auth/PrivacyPage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import WebtoonsPage from '@/features/webtoons/WebtoonsPage';
import WebtoonEditorPage from '@/features/webtoons/WebtoonEditorPage';
import AuthorsPage from '@/features/authors/AuthorsPage';
import GenresPage from '@/features/genres/GenresPage';
import CoinPackagesPage from '@/features/coin-packages/CoinPackagesPage';
import EpisodesPage from '@/features/episodes/EpisodesPage';
import EpisodeEditorPage from '@/features/episodes/EpisodeEditorPage';
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
import AboutPage from '@/features/about/AboutPage';
import PressPage from '@/features/press/PressPage';
import FaqPage from '@/features/faq/FaqPage';
import CookiesPolicyPage from '@/features/cookies/CookiesPolicyPage';
import LegalPage from '@/features/legal/LegalPage';
import HelpPage from '@/features/help/HelpPage';

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
              <Route path="/setup" element={<SetupPage />} />
              <Route path="/register" element={<Navigate to="/login" replace />} />
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
              <Route path="/webtoons/new" element={<WebtoonEditorPage />} />
              <Route path="/webtoons/:webtoonId/edit" element={<WebtoonEditorPage />} />
              <Route path="/authors" element={<AuthorsPage />} />
              <Route path="/genres" element={<GenresPage />} />
              <Route path="/coin-packages" element={<CoinPackagesPage />} />
              <Route path="/episodes" element={<EpisodesPage />} />
              <Route path="/episodes/new" element={<EpisodeEditorPage />} />
              <Route path="/episodes/:episodeId/edit" element={<EpisodeEditorPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/comments" element={<CommentsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/media" element={<MediaLibraryPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/activity-log" element={<ActivityLogPage />} />
              <Route path="/revenue" element={<RevenuePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/press" element={<PressPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/cookies" element={<CookiesPolicyPage />} />
              <Route path="/legal" element={<LegalPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
