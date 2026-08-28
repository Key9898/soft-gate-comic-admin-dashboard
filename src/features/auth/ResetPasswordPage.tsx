import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button, Input, PageSEO } from '../../components';
import { MIN_PASSWORD_LENGTH } from '@/lib/auth';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
  const hasToken = Boolean(token);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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
    setSubmitted(true);
  };

  return (
    <>
      <PageSEO.Reset />
      {hasToken ? (
        <>
          <h1 className="text-2xl font-bold text-fg">Set new password</h1>
          <p className="mt-2 text-sm text-fg-secondary">
            When mail is live, this page will save a new password from an emailed link. This demo
            does not change your account yet.
          </p>
          {submitted ? (
            <p className="mt-6 rounded-2xl bg-amber-50 px-3 py-3 text-sm text-amber-900">
              Form saved for when mail ships. Your demo password is unchanged.
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
              <Button type="submit" className="w-full">
                Set new password
              </Button>
            </form>
          )}
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-fg">Incomplete link</h1>
          <p className="mt-2 text-sm text-fg-secondary">
            This reset link has no token yet. Use Forgot password for the email and OTP steps.
          </p>
        </>
      )}
      <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link
          to="/forgot-password"
          state={{ from }}
          className="rounded-2xl font-medium text-primary-600 hover:text-primary-700"
        >
          Go to forgot password
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
