import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button, Input, PageSEO } from '../../components';
import { MIN_PASSWORD_LENGTH } from '@/lib/auth';
import { useAuth } from '@/features/auth/useAuth';
import { isMockApi } from '@/lib/api/http';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const location = useLocation();
  const { resetPasswordWithToken } = useAuth();
  const from = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
  const hasToken = Boolean(token);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!password) {
      next.password = 'Password is required';
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      next.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }
    if (!confirmPassword) {
      next.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      next.confirmPassword = 'Passwords do not match';
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    if (!token) return;
    setSubmitting(true);
    try {
      await resetPasswordWithToken(token, password);
      setSubmitted(true);
    } catch {
      setErrors({ form: 'This reset link is invalid or has expired.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageSEO.Reset />
      {hasToken ? (
        <>
          <h1 className="text-2xl font-bold text-fg">Set new password</h1>
          <p className="mt-2 text-sm text-fg-secondary">
            {isMockApi()
              ? 'Mock forgot-password uses the on-page code. This emailed-link form is for API mode.'
              : 'Choose a new password for your staff account.'}
          </p>
          {errors.form ? (
            <p className="mt-4 rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600">
              {errors.form}
            </p>
          ) : null}
          {submitted ? (
            <p className="mt-6 rounded-2xl bg-primary-50 px-3 py-3 text-sm text-primary-800">
              Your password was updated. Sign in with the new password.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <Input
                id="reset-new-password"
                label="New Password"
                type="password"
                name="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
                error={errors.password}
                leftIcon={<Lock className="h-5 w-5" />}
              />
              <Input
                id="reset-confirm-password"
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                error={errors.confirmPassword}
                leftIcon={<Lock className="h-5 w-5" />}
              />
              <Button type="submit" className="w-full" isLoading={submitting}>
                Set new password
              </Button>
            </form>
          )}
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-fg">Incomplete link</h1>
          <p className="mt-2 text-sm text-fg-secondary">
            This reset link has no token. Use Forgot password.
          </p>
        </>
      )}
      <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link
          to="/forgot-password"
          state={{ from }}
          className="rounded-2xl font-medium text-primary-600 hover:text-primary-700"
        >
          Forgot password
        </Link>
        <Link
          to="/login"
          state={{ from }}
          className="rounded-2xl font-medium text-primary-600 hover:text-primary-700"
        >
          Back to Login
        </Link>
      </div>
    </>
  );
};

export default ResetPasswordPage;
