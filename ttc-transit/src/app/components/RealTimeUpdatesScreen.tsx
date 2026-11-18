import { useState } from 'react';
import { ChevronLeft, MapPin, Clock, Train, Bus, Cable, Navigation, RefreshCw } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import type { Screen } from '../App';

interface RealTimeUpdatesScreenProps {
  onNavigate: (screen: Screen) => void;
  onViewDetails?: (routeId: string) => void;
}

export function RealTimeUpdatesScreen({ onNavigate, onViewDetails }: RealTimeUpdatesScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-[#DA291C] px-6 pt-12 pb-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => onNavigate('home')}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1>Real-Time Updates</h1>
          <button 
            onClick={handleRefresh}
            className={`ml-auto ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search route or station..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white focus:text-gray-900 transition-colors"
          />
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Nearby Stops */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3>Nearby Stops</h3>
            <button className="flex items-center gap-1 text-sm text-[#DA291C]">
              <Navigation className="w-4 h-4" />
              Use Location
            </button>
          </div>

          <Card 
            className="bg-white p-4 mb-3 rounded-xl border-none shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onViewDetails?.('union-station')}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="mb-1">Union Station</p>
                <p className="text-sm text-gray-500">0.2 km away</p>
              </div>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Open</Badge>
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-400 rounded-lg p-2">
                  <Train className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">Line 1 - Yonge-University</p>
                  <p className="text-xs text-gray-500">Northbound to Finch</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600">2 min</p>
                  <p className="text-xs text-gray-500">8, 15 min</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-green-600 rounded-lg p-2">
                  <Train className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">Line 2 - Bloor-Danforth</p>
                  <p className="text-xs text-gray-500">Westbound to Kipling</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600">4 min</p>
                  <p className="text-xs text-gray-500">10, 16 min</p>
                </div>
              </div>
            </div>
          </Card>

          <Card 
            className="bg-white p-4 mb-3 rounded-xl border-none shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onViewDetails?.('queen-station')}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="mb-1">Queen Street at Bay</p>
                <p className="text-sm text-gray-500">0.3 km away</p>
              </div>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-[#DA291C] rounded-lg p-2">
                  <Bus className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">Bus 501 - Queen</p>
                  <p className="text-xs text-gray-500">Eastbound</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600">5 min</p>
                  <p className="text-xs text-gray-500">12, 20 min</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-blue-500 rounded-lg p-2">
                  <Cable className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">Streetcar 501 - Queen</p>
                  <p className="text-xs text-gray-500">Westbound</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-yellow-600">7 min</p>
                  <p className="text-xs text-gray-500">15, 23 min</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* All Lines Status */}
        <div>
          <h3 className="mb-4">All Lines Status</h3>

          <Card className="bg-white p-4 mb-2 rounded-xl border-none shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-400 rounded-lg p-3">
                <Train className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="mb-1">Line 1 - Yonge-University</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Delay</Badge>
                  <span className="text-sm text-gray-500">10 min delays</span>
                </div>
              </div>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
          </Card>

          <Card className="bg-white p-4 mb-2 rounded-xl border-none shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 rounded-lg p-3">
                <Train className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="mb-1">Line 2 - Bloor-Danforth</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">On Time</Badge>
                  <span className="text-sm text-gray-500">Normal service</span>
                </div>
              </div>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
          </Card>

          <Card className="bg-white p-4 mb-2 rounded-xl border-none shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 rounded-lg p-3">
                <Train className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="mb-1">Line 4 - Sheppard</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">On Time</Badge>
                  <span className="text-sm text-gray-500">Normal service</span>
                </div>
              </div>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
          </Card>

          <Card className="bg-white p-4 rounded-xl border-none shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 rounded-lg p-3">
                <Cable className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="mb-1">Streetcar 510 - Spadina</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Detour</Badge>
                  <span className="text-sm text-gray-500">Via Bathurst</span>
                </div>
              </div>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
