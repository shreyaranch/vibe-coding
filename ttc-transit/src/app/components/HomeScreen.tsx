import { Bus, Train, AlertTriangle, Star, MessageSquare, Wallet, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import type { Screen } from '../App';
import ttcLogo from 'figma:asset/0fb3aaf3cb15b1b2c46134f7dd8b62b9a9e3d2c5.png';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <div className="min-h-full bg-gradient-to-b from-[#DA291C] to-[#b31f15]">
      {/* Header */}
      <div className="px-6 pt-12 pb-8 text-white">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <img src={ttcLogo} alt="TTC Logo" className="h-12 w-auto" />
          </div>
        </div>
        <h1 className="text-center text-xl mb-2">Welcome to TTC</h1>
        <p className="text-center text-sm opacity-90">Your journey starts here</p>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 rounded-t-3xl px-6 pt-6 pb-6 min-h-[calc(100vh-240px)]">
        {/* Plan Trip Card */}
        <Card 
          className="bg-white p-6 mb-4 cursor-pointer hover:shadow-lg transition-shadow rounded-xl border-none shadow-md"
          onClick={() => onNavigate('plan')}
        >
          <div className="flex items-center gap-4">
            <div className="bg-[#DA291C] rounded-xl p-3">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="mb-1">Plan My Trip</h2>
              <p className="text-sm text-gray-500">Find the best route for your journey</p>
            </div>
          </div>
        </Card>

        {/* Service Status */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3>Service Status</h3>
            <button 
              onClick={() => onNavigate('explore')}
              className="text-sm text-[#DA291C]"
            >
              View All
            </button>
          </div>
          <Card className="bg-white p-4 mb-2 rounded-xl border-none shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 rounded-full p-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span>Line 1 - Yonge-University</span>
                  <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Delay</Badge>
                </div>
                <p className="text-sm text-gray-500">10 minute delay at Bloor-Yonge</p>
              </div>
            </div>
          </Card>
          <Card className="bg-white p-4 rounded-xl border-none shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-full p-2">
                <Train className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span>Line 2 - Bloor-Danforth</span>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">On Time</Badge>
                </div>
                <p className="text-sm text-gray-500">Normal service</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Real-Time Updates Card */}
        <Card 
          className="bg-white p-6 mb-4 cursor-pointer hover:shadow-lg transition-shadow rounded-xl border-none shadow-md"
          onClick={() => onNavigate('realtime')}
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-500 rounded-xl p-3">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="mb-1">Real-Time Updates</h2>
              <p className="text-sm text-gray-500">Live arrivals at nearby stops</p>
            </div>
          </div>
        </Card>

        {/* Quick Access */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <button
            onClick={() => onNavigate('favorites')}
            className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
          >
            <Star className="w-6 h-6 text-[#DA291C]" />
            <span className="text-xs text-center">Favorites</span>
          </button>
          <button
            onClick={() => onNavigate('fare')}
            className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
          >
            <Wallet className="w-6 h-6 text-[#DA291C]" />
            <span className="text-xs text-center">PRESTO</span>
          </button>
          <button
            onClick={() => onNavigate('chat')}
            className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
          >
            <MessageSquare className="w-6 h-6 text-[#DA291C]" />
            <span className="text-xs text-center">Support</span>
          </button>
        </div>

        {/* Recent Trips */}
        <div>
          <h3 className="mb-3">Recent Trips</h3>
          <Card 
            className="bg-white p-4 mb-2 cursor-pointer hover:shadow-md transition-shadow rounded-xl border-none shadow-sm"
            onClick={() => onNavigate('plan')}
          >
            <div className="flex items-center gap-3">
              <Bus className="w-5 h-5 text-[#DA291C]" />
              <div className="flex-1">
                <p className="mb-1">Union Station → Yorkdale</p>
                <p className="text-sm text-gray-500">Line 1 • 25 min</p>
              </div>
              <span className="text-sm text-gray-400">Today</span>
            </div>
          </Card>
          <Card 
            className="bg-white p-4 cursor-pointer hover:shadow-md transition-shadow rounded-xl border-none shadow-sm"
            onClick={() => onNavigate('plan')}
          >
            <div className="flex items-center gap-3">
              <Bus className="w-5 h-5 text-[#DA291C]" />
              <div className="flex-1">
                <p className="mb-1">Finch → Kennedy</p>
                <p className="text-sm text-gray-500">Line 1 + Line 2 • 45 min</p>
              </div>
              <span className="text-sm text-gray-400">Yesterday</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MapPin({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
