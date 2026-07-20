import { useState } from 'react';
import { Save, Bell, Shield, Globe, Palette } from 'lucide-react';
import { Card, Button, Input, Toggle, PageSEO } from '../../components';

import { useData } from '@/lib/DataContext';

const SettingsPage = () => {
  const { settings: initialSettings, setSettings: saveSettings } = useData();
  const [settings, setSettings] = useState(initialSettings);

  const handleSave = () => {
    saveSettings(settings);
    alert('Settings saved successfully!');
  };

  return (
    <>
      <PageSEO.Settings />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="mt-1 text-gray-500">Manage platform settings</p>
          </div>
          <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave}>
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
            </div>
            <div className="space-y-4">
              <Input
                label="Site Name"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
              <div>
                <label
                  htmlFor="site-description"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Site Description
                </label>
                <textarea
                  id="site-description"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  rows={3}
                  className="input-base"
                />
              </div>
              <Input
                label="Contact Email"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              />
              <div>
                <label
                  htmlFor="default-language"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Default Language
                </label>
                <select
                  id="default-language"
                  value={settings.defaultLanguage}
                  onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                  className="input-base"
                >
                  <option value="en">English</option>
                  <option value="my">Myanmar</option>
                </select>
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-2 text-green-600">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
            </div>
            <div className="space-y-4">
              <Toggle
                checked={settings.allowRegistration}
                label="Allow Registration"
                description="Allow new users to register"
                onChange={(checked) => setSettings({ ...settings, allowRegistration: checked })}
              />
              <Toggle
                checked={settings.requireEmailVerification}
                label="Require Email Verification"
                description="Users must verify their email"
                onChange={(checked) =>
                  setSettings({ ...settings, requireEmailVerification: checked })
                }
              />
              <Toggle
                checked={settings.maintenanceMode}
                label="Maintenance Mode"
                description="Put site in maintenance mode"
                onChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                className={settings.maintenanceMode ? '!bg-red-600' : ''}
              />
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <Bell className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <Toggle
                  key={key}
                  checked={value}
                  label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                  description={`Receive notifications for ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
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
              <div className="rounded-lg bg-yellow-50 p-2 text-yellow-600">
                <Palette className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Appearance Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="default-theme"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Default Theme
                </label>
                <select
                  id="default-theme"
                  value={settings.defaultTheme}
                  onChange={(e) => setSettings({ ...settings, defaultTheme: e.target.value })}
                  className="input-base"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-2 text-sm font-medium text-gray-700">Primary Color</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="h-8 w-8 rounded-full bg-primary-600 ring-2 ring-primary-600 ring-offset-2"
                    title="Teal"
                  />
                  <button type="button" className="h-8 w-8 rounded-full bg-blue-600" title="Blue" />
                  <button
                    type="button"
                    className="h-8 w-8 rounded-full bg-green-600"
                    title="Green"
                  />
                  <button type="button" className="h-8 w-8 rounded-full bg-red-600" title="Red" />
                  <button
                    type="button"
                    className="h-8 w-8 rounded-full bg-orange-600"
                    title="Orange"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
