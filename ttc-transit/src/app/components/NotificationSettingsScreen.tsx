import { ChevronLeft, Bell, Clock, AlertTriangle, MapPin } from 'lucide-react';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useState } from 'react';
import type { Screen } from '../App';

interface NotificationSettingsScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function NotificationSettingsScreen({ onNavigate }: NotificationSettingsScreenProps) {
  const [departureAlerts, setDepartureAlerts] = useState(true);
  const [delayAlerts, setDelayAlerts] = useState(true);
  const [arrivalAlerts, setArrivalAlerts] = useState(true);
  const [serviceAlerts, setServiceAlerts] = useState(true);
  const [reminderTime, setReminderTime] = useState('10');

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-[#DA291C] px-6 pt-12 pb-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => onNavigate('settings')}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1>Notification Settings</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Trip Alerts */}
        <div className="mb-6">
          <h3 className="mb-4">Trip Alerts</h3>

          <Card className="bg-white rounded-xl border-none shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#DA291C]" />
                  <div>
                    <p>Departure Reminders</p>
                    <p className="text-sm text-gray-500">Get notified before your trip</p>
                  </div>
                </div>
                <Switch checked={departureAlerts} onCheckedChange={setDepartureAlerts} />
              </div>
            </div>

            {departureAlerts && (
              <div className="p-4 bg-gray-50">
                <label className="text-sm text-gray-700 mb-2 block">Remind me</label>
                <Select value={reminderTime} onValueChange={setReminderTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes before</SelectItem>
                    <SelectItem value="10">10 minutes before</SelectItem>
                    <SelectItem value="15">15 minutes before</SelectItem>
                    <SelectItem value="20">20 minutes before</SelectItem>
                    <SelectItem value="30">30 minutes before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#DA291C]" />
                  <div>
                    <p>Arrival Notifications</p>
                    <p className="text-sm text-gray-500">Alert when approaching your stop</p>
                  </div>
                </div>
                <Switch checked={arrivalAlerts} onCheckedChange={setArrivalAlerts} />
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#DA291C]" />
                  <div>
                    <p>Delay Alerts</p>
                    <p className="text-sm text-gray-500">Notify about delays on saved routes</p>
                  </div>
                </div>
                <Switch checked={delayAlerts} onCheckedChange={setDelayAlerts} />
              </div>
            </div>
          </Card>
        </div>

        {/* Service Updates */}
        <div className="mb-6">
          <h3 className="mb-4">Service Updates</h3>

          <Card className="bg-white rounded-xl border-none shadow-sm">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-[#DA291C]" />
                  <div>
                    <p>Service Alerts</p>
                    <p className="text-sm text-gray-500">System-wide disruptions and updates</p>
                  </div>
                </div>
                <Switch checked={serviceAlerts} onCheckedChange={setServiceAlerts} />
              </div>
            </div>
          </Card>
        </div>

        {/* Favorite Routes */}
        <div>
          <h3 className="mb-4">Monitor Favorite Routes</h3>

          <Card className="bg-white rounded-xl border-none shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1">Morning Commute</p>
                  <p className="text-sm text-gray-500">Line 1: Union → Finch</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1">Weekend Shopping</p>
                  <p className="text-sm text-gray-500">Line 1 + Bus 32</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1">Evening Return</p>
                  <p className="text-sm text-gray-500">Streetcar 510 + Line 1</p>
                </div>
                <Switch />
              </div>
            </div>
          </Card>
        </div>

        {/* Info */}
        <Card className="bg-blue-50 border border-blue-200 p-4 mt-6 rounded-xl">
          <div className="flex gap-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-blue-900 mb-1">Notification Tips</p>
              <p className="text-xs text-blue-700">
                We'll send you push notifications based on your preferences. Make sure notifications are enabled in your device settings.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
