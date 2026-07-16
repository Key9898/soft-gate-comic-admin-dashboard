import { useState } from 'react';
import { User, Mail, Shield, Calendar, Camera, Save, Key } from 'lucide-react';
import { Card, Button, Input, PageSEO } from '../../components';
import { useAuth } from '@/features/auth/useAuth';
import { useToast } from '../../components/Toast/Toast';

const ProfilePage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleSaveProfile = () => {
    addToast('Profile updated successfully', 'success');
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (passwords.new.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    addToast('Password changed successfully', 'success');
    setShowPasswordForm(false);
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(passwords.new);
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
  ];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <>
      <PageSEO.Settings />
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>

        <Card className="p-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary-100 dark:bg-primary-900">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="h-24 w-24 object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-primary-600 dark:text-primary-400" />
                )}
              </div>
              <button
                type="button"
                title="Change avatar"
                className="absolute bottom-0 right-0 rounded-full bg-primary-600 p-2 text-white transition-colors hover:bg-primary-700"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1">
              <div className="mb-4 flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {user?.displayName || 'Admin'}
                </h2>
                <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium capitalize text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                  {user?.role || 'admin'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4" />
                  {user?.email || 'admin@example.com'}
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Shield className="h-4 w-4" />
                  <span className="capitalize">{user?.role || 'admin'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Profile Information
            </h3>
            {!isEditing && (
              <Button variant="ghost" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={!isEditing}
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!isEditing}
            />

            {isEditing && (
              <div className="flex gap-3">
                <Button onClick={handleSaveProfile}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h3>
            {!showPasswordForm && (
              <Button variant="ghost" onClick={() => setShowPasswordForm(true)}>
                Change
              </Button>
            )}
          </div>

          {showPasswordForm && (
            <div className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              />
              <div>
                <Input
                  label="New Password"
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                />
                {passwords.new && (
                  <div className="mt-2">
                    <div className="mb-1 flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded ${
                            i < passwordStrength
                              ? strengthColors[passwordStrength - 1]
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      Strength:{' '}
                      {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Very Weak'}
                    </p>
                  </div>
                )}
              </div>
              <Input
                label="Confirm New Password"
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              />

              <div className="flex gap-3">
                <Button onClick={handleChangePassword}>
                  <Key className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
                <Button variant="ghost" onClick={() => setShowPasswordForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
};

export default ProfilePage;
