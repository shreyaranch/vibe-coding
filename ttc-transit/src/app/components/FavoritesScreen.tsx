import { Star, MapPin, Clock, Bus, Train, Cable, ChevronLeft, Plus, MoreVertical } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import type { Screen } from '../App';

interface FavoritesScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function FavoritesScreen({ onNavigate }: FavoritesScreenProps) {
  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-[#DA291C] px-6 pt-12 pb-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => onNavigate('home')}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1>Favorites</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Add New Button */}
        <Button 
          onClick={() => onNavigate('plan')}
          className="w-full mb-6 bg-white text-[#DA291C] border-2 border-[#DA291C] hover:bg-[#DA291C] hover:text-white rounded-xl h-12"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Favorite
        </Button>

        {/* Saved Locations */}
        <div className="mb-6">
          <h3 className="mb-4">Saved Locations</h3>
          
          <Card className="bg-white p-4 mb-3 rounded-xl border-none shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 rounded-full p-3">
                <MapPin className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>Home</span>
                </div>
                <p className="text-sm text-gray-500">123 Queen Street West, Toronto</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </Card>

          <Card className="bg-white p-4 mb-3 rounded-xl border-none shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-full p-3">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>Work</span>
                </div>
                <p className="text-sm text-gray-500">456 Bay Street, Toronto</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </Card>

          <Card className="bg-white p-4 rounded-xl border-none shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-full p-3">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>Gym</span>
                </div>
                <p className="text-sm text-gray-500">Yorkdale Shopping Centre</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </Card>
        </div>

        {/* Favorite Routes */}
        <div>
          <h3 className="mb-4">Favorite Routes</h3>
          
          <Card 
            className="bg-white p-4 mb-3 rounded-xl border-none shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onNavigate('plan')}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>Morning Commute</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>25 min</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Train className="w-4 h-4 text-yellow-600" />
                <p className="text-sm text-gray-600">Line 1: Union Station → Finch</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>From: Home</span>
                <span>•</span>
                <span>To: Work</span>
              </div>
            </div>
          </Card>

          <Card 
            className="bg-white p-4 mb-3 rounded-xl border-none shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onNavigate('plan')}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>Weekend Shopping</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>35 min</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Train className="w-4 h-4 text-yellow-600" />
                <p className="text-sm text-gray-600">Line 1: Bloor → Yorkdale</p>
              </div>
              <div className="flex items-center gap-3">
                <Bus className="w-4 h-4 text-[#DA291C]" />
                <p className="text-sm text-gray-600">Bus 32: Yorkdale → Mall</p>
              </div>
            </div>
          </Card>

          <Card 
            className="bg-white p-4 rounded-xl border-none shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onNavigate('plan')}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>Evening Return</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>30 min</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Cable className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-gray-600">Streetcar 510: Work → Spadina</p>
              </div>
              <div className="flex items-center gap-3">
                <Train className="w-4 h-4 text-yellow-600" />
                <p className="text-sm text-gray-600">Line 1: Spadina → Home</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
