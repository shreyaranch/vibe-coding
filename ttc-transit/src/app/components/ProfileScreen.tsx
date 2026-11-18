import { User, Globe, Accessibility, MessageSquare, ChevronRight } from 'lucide-react';
import { Card } from './ui/card';
import type { Screen } from '../App';
import ttcLogo from 'figma:asset/0fb3aaf3cb15b1b2c46134f7dd8b62b9a9e3d2c5.png';

interface ProfileScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  return (
    <div className="min-h-full bg-gray-50">
      {/* Header with TTC Logo */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <img src={ttcLogo} alt="TTC" className="h-8 w-auto" />
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-[#DA291C] rounded-full p-3">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-[#1B1E23] mb-1">John Doe</h1>
            <p className="text-sm text-gray-500">Toronto, ON</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Settings Options */}
        <div className="space-y-3 mb-6">
          {/* Language */}
          <Card 
            className="bg-white rounded-xl border-none shadow-sm overflow-hidden cursor-pointer"
            onClick={() => onNavigate('language')}
          >
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-lg p-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[#1B1E23]">Language</p>
                  <p className="text-sm text-gray-500">English</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>

          {/* Accessibility */}
          <Card 
            className="bg-white rounded-xl border-none shadow-sm overflow-hidden cursor-pointer"
            onClick={() => onNavigate('accessibility')}
          >
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 rounded-lg p-2">
                  <Accessibility className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-[#1B1E23]">Accessibility</p>
                  <p className="text-sm text-gray-500">Customize preferences</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>

          {/* Chat Support */}
          <Card 
            className="bg-white rounded-xl border-none shadow-sm overflow-hidden cursor-pointer"
            onClick={() => onNavigate('chat')}
          >
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 rounded-lg p-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-[#1B1E23]">Chat Support</p>
                  <p className="text-sm text-gray-500">Get help</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
        </div>

        {/* TTC Info */}
        <Card className="bg-white p-6 rounded-xl border-none shadow-sm mb-24">
          <div className="text-center">
            <img src={ttcLogo} alt="TTC Logo" className="h-12 w-auto mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1">Toronto Transit Commission</p>
            <p className="text-xs text-gray-500">Version 2.1.0</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
