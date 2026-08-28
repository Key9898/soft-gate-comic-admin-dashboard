import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { Button, Input, PageSEO } from '../../components';
import { MIN_PASSWORD_LENGTH, safeReturnTo } from '@/lib/auth';
import { isMockApi } from '@/lib/api/http';

const RegisterPage = ({
  embedded = false,
  active = true,
}: {
  embedded?: boolean;
  active?: boolean;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated, isLoading, hasStaffAccount } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
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
    if (!formData.username) {
      next.username = 'Username is required';
    } else if (formData.username.length < 3) {
      next.username = 'Username must be at least 3 characters';
    }
    if (!formData.displayName) {
      next.displayName = 'Display name is required';
    }
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
    if (!formData.confirmPassword) {
      next.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      next.confirmPassword = 'Passwords do not match';
    }
    if (!agreedToTerms) {
      next.terms = 'Agree to the Terms and Privacy to continue.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await register({
        username: formData.username,
        displayName: formData.displayName,
        email: formData.email,
        password: formData.password,
      });
      navigate(returnTo, { replace: true });
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      setErrors({
        form:
          code === 'EMAIL_TAKEN'
            ? 'An account with this email already exists.'
            : code === 'USERNAME_TAKEN'
              ? 'That username is already taken.'
              : code === 'STAFF_LOCKED'
                ? 'This dashboard already has a super admin. Ask them to invite you from Team.'
                : 'Could not create account.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoading && isAuthenticated && active) {
    return <Navigate to={returnTo} replace />;
  }

  if (hasStaffAccount && active) {
    return (
      <>
        {embedded ? null : <PageSEO.Register />}
        <h1 className="text-2xl font-bold text-fg">Registration is closed</h1>
        <p className="mt-2 text-sm text-fg-secondary">
          {isMockApi()
            ? 'This browser already has a super admin. Ask them to invite you from Team.'
            : 'This dashboard already has a super admin. Ask them to invite you from Team.'}
        </p>
        <Link
          to="/login"
          state={{ from }}
          className="mt-6 inline-block rounded-2xl text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Back to Login
        </Link>
      </>
    );
  }

  return (
    <>
      {embedded ? null : <PageSEO.Register />}
      <h1 className="text-2xl font-bold text-fg">Create a staff account</h1>
      <p className="mt-2 text-sm text-fg-secondary">
        {isMockApi()
          ? 'The first account is super admin for this browser.'
          : 'The first account is super admin for this dashboard.'}
      </p>
      {isMockApi() ? (
        <p className="mt-2 text-xs text-fg-muted">Demo staff accounts stay on this browser only.</p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {errors.form ? (
          <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600">{errors.form}</p>
        ) : null}
        <Input
          id="register-username"
          label="Username"
          type="text"
          name="username"
          autoComplete="username"
          placeholder="johndoe"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          leftIcon={<User className="h-5 w-5" />}
        />
        <Input
          id="register-display-name"
          label="Display Name"
          type="text"
          name="displayName"
          autoComplete="nickname"
          placeholder="Jane Doe"
          value={formData.displayName}
          onChange={handleChange}
          error={errors.displayName}
          leftIcon={<User className="h-5 w-5" />}
        />
        <Input
          id="register-email"
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
          id="register-password"
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          leftIcon={<Lock className="h-5 w-5" />}
        />
        <Input
          id="register-confirm-password"
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          leftIcon={<Lock className="h-5 w-5" />}
        />
        <div>
          <div className="flex min-h-11 items-start gap-3">
            <input
              type="checkbox"
              id="register-terms"
              checked={agreedToTerms}
              onChange={(e) => {
                setAgreedToTerms(e.target.checked);
                if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
              }}
              className="mt-1 h-5 w-5 shrink-0 rounded-2xl border-line-strong text-primary-600 focus-visible:ring-primary-500"
              aria-invalid={Boolean(errors.terms)}
              aria-describedby={errors.terms ? 'register-terms-error' : undefined}
            />
            <label htmlFor="register-terms" className="text-sm text-fg-secondary">
              I agree to the{' '}
              <Link to="/terms" className="text-primary-600 hover:text-primary-700">
                Terms
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-600 hover:text-primary-700">
                Privacy
              </Link>
            </label>
          </div>
          {errors.terms ? (
            <p id="register-terms-error" className="mt-1.5 text-sm text-red-500">
              {errors.terms}
            </p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" isLoading={submitting}>
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-sm text-fg-secondary lg:hidden">
        Already have an account?{' '}
        <Link
          to="/login"
          state={{ from }}
          className="rounded-2xl font-medium text-primary-600 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          Sign In
        </Link>
      </p>
    </>
  );
};

export default RegisterPage;
