import { useEffect, useRef, useState } from 'react';
import { User, Mail, Calendar, Camera, Save, Key } from 'lucide-react';
import { Card, Button, Input, PageSEO, coverSheenClass } from '../../components';
import { useAuth } from '@/features/auth/useAuth';
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from '@/lib/auth';
import { useToast } from '../../components/Toast/Toast';
import { appendActivityLog } from '@/lib/activityLog';
import { useData } from '@/lib/DataContext';
import { formatAdminRole } from '@/lib/format';
import { apiMessage, isMockApi } from '@/lib/api/http';
import { uploadMedia } from '@/lib/api/media';
import { MediaUploadError, readImageAsMediaFile } from '@/lib/mediaUpload';
import { markIdLoaded } from '@/lib/imageLoaded';
import ProfilePageSkeleton from './components/ProfilePageSkeleton';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { setMediaFiles, setActivityLogs, isLoading } = useData();
  const { addToast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [loadedAvatar, setLoadedAvatar] = useState<Set<string>>(() => new Set());
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  useEffect(() => {
    if (!isEditing && user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user, isEditing]);

  const handleSaveProfile = () => {
    updateUser({ displayName: displayName.trim(), email: email.trim() });
    appendActivityLog(setActivityLogs, {
      action: 'update',
      targetType: 'auth',
      targetId: user?.id || 'admin',
      targetName: displayName.trim() || user?.displayName || 'Admin',
      details: 'Profile information updated',
      admin: user,
    });
    addToast('Profile updated successfully', 'success');
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setDisplayName(user?.displayName || '');
    setEmail(user?.email || '');
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (passwords.new.length < MIN_PASSWORD_LENGTH) {
      addToast(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 'error');
      return;
    }
    if (user?.passwordHash && !passwords.current) {
      addToast('Current password is required', 'error');
      return;
    }
    if (user?.passwordHash && !verifyPassword(passwords.current, user.passwordHash)) {
      addToast('Current password is incorrect', 'error');
      return;
    }
    updateUser({ passwordHash: hashPassword(passwords.new) });
    addToast('Password changed successfully', 'success');
    setShowPasswordForm(false);
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const mediaFile = isMockApi()
        ? await readImageAsMediaFile(file, 'avatars')
        : (await uploadMedia(file, 'avatars')).file;
      setMediaFiles((prev) => [mediaFile, ...prev]);
      updateUser({ avatar: mediaFile.url });
      appendActivityLog(setActivityLogs, {
        action: 'create',
        targetType: 'media',
        targetId: mediaFile.id,
        targetName: mediaFile.name,
        details: 'Profile avatar uploaded',
        admin: user,
      });
      addToast('Avatar updated and saved to Media Library', 'success');
    } catch (err) {
      const message =
        err instanceof MediaUploadError ? err.message : apiMessage(err, 'Avatar upload failed');
      addToast(message, 'error');
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
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
      <PageSEO.Profile />
      {isLoading ? (
        <ProfilePageSkeleton />
      ) : (
        <div className="mx-auto max-w-4xl space-y-6">
          <h1 className="text-2xl font-bold text-fg">My Profile</h1>

          <Card className="p-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary-100">
                  {user?.avatar ? (
                    <>
                      <img
                        src={user.avatar}
                        alt={user.displayName}
                        className="h-24 w-24 object-cover"
                        onLoad={() => markIdLoaded(setLoadedAvatar, user.id)}
                        onError={() => markIdLoaded(setLoadedAvatar, user.id)}
                      />
                      {!loadedAvatar.has(user.id) && <span className={coverSheenClass} />}
                    </>
                  ) : (
                    <User className="h-12 w-12 text-primary-600" />
                  )}
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  aria-label="Upload avatar"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  title="Change avatar"
                  disabled={isUploadingAvatar}
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 rounded-full bg-primary-600 p-2 text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-fg">{user?.displayName || 'Admin'}</h2>
                  <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                    {formatAdminRole(user?.role)}
                  </span>
                </div>

                <div className="flex flex-col gap-3 text-sm text-fg-secondary sm:flex-row sm:gap-6">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0" />
                    {user?.email || 'admin@softgatecomic.com'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0" />
                    Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-fg">Profile Information</h3>
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
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
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-2 flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-fg">Change Password</h3>
              {!showPasswordForm && (
                <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
                  Change
                </Button>
              )}
            </div>

            {!showPasswordForm && (
              <p className="text-sm text-fg-muted">Update the password for this admin account.</p>
            )}

            {showPasswordForm && (
              <div className="mt-4 space-y-4">
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
                      <p className="text-xs text-fg-muted">
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
                  <Button variant="outline" onClick={() => setShowPasswordForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
};

export default ProfilePage;
