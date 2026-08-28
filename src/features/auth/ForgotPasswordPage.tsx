import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { Button, Input, PageSEO } from '../../components';
import { DEMO_PASSWORD_RESET_OTP, isDemoOtp, MIN_PASSWORD_LENGTH } from '@/lib/auth';
import { useAuth } from '@/features/auth/useAuth';

type Step = 'email' | 'otp' | 'password' | 'done';

const STEPS: { id: Exclude<Step, 'done'>; label: string }[] = [
  { id: 'email', label: 'Email' },
  { id: 'otp', label: 'Code' },
  { id: 'password', label: 'New password' },
];

const ForgotPasswordPage = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const from = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resendNote, setResendNote] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      setEmail(user.email);
    }
  }, [isAuthenticated, user?.email]);

  const emailLocked = isAuthenticated && Boolean(user?.email);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!email) {
      next.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      next.email = 'Please enter a valid email';
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setResendNote(false);
    setStep('otp');
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setErrors({ otp: 'Enter the 6-digit code.' });
      return;
    }
    if (!isDemoOtp(otp)) {
      setErrors({ otp: 'That code does not match the demo code.' });
      return;
    }
    setErrors({});
    setStep('password');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
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
    setStep('done');
  };

  return (
    <>
      <PageSEO.Forgot />
      <h1 className="text-2xl font-bold text-fg">Forgot password?</h1>
      <p className="mt-2 text-sm text-fg-secondary">
        When mail is live, a code goes to your main email. This demo does not send mail or save a
        new password yet.
      </p>

      <ol className="mt-6 flex gap-2" aria-label="Forgot password">
        {STEPS.map((item, index) => {
          const order = ['email', 'otp', 'password'] as const;
          const currentIndex = step === 'done' ? 3 : order.indexOf(step as (typeof order)[number]);
          const current = step === item.id;
          const complete = currentIndex > index;
          return (
            <li
              key={item.id}
              className={`flex min-h-11 flex-1 items-center justify-center rounded-2xl px-2 text-center text-xs font-semibold ${
                current
                  ? 'bg-primary-600 text-white'
                  : complete
                    ? 'bg-primary-50 text-primary-700'
                    : 'bg-surface-muted text-fg-muted'
              }`}
            >
              {index + 1}. {item.label}
            </li>
          );
        })}
      </ol>

      {step === 'email' ? (
        <form onSubmit={handleEmailSubmit} className="mt-6 space-y-5">
          <Input
            id="forgot-email"
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              if (!emailLocked) setEmail(e.target.value);
              if (errors.email) setErrors({});
            }}
            error={errors.email}
            readOnly={emailLocked}
            leftIcon={<Mail className="h-5 w-5" />}
          />
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      ) : null}

      {step === 'otp' ? (
        <form onSubmit={handleOtpSubmit} className="mt-6 space-y-5">
          <p className="rounded-2xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Demo code for this UI — not emailed. Mail ships with the backend. Use{' '}
            {DEMO_PASSWORD_RESET_OTP}.
          </p>
          <Input
            id="forgot-otp"
            label="One-time code"
            type="text"
            name="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6-digit code"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
              if (errors.otp) setErrors({});
            }}
            error={errors.otp}
          />
          {resendNote ? (
            <p className="text-sm text-fg-secondary">
              This demo does not send mail. The on-page mock code is unchanged.
            </p>
          ) : null}
          <Button type="submit" className="w-full">
            Verify code
          </Button>
          <button
            type="button"
            className="w-full text-sm font-medium text-primary-600 hover:text-primary-700"
            onClick={() => setResendNote(true)}
          >
            Resend code
          </button>
        </form>
      ) : null}

      {step === 'password' ? (
        <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-5">
          <Input
            id="forgot-new-password"
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
            id="forgot-confirm-password"
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
      ) : null}

      {step === 'done' ? (
        <p className="mt-6 rounded-2xl bg-amber-50 px-3 py-3 text-sm text-amber-900">
          Form saved for when mail ships. Your demo password is unchanged. This demo does not email
          you or save a new password yet.
        </p>
      ) : (
        <p className="mt-6 text-sm text-fg-muted">
          This demo does not email you or save a new password yet.
        </p>
      )}

      <div className="mt-6 text-sm">
        <Link
          to="/login"
          state={{ from }}
          className="rounded-2xl font-medium text-primary-600 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          Back to Login
        </Link>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
