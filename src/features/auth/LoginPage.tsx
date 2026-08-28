import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { Button, Input, PageSEO } from '../../components';
import { MIN_PASSWORD_LENGTH, safeReturnTo } from '@/lib/auth';
import { isMockApi } from '@/lib/api/http';

const LoginPage = ({
  embedded = false,
  active = true,
}: {
  embedded?: boolean;
  active?: boolean;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, hasStaffAccount } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const from = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
  const returnTo = safeReturnTo(from);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name] || errors.form) {
      setErrors((prev) => ({ ...prev, [name]: '', form: '' }));
    }
  };

  const validateForm = () => {
    const next: Record<string, string> = {};
    if (!formData.email) {
      next.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      next.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      next.password = 'Password is required';
    } else if (formData.password.length < MIN_PASSWORD_LENGTH) {
      next.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await login(formData.email, formData.password);
      navigate(returnTo, { replace: true });
    } catch {
      setErrors({ form: 'Invalid email or password' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoading && isAuthenticated && active) {
    return <Navigate to={returnTo} replace />;
  }

  return (
    <>
      {embedded ? null : <PageSEO.Login />}
      <h1 className="text-2xl font-bold text-fg">Sign in</h1>
      <p className="mt-2 text-sm text-fg-secondary">Sign in to SoftGate Comic Admin.</p>
      {isMockApi() ? (
        <p className="mt-2 text-xs text-fg-muted">Demo staff accounts stay on this browser only.</p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {errors.form ? (
          <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600">{errors.form}</p>
        ) : null}
        <Input
          id="login-email"
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          leftIcon={<Mail className="h-5 w-5" />}
        />
        <Input
          id="login-password"
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          leftIcon={<Lock className="h-5 w-5" />}
        />
        <div className="flex items-center justify-end">
          <Link
            to="/forgot-password"
            state={{ from }}
            className="rounded-2xl text-sm text-primary-600 transition hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            Forgot Password?
          </Link>
        </div>
        <Button type="submit" className="w-full" isLoading={submitting}>
          Sign In
        </Button>
      </form>

      {!hasStaffAccount ? (
        <p className="mt-6 text-sm text-fg-secondary lg:hidden">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            state={{ from }}
            className="rounded-2xl font-medium text-primary-600 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            Sign Up
          </Link>
        </p>
      ) : null}
    </>
  );
};

export default LoginPage;
