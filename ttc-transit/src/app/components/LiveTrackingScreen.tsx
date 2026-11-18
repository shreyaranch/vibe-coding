import { ChevronLeft, MapPin, Navigation, Clock, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { Screen } from '../App';

interface LiveTrackingScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function LiveTrackingScreen({ onNavigate }: LiveTrackingScreenProps) {
  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('journey-details')}>
            <ChevronLeft className="w-6 h-6 text-[#1B1E23]" />
          </button>
          <h1 className="text-[#1B1E23]">Live Tracking</h1>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="relative h-64 bg-gray-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Live Map View</p>
          </div>
        </div>

        {/* Current Route Badge */}
        <div className="absolute top-4 left-4 right-4">
          <Card className="bg-white p-3 rounded-xl shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-[#FDB913] rounded-lg p-2">
                <Navigation className="w-4 h-4 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#1B1E23]">Line 1 - Northbound</p>
                <p className="text-xs text-gray-500">To Finch Station</p>
              </div>
              <Badge className="bg-[#00B140] text-white hover:bg-[#00B140]">
                On Track
              </Badge>
            </div>
          </Card>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Next Stop */}
        <Card className="bg-white p-4 mb-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#1B1E23]">Next Stop</h3>
            <Badge className="bg-[#FDB913] text-black hover:bg-[#FDB913]">Arriving</Badge>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <MapPin className="w-5 h-5 text-[#DA291C]" />
            <div className="flex-1">
              <p className="text-[#1B1E23]">Bloor-Yonge Station</p>
              <p className="text-sm text-gray-500">Platform 1</p>
            </div>
            <div className="text-right">
              <p className="text-lg text-[#00B140]">2 min</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>ETA: 8:42 AM</span>
            </div>
          </div>
        </Card>

        {/* Upcoming Stops */}
        <div className="mb-6">
          <h3 className="text-[#1B1E23] mb-4">Upcoming Stops</h3>

          <div className="space-y-2">
            <Card className="bg-white p-3 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  <span className="text-sm text-[#1B1E23]">Rosedale</span>
                </div>
                <span className="text-sm text-gray-500">6 min</span>
              </div>
            </Card>

            <Card className="bg-white p-3 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  <span className="text-sm text-[#1B1E23]">Summerhill</span>
                </div>
                <span className="text-sm text-gray-500">9 min</span>
              </div>
            </Card>

            <Card className="bg-red-50 border-2 border-[#DA291C] p-3 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#DA291C] rounded-full" />
                  <span className="text-sm text-[#1B1E23]">Yorkdale (Your Stop)</span>
                </div>
                <span className="text-sm text-[#DA291C]">18 min</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Alert */}
        <Card className="bg-yellow-50 border border-yellow-200 p-4 mb-6 rounded-xl">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-900">
              Remember to exit at Yorkdale Station in 18 minutes
            </p>
          </div>
        </Card>

        {/* End Trip Button */}
        <Button 
          variant="outline"
          onClick={() => onNavigate('plan')}
          className="w-full h-12 border-2 border-[#DA291C] text-[#DA291C] hover:bg-red-50 rounded-xl"
        >
          End Trip
        </Button>
      </div>
    </div>
  );
}
