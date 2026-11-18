import { Settings, Wallet, MessageSquare, MapPin, Bell, Star, User, ChevronRight, HelpCircle, Info, Clock } from 'lucide-react';
import { Card } from './ui/card';
import type { Screen } from '../App';

interface MoreScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function MoreScreen({ onNavigate }: MoreScreenProps) {
  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-[#DA291C] px-6 pt-12 pb-6 text-white">
        <h1 className="mb-2">More</h1>
        <p className="text-sm opacity-90">Account and app settings</p>
      </div>

      <div className="px-6 py-6">
        {/* Profile */}
        <Card className="bg-white p-4 mb-6 rounded-xl border-none shadow-sm">
          <button className="w-full flex items-center gap-4">
            <div className="bg-[#DA291C] rounded-full p-3">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="mb-1">John Doe</p>
              <p className="text-sm text-gray-500">john.doe@email.com</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </Card>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="mb-3">Quick Actions</h3>
          <Card className="bg-white rounded-xl border-none shadow-sm overflow-hidden">
            <button 
              onClick={() => onNavigate('fare')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-[#DA291C]" />
                <span>PRESTO Card</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button 
              onClick={() => onNavigate('favorites')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-[#DA291C]" />
                <span>Saved Places</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button 
              onClick={() => onNavigate('explore')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#DA291C]" />
                <span>Explore Transit</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </Card>
        </div>

        {/* Trip Tools */}
        <div className="mb-6">
          <h3 className="mb-3">Trip Tools</h3>
          <Card className="bg-white rounded-xl border-none shadow-sm overflow-hidden">
            <button 
              onClick={() => onNavigate('plan')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#DA291C]" />
                <span>Plan a Trip</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button 
              onClick={() => onNavigate('realtime')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#DA291C]" />
                <span>Real-Time Updates</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#DA291C]" />
                <span>System Map</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#DA291C]" />
                <span>Station Info</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </Card>
        </div>

        {/* Support */}
        <div className="mb-6">
          <h3 className="mb-3">Support</h3>
          <Card className="bg-white rounded-xl border-none shadow-sm overflow-hidden">
            <button 
              onClick={() => onNavigate('chat')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-[#DA291C]" />
                <span>Contact Support</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-[#DA291C]" />
                <span>Help & FAQ</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-[#DA291C]" />
                <span>About TTC</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </Card>
        </div>

        {/* Settings */}
        <Card className="bg-white rounded-xl border-none shadow-sm">
          <button 
            onClick={() => onNavigate('settings')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-[#DA291C]" />
              <span>Settings</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </Card>
      </div>
    </div>
  );
}
