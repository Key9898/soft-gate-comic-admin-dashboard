import { Link } from 'react-router-dom';
import { PageSEO } from '../../components';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/features/auth/useAuth';

export type AuthReturnFrom = { pathname?: string; search?: string };

const JOBS = ['Catalog and episodes', 'Publish schedule', 'Analytics'] as const;

const bindInert = (inactive: boolean) => (el: HTMLDivElement | null) => {
  if (!el) return;
  if (inactive) {
    el.setAttribute('inert', '');
  } else {
    el.removeAttribute('inert');
  }
};

const AuthSplitHero = ({
  invite,
  active,
  to,
  from,
  side,
  showCta,
}: {
  invite: 'login' | 'register';
  active: boolean;
  to: string;
  from?: AuthReturnFrom;
  side: 'login' | 'register';
  showCta: boolean;
}) => {
  const isLoginInvite = invite === 'login';

  return (
    <div
      className={`auth-split-slide absolute top-0 z-[3] hidden h-full w-1/2 flex-col items-center justify-center px-8 py-10 text-center text-white lg:flex ${
        side === 'login' ? 'left-1/2' : 'left-0'
      } ${
        active
          ? 'visible opacity-100'
          : `pointer-events-none invisible opacity-0 ${side === 'register' ? '-translate-x-full' : 'translate-x-full'}`
      }`}
    >
      <p className="text-xs font-bold uppercase tracking-wider text-white/80">Staff console</p>
      <p className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
        {isLoginInvite ? 'Pick up the catalog.' : 'A desk that remembers you.'}
      </p>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/85">
        {isLoginInvite
          ? 'Sign in to manage webtoons, schedule, and analytics on this device.'
          : 'Create the first super admin account for this browser. Ask a Super Admin to invite you from Team.'}
      </p>
      <ul className="mt-6 space-y-2 text-sm text-white/90">
        {JOBS.map((job) => (
          <li key={job} className="flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-2xl bg-white" aria-hidden />
            {job}
          </li>
        ))}
      </ul>
      {showCta ? (
        <Link
          to={to}
          state={{ from }}
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-2xl border border-white px-8 text-sm font-bold text-white transition hover:bg-white hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          {isLoginInvite ? 'Sign In' : 'Sign Up'}
        </Link>
      ) : null}
    </div>
  );
};

const AuthSplitCard = ({ view, from }: { view: 'login' | 'register'; from?: AuthReturnFrom }) => {
  const { resolvedTheme } = useTheme();
  const { hasStaffAccount } = useAuth();
  const isLogin = view === 'login';

  return (
    <div data-testid="auth-split-card" className="auth-split-card" data-view={view}>
      {isLogin ? <PageSEO.Login /> : <PageSEO.Register />}
      <div
        data-testid="auth-split-form-login"
        ref={bindInert(!isLogin)}
        className={`relative z-[1] w-full bg-surface p-6 sm:p-8 lg:absolute lg:left-0 lg:top-0 lg:h-full lg:w-1/2 lg:overflow-y-auto lg:overscroll-contain ${
          isLogin ? 'block' : 'pointer-events-none hidden lg:block'
        }`}
        aria-hidden={!isLogin}
      >
        <LoginPage embedded active={isLogin} />
      </div>
      <div
        data-testid="auth-split-form-register"
        ref={bindInert(isLogin)}
        className={`relative z-[1] w-full bg-surface p-6 sm:p-8 lg:absolute lg:left-1/2 lg:top-0 lg:h-full lg:w-1/2 lg:overflow-y-auto lg:overscroll-contain ${
          isLogin ? 'pointer-events-none hidden lg:block' : 'block'
        }`}
        aria-hidden={isLogin}
      >
        <RegisterPage embedded active={!isLogin} />
      </div>
      <div
        data-testid="auth-split-bg"
        aria-hidden
        className={`auth-split-bg auth-split-bg-motion pointer-events-none absolute left-1 top-1 z-[2] hidden h-[calc(100%-0.5rem)] w-[calc(50%-0.25rem)] rounded-[1.25rem] lg:block ${
          isLogin ? 'translate-x-full' : ''
        }`}
      >
        <div className="absolute inset-0 rounded-[1.25rem] bg-black/45" />
      </div>
      <AuthSplitHero
        invite="register"
        active={isLogin}
        to="/register"
        from={from}
        side="login"
        showCta={!hasStaffAccount}
      />
      <AuthSplitHero
        invite="login"
        active={!isLogin}
        to="/login"
        from={from}
        side="register"
        showCta
      />
      <div className="mx-auto mt-10 max-w-md px-6 pb-6 lg:hidden">
        <p className="text-xs font-bold uppercase tracking-wider text-primary-600">Staff console</p>
        <p className="mt-3 text-2xl font-bold tracking-tight text-fg">
          {isLogin ? 'Pick up the catalog.' : 'A desk that remembers you.'}
        </p>
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
