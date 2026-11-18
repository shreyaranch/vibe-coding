import { ChevronLeft, ChevronRight, Globe, Bell, Accessibility, Moon, Shield, HelpCircle, LogOut } from 'lucide-react';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { useState } from 'react';
import type { Screen } from '../App';

interface SettingsScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function SettingsScreen({ onNavigate }: SettingsScreenProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [accessibility, setAccessibility] = useState(false);

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-[#DA291C] px-6 pt-12 pb-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => onNavigate('more')}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1>Settings</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Language */}
        <div className="mb-6">
          <h3 className="mb-3">Preferences</h3>
          <Card className="bg-white rounded-xl border-none shadow-sm overflow-hidden">
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-[#DA291C]" />
                <div className="text-left">
                  <p>Language</p>
                  <p className="text-sm text-gray-500">English</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </Card>
        </div>

        {/* Notifications */}
        <div className="mb-6">
          <h3 className="mb-3">Notifications</h3>
          <Card className="bg-white rounded-xl border-none shadow-sm">
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#DA291C]" />
                <div>
                  <p>Push Notifications</p>
                  <p className="text-sm text-gray-500">Service alerts and updates</p>
                </div>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            <button 
              onClick={() => onNavigate('notifications')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span>Notification Settings</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </Card>
        </div>

        {/* Accessibility */}
        <div className="mb-6">
          <h3 className="mb-3">Accessibility</h3>
          <Card className="bg-white rounded-xl border-none shadow-sm">
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Accessibility className="w-5 h-5 text-[#DA291C]" />
                <div>
                  <p>Accessible Routes Only</p>
                  <p className="text-sm text-gray-500">Show wheelchair accessible routes</p>
                </div>
              </div>
              <Switch checked={accessibility} onCheckedChange={setAccessibility} />
            </div>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <span>Accessibility Options</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </Card>
        </div>

        {/* Display */}
        <div className="mb-6">
          <h3 className="mb-3">Display</h3>
          <Card className="bg-white rounded-xl border-none shadow-sm">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-[#DA291C]" />
                <div>
                  <p>Dark Mode</p>
                  <p className="text-sm text-gray-500">Enable dark theme</p>
                </div>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
          </Card>
        </div>

        {/* Support */}
        <div className="mb-6">
          <h3 className="mb-3">Support & Legal</h3>
          <Card className="bg-white rounded-xl border-none shadow-sm">
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-[#DA291C]" />
                <span>Help & FAQ</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#DA291C]" />
                <span>Privacy Policy</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <span>Terms of Service</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </Card>
        </div>

        {/* Account */}
        <Card className="bg-white rounded-xl border-none shadow-sm mb-6">
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-red-600">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </div>
          </button>
        </Card>

        {/* Version */}
        <p className="text-center text-sm text-gray-500">Version 2.1.0</p>
      </div>
    </div>
  );
}
