import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Lock, Mail, User } from 'lucide-react';
import { Button, Input, PageSEO } from '../../components';
import { MIN_PASSWORD_LENGTH, peekInvite, safeReturnTo } from '@/lib/auth';
import { useAuth } from '@/features/auth/useAuth';
import { isMockApi } from '@/lib/api/http';

const InvitePage = () => {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const { acceptInvite, isAuthenticated, user } = useAuth();
  const mock = isMockApi();
  const invite = useMemo(() => (token && mock ? peekInvite(token) : null), [token, mock]);
  const [submitting, setSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sessionEmail = user?.email.trim().toLowerCase();
  const needsLogout =
    Boolean(invite) && isAuthenticated && Boolean(sessionEmail) && sessionEmail !== invite?.email;

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
    if (!validateForm() || !token) return;
    if (mock && !invite) return;
    setSubmitting(true);
    try {
      await acceptInvite(token, {
        username: formData.username,
        displayName: formData.displayName,
        password: formData.password,
      });
      navigate(safeReturnTo(undefined), { replace: true });
    } catch {
      setErrors({ form: 'This invite is not valid.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (mock ? !invite : !token) {
    return (
      <>
        <PageSEO.Invite />
        <h1 className="text-2xl font-bold text-fg">This invite is not valid.</h1>
        <p className="mt-2 text-sm text-fg-secondary">Ask a Super Admin to send a new invite.</p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-2xl text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Back to Login
        </Link>
      </>
    );
  }

  if (needsLogout) {
    return (
      <>
        <PageSEO.Invite />
        <h1 className="text-2xl font-bold text-fg">Log out to accept this invite</h1>
        <p className="mt-2 text-sm text-fg-secondary">
          You are signed in as a different staff account.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-2xl text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Back to Login
        </Link>
      </>
    );
  }

  if (isAuthenticated && invite && sessionEmail === invite.email) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <PageSEO.Invite />
      <h1 className="text-2xl font-bold text-fg">Join the staff team</h1>
      <p className="mt-2 text-sm text-fg-secondary">Set a password for this Admin account.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {errors.form ? (
          <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600">{errors.form}</p>
        ) : null}
        {invite ? (
          <Input
            id="invite-email"
            label="Email"
            type="email"
            value={invite.email}
            readOnly
            leftIcon={<Mail className="h-5 w-5" />}
          />
        ) : (
          <p className="text-sm text-fg-secondary">
            This invite is tied to an email. You will join as that staff account.
          </p>
        )}
        <Input
          id="invite-username"
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
          id="invite-display-name"
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
          id="invite-password"
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
          id="invite-confirm-password"
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
              id="invite-terms"
              checked={agreedToTerms}
              onChange={(e) => {
                setAgreedToTerms(e.target.checked);
                if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
              }}
              className="mt-1 h-5 w-5 shrink-0 rounded-2xl border-line-strong text-primary-600 focus-visible:ring-primary-500"
              aria-invalid={Boolean(errors.terms)}
              aria-describedby={errors.terms ? 'invite-terms-error' : undefined}
            />
            <label htmlFor="invite-terms" className="text-sm text-fg-secondary">
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
            <p id="invite-terms-error" className="mt-1.5 text-sm text-red-500">
              {errors.terms}
            </p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" isLoading={submitting}>
          Join team
        </Button>
      </form>
    </>
  );
};

export default InvitePage;
