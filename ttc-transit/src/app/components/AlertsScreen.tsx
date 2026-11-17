import { AlertTriangle, AlertCircle, CheckCircle, Info, Train, Bus, Cable, ChevronLeft, Bell, BellOff } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import type { Screen } from '../App';
import { useState } from 'react';

interface AlertsScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function AlertsScreen({ onNavigate }: AlertsScreenProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-[#DA291C] px-6 pt-12 pb-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => onNavigate('home')}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1>Service Alerts</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Notifications Toggle */}
        <Card className="bg-white p-4 mb-6 rounded-xl border-none shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {notificationsEnabled ? (
                <Bell className="w-5 h-5 text-[#DA291C]" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p>Push Notifications</p>
                <p className="text-sm text-gray-500">Get alerts for delays and disruptions</p>
              </div>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="planned">Planned</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            {/* Critical Alert */}
            <Card className="bg-red-50 border-2 border-red-200 p-4 rounded-xl">
              <div className="flex gap-3">
                <div className="bg-red-500 rounded-full p-2 h-fit">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Train className="w-4 h-4 text-red-600" />
                    <span>Line 1 - Yonge-University</span>
                    <Badge className="bg-red-500 text-white hover:bg-red-500">Critical</Badge>
                  </div>
                  <p className="mb-2">Major delay between Bloor-Yonge and St. George stations due to signal problems.</p>
                  <p className="text-sm text-gray-600">Shuttle buses operating</p>
                  <p className="text-xs text-gray-500 mt-2">Updated 5 min ago</p>
                </div>
              </div>
            </Card>

            {/* Warning Alert */}
            <Card className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-xl">
              <div className="flex gap-3">
                <div className="bg-yellow-500 rounded-full p-2 h-fit">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Bus className="w-4 h-4 text-yellow-700" />
                    <span>Bus 32 - Eglinton West</span>
                    <Badge className="bg-yellow-500 text-white hover:bg-yellow-500">Delay</Badge>
                  </div>
                  <p className="mb-2">15 minute delays due to heavy traffic on Eglinton Avenue.</p>
                  <p className="text-sm text-gray-600">Consider alternate routes</p>
                  <p className="text-xs text-gray-500 mt-2">Updated 12 min ago</p>
                </div>
              </div>
            </Card>

            {/* Info Alert */}
            <Card className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
              <div className="flex gap-3">
                <div className="bg-blue-500 rounded-full p-2 h-fit">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Cable className="w-4 h-4 text-blue-700" />
                    <span>Streetcar 510 - Spadina</span>
                    <Badge className="bg-blue-500 text-white hover:bg-blue-500">Detour</Badge>
                  </div>
                  <p className="mb-2">Temporary detour via Bathurst Street due to construction.</p>
                  <p className="text-sm text-gray-600">Normal service expected by 6:00 PM</p>
                  <p className="text-xs text-gray-500 mt-2">Updated 30 min ago</p>
                </div>
              </div>
            </Card>

            {/* Normal Service */}
            <Card className="bg-green-50 border border-green-200 p-4 rounded-xl">
              <div className="flex gap-3">
                <div className="bg-green-500 rounded-full p-2 h-fit">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Train className="w-4 h-4 text-green-700" />
                    <span>Line 2 - Bloor-Danforth</span>
                    <Badge className="bg-green-500 text-white hover:bg-green-500">On Time</Badge>
                  </div>
                  <p className="text-gray-700">Normal service on all trains.</p>
                  <p className="text-xs text-gray-500 mt-2">Updated 2 min ago</p>
                </div>
              </div>
            </Card>

            <Card className="bg-green-50 border border-green-200 p-4 rounded-xl">
              <div className="flex gap-3">
                <div className="bg-green-500 rounded-full p-2 h-fit">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Train className="w-4 h-4 text-green-700" />
                    <span>Line 4 - Sheppard</span>
                    <Badge className="bg-green-500 text-white hover:bg-green-500">On Time</Badge>
                  </div>
                  <p className="text-gray-700">Normal service on all trains.</p>
                  <p className="text-xs text-gray-500 mt-2">Updated 5 min ago</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="planned" className="space-y-4">
            <Card className="bg-white border border-gray-200 p-4 rounded-xl">
              <div className="flex gap-3">
                <div className="bg-purple-500 rounded-full p-2 h-fit">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Train className="w-4 h-4 text-purple-700" />
                    <span>Line 1 - Weekend Closure</span>
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Planned</Badge>
                  </div>
                  <p className="mb-2">No service between Finch and St. Clair stations.</p>
                  <p className="text-sm text-gray-600">Saturday, Nov 9 - Sunday, Nov 10</p>
                  <p className="text-sm text-gray-600 mt-1">Shuttle buses will operate</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white border border-gray-200 p-4 rounded-xl">
              <div className="flex gap-3">
                <div className="bg-purple-500 rounded-full p-2 h-fit">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Bus className="w-4 h-4 text-purple-700" />
                    <span>Bus 7 - Bathurst - Schedule Change</span>
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Planned</Badge>
                  </div>
                  <p className="mb-2">New schedule starting Monday, Nov 11.</p>
                  <p className="text-sm text-gray-600">Increased frequency during peak hours</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
