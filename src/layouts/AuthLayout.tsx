import { Link, Outlet, useLocation } from 'react-router-dom';
import AuthSplitCard, { type AuthReturnFrom } from '@/features/auth/AuthSplitCard';

const AuthLayout = () => {
  const location = useLocation();
  const isSplit = location.pathname === '/login' || location.pathname === '/register';
  const splitView = location.pathname === '/register' ? 'register' : 'login';
  const from = (location.state as { from?: AuthReturnFrom } | null)?.from;

  return (
    <div className="relative flex min-h-screen flex-col bg-canvas text-fg">
      <a
        href="#main-content"
        className="skip-link"
        onClick={() => document.getElementById('main-content')?.focus()}
      >
        Skip to content
      </a>
      <header className="bg-surface/95 relative z-10 border-b border-line">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link
            to="/login"
            className="flex items-center rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <img
              src="/logo/logo.svg"
              alt="SoftGate Comic"
              className="h-11 w-auto shrink-0 object-contain"
            />
          </Link>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="relative z-10 flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          {isSplit ? (
            <AuthSplitCard view={splitView} from={from} />
          ) : (
            <div className="mx-auto max-w-lg rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
              <Outlet />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
