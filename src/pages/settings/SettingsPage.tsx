import { useState } from 'react'
import { Save, Bell, Shield, Globe, Palette } from 'lucide-react'
import { Card, Button, Input, Toggle, PageSEO } from '../../components'

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    siteName: 'WebPad',
    siteDescription: 'Your gateway to amazing webtoons',
    contactEmail: 'admin@webpad.com',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    defaultLanguage: 'en',
    defaultTheme: 'light',
    notifications: {
      newUser: true,
      newWebtoon: true,
      newComment: true,
      reportSubmitted: true,
    },
  })

  const handleSave = () => {
    alert('Settings saved successfully!')
  }

  return (
    <>
      <PageSEO.Settings />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 mt-1">Manage platform settings</p>
          </div>
          <Button leftIcon={<Save className="w-4 h-4" />} onClick={handleSave}>
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
                <Globe className="w-5 h-5" />
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
                  className="block text-sm font-medium text-gray-700 mb-1.5"
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
                  className="block text-sm font-medium text-gray-700 mb-1.5"
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
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-50 text-green-600">
                <Shield className="w-5 h-5" />
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
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Bell className="w-5 h-5" />
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
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-yellow-50 text-yellow-600">
                <Palette className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Appearance Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="default-theme"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
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
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-2">Primary Color</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full bg-primary-600 ring-2 ring-offset-2 ring-primary-600"
                    title="Purple"
                  />
                  <button type="button" className="w-8 h-8 rounded-full bg-blue-600" title="Blue" />
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full bg-green-600"
                    title="Green"
                  />
                  <button type="button" className="w-8 h-8 rounded-full bg-red-600" title="Red" />
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full bg-orange-600"
                    title="Orange"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

export default SettingsPage
