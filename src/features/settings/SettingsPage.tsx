import { useState } from 'react';
import { Save, Bell, Shield, Globe, Palette } from 'lucide-react';
import { Card, Button, Input, Toggle, PageSEO } from '../../components';

import { useAuth } from '@/features/auth/useAuth';
import { useStaffAccess } from '@/lib/auth/staffAccess';
import { appendActivityLog } from '@/lib/activityLog';
import { useData } from '@/lib/DataContext';
import { ThemePreference, useTheme } from '@/lib/theme';
import SettingsPageSkeleton from './components/SettingsPageSkeleton';

const SettingsPage = () => {
  const { user } = useAuth();
  const { canWriteSettings } = useStaffAccess();
  const { preference, resolvedTheme, setPreference } = useTheme();
  const {
    settings: initialSettings,
    setSettings: saveSettings,
    setActivityLogs,
    isLoading,
  } = useData();
  const [settings, setSettings] = useState(initialSettings);

  const handleSave = () => {
    if (!canWriteSettings) return;
    saveSettings(settings);
    appendActivityLog(setActivityLogs, {
      action: 'update',
      targetType: 'settings',
      targetId: 'platform-settings',
      targetName: 'Platform settings',
      admin: user,
    });
    alert('Settings saved successfully!');
  };

  return (
    <>
      <PageSEO.Settings />
      {isLoading ? (
        <SettingsPageSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-fg">Settings</h1>
              <p className="mt-1 text-fg-secondary">Manage platform settings</p>
            </div>
            {canWriteSettings ? (
              <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave}>
                Save Changes
              </Button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-primary-50 p-2 text-primary-600 dark:bg-primary-950 dark:text-primary-300">
                  <Globe className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-fg">General Settings</h3>
              </div>
              <div className="space-y-4">
                <Input
                  label="Site Name"
                  value={settings.siteName}
                  disabled={!canWriteSettings}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                />
                <div>
                  <label
                    htmlFor="site-description"
                    className="mb-1.5 block text-sm font-medium text-fg-secondary"
                  >
                    Site Description
                  </label>
                  <textarea
                    id="site-description"
                    value={settings.siteDescription}
                    disabled={!canWriteSettings}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    rows={3}
                    className="input-base"
                  />
                </div>
                <Input
                  label="Contact Email"
                  type="email"
                  value={settings.contactEmail}
                  disabled={!canWriteSettings}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                />
                <div>
                  <label
                    htmlFor="default-language"
                    className="mb-1.5 block text-sm font-medium text-fg-secondary"
                  >
                    Default Language
                  </label>
                  <select
                    id="default-language"
                    value={settings.defaultLanguage}
                    disabled={!canWriteSettings}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        defaultLanguage: e.target.value === 'mm' ? 'mm' : 'en',
                      })
                    }
                    className="input-base"
                  >
                    <option value="en">English</option>
                    <option value="mm">Myanmar</option>
                  </select>
                </div>
              </div>
            </Card>

            <Card>
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-primary-50 p-2 text-primary-600 dark:bg-primary-950 dark:text-primary-300">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-fg">Security Settings</h3>
              </div>
              <div className="space-y-4">
                <Toggle
                  checked={settings.allowRegistration}
                  label="Allow Registration"
                  description="Allow new users to register"
                  disabled={!canWriteSettings}
                  onChange={(checked) => setSettings({ ...settings, allowRegistration: checked })}
                />
                <Toggle
                  checked={settings.requireEmailVerification}
                  label="Require Email Verification"
                  description="Users must verify their email"
                  disabled={!canWriteSettings}
                  onChange={(checked) =>
                    setSettings({ ...settings, requireEmailVerification: checked })
                  }
                />
                <Toggle
                  checked={settings.maintenanceMode}
                  label="Maintenance Mode"
                  description="Put site in maintenance mode"
                  disabled={!canWriteSettings}
                  onChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                  className={settings.maintenanceMode ? '!bg-red-600' : ''}
                />
              </div>
            </Card>

            <Card>
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-primary-50 p-2 text-primary-600 dark:bg-primary-950 dark:text-primary-300">
                  <Bell className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-fg">Notification Settings</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <Toggle
                    key={key}
                    checked={value}
                    label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    description={`Receive notifications for ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                    disabled={!canWriteSettings}
                    onChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, [key]: checked },
                      })
                    }
                  />
                ))}
              </div>
            </Card>

            <Card>
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-primary-50 p-2 text-primary-600 dark:bg-primary-950 dark:text-primary-300">
                  <Palette className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-fg">Appearance Settings</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="theme-preference"
                    className="mb-1.5 block text-sm font-medium text-fg-secondary"
                  >
                    Theme
                  </label>
                  <select
                    id="theme-preference"
                    value={preference}
                    onChange={(e) => setPreference(e.target.value as ThemePreference)}
                    className="input-base"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                  <p className="mt-1.5 text-xs text-fg-secondary">
                    {preference === 'system'
                      ? `Following device (currently ${resolvedTheme === 'dark' ? 'Dark' : 'Light'}). Changes apply immediately.`
                      : `Active appearance: ${resolvedTheme === 'dark' ? 'Dark' : 'Light'}. Changes apply immediately.`}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsPage;
