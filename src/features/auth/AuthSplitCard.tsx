import { useLocation } from 'react-router-dom';
import { PageSEO } from '../../components';
import LoginPage from './LoginPage';
import SetupPage from './SetupPage';
import { useAuth } from '@/features/auth/useAuth';
import { useTheme } from '@/lib/theme';

export type AuthReturnFrom = { pathname?: string; search?: string };

const JOBS = ['Catalog and episodes', 'Publish schedule', 'Analytics'] as const;

const AuthSplitCard = ({ from: _from }: { from?: AuthReturnFrom }) => {
  const { resolvedTheme } = useTheme();
  const location = useLocation();
  const { hasStaffAccount } = useAuth();
  const isSetupView = location.pathname === '/setup';
  const setupInFlow = !hasStaffAccount;
  const loginActive = !isSetupView;
  void _from;

  return (
    <div
      data-testid="auth-split-card"
      className="auth-split-card"
      data-view={isSetupView ? 'setup' : 'login'}
    >
      {isSetupView ? <PageSEO.Setup /> : <PageSEO.Login />}
      <div
        data-testid="auth-split-form-login"
        className={
          setupInFlow
            ? loginActive
              ? 'relative z-[1] w-full bg-surface p-6 sm:p-8 lg:absolute lg:left-0 lg:top-0 lg:h-full lg:w-1/2'
              : 'pointer-events-none hidden bg-surface p-6 sm:p-8 lg:absolute lg:left-0 lg:top-0 lg:block lg:h-full lg:w-1/2'
            : 'relative z-[1] w-full bg-surface p-6 sm:p-8 lg:w-1/2'
        }
        aria-hidden={!loginActive}
      >
        <LoginPage embedded active={loginActive} />
      </div>
      {setupInFlow ? (
        <div
          data-testid="auth-split-form-setup"
          className={
            isSetupView
              ? 'relative z-[1] w-full bg-surface p-6 sm:p-8 lg:ml-auto lg:w-1/2'
              : 'pointer-events-none hidden bg-surface p-6 sm:p-8 lg:ml-auto lg:block lg:w-1/2'
          }
          aria-hidden={!isSetupView}
        >
          <SetupPage embedded active={isSetupView} />
        </div>
      ) : isSetupView ? (
        <SetupPage embedded active />
      ) : null}
      <div
        data-testid="auth-split-bg"
        aria-hidden
        className={`auth-split-bg auth-split-bg-motion pointer-events-none absolute inset-y-0 left-0 z-[2] hidden w-1/2 lg:block ${
          isSetupView ? '' : 'translate-x-full'
        }`}
      >
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-[3] flex h-full flex-col items-center justify-center px-8 py-10 text-center text-white">
          <p className="text-xs font-bold uppercase tracking-wider text-white/80">Staff console</p>
          <p className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Pick up the catalog.</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/85">
            Sign in to manage webtoons, schedule, and analytics on this device.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-white/90">
            {JOBS.map((job) => (
              <li key={job} className="flex items-center justify-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-2xl bg-white" aria-hidden />
                {job}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-md px-6 pb-6 lg:hidden">
        <p className="text-xs font-bold uppercase tracking-wider text-primary-600">Staff console</p>
        <p className="mt-3 text-2xl font-bold tracking-tight text-fg">Pick up the catalog.</p>
        <img
          src={
            resolvedTheme === 'dark' ? '/auth/ops-desk-sm-dark.jpg' : '/auth/ops-desk-sm-light.jpg'
          }
          alt=""
          className="mt-6 w-full rounded-3xl object-cover"
          width={800}
          height={1000}
        />
      </div>
    </div>
  );
};

export default AuthSplitCard;
