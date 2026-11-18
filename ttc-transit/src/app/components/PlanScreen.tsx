import { useState } from 'react';
import { MapPin, Clock, Star, Navigation, Plane, ShoppingBag, Building2, Accessibility, MoveUpRight, Search, Train, Bus, Cable, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import type { Screen } from '../App';
import ttcLogo from 'figma:asset/0fb3aaf3cb15b1b2c46134f7dd8b62b9a9e3d2c5.png';
import mapImage from 'figma:asset/b549d4f136598e54fc425d19a6e991cbdeb918ea.png';

interface PlanScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function PlanScreen({ onNavigate }: PlanScreenProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const popularDestinations = [
    { name: 'Union Station', icon: Building2 },
    { name: 'Pearson Airport', icon: Plane },
    { name: 'Yorkdale Mall', icon: ShoppingBag },
    { name: 'Scarborough TC', icon: ShoppingBag },
    { name: 'Eaton Centre', icon: ShoppingBag },
  ];

  return (
    <div className="h-full bg-gray-50 relative flex flex-col overflow-hidden">
      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden">
        {/* Map Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${mapImage})`
          }}
        >
          {/* Live Transit Markers */}
          <div className="absolute top-[35%] left-[48%] animate-pulse">
            <div className="bg-[#FDB913] rounded-full p-2 shadow-lg border-2 border-white">
              <Train className="w-4 h-4 text-black" />
            </div>
          </div>

          <div className="absolute top-[55%] left-[65%] animate-pulse" style={{ animationDelay: '0.5s' }}>
            <div className="bg-[#DA291C] rounded-full p-2 shadow-lg border-2 border-white">
              <Bus className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="absolute top-[45%] left-[30%] animate-pulse" style={{ animationDelay: '1s' }}>
            <div className="bg-blue-600 rounded-full p-2 shadow-lg border-2 border-white">
              <Cable className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="absolute top-[25%] left-[50%] animate-pulse" style={{ animationDelay: '1.5s' }}>
            <div className="bg-[#00B140] rounded-full p-2 shadow-lg border-2 border-white">
              <Train className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Station Markers */}
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white rounded-full p-3 shadow-xl border-2 border-[#DA291C]">
              <MapPin className="w-5 h-5 text-[#DA291C]" />
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded shadow text-xs">
              Union Station
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-10 space-y-2">
          <Button
            size="sm"
            className="bg-white hover:bg-gray-100 text-gray-700 shadow-lg rounded-lg h-10 w-10 p-0"
          >
            <Navigation className="w-4 h-4" />
          </Button>
        </div>

        {/* TTC Logo on Map */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-white/95 backdrop-blur rounded-lg px-3 py-2 shadow-lg">
            <img src={ttcLogo} alt="TTC" className="h-6 w-auto" />
          </div>
        </div>
      </div>

      {/* Retractable Bottom Sheet */}
      <div 
        className={`absolute left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 ease-out ${
          isExpanded ? 'bottom-0 h-[75%]' : 'bottom-0 h-[120px]'
        }`}
        style={{ zIndex: 20 }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex flex-col items-center gap-1 py-2 px-4 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400 mt-1" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-400 mt-1" />
            )}
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto h-[calc(100%-60px)] pb-24">
          {/* Header with TTC Logo */}
          <div className="bg-white px-6 pb-6 border-b border-gray-200">
            <h1 className="text-[#1B1E23]">Plan Your Trip</h1>
          </div>

          <div className="px-6 py-6">
            {/* Trip Planner Inputs */}
            <Card className="bg-white p-5 mb-6 rounded-xl border-none shadow-sm">
              <div className="space-y-4">
                {/* From Field */}
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">From</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                    <Input
                      placeholder="Current location"
                      className="pl-11 h-12 bg-gray-50 border-gray-200 rounded-xl"
                    />
                  </div>
                </div>

                {/* To Field */}
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">To</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#DA291C]" />
                    <Input
                      placeholder="Enter destination"
                      className="pl-11 h-12 bg-gray-50 border-gray-200 rounded-xl"
                    />
                  </div>
                </div>

                {/* Departure Time (Optional) */}
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">When</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Leave now"
                      className="pl-11 h-12 bg-gray-50 border-gray-200 rounded-xl"
                    />
                  </div>
                </div>

                {/* Find Route Button */}
                <Button
                  onClick={() => onNavigate('journey-details')}
                  className="w-full h-12 bg-[#DA291C] hover:bg-[#b31f15] text-white rounded-xl mt-2"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Find Route
                </Button>
              </div>
            </Card>

            {/* Favorites Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#1B1E23]">Favorites</h3>
                <button className="text-sm text-[#DA291C]">Edit</button>
              </div>

              <div className="space-y-3">
                {/* Favorite Route 1 */}
                <Card 
                  className="bg-white p-4 rounded-xl border-none shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onNavigate('journey-details')}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-[#FDB913] text-[#FDB913]" />
                      <div>
                        <p className="text-[#1B1E23] mb-1">Home to Work</p>
                        <p className="text-sm text-gray-500">Queen St W → Bay St</p>
                      </div>
                    </div>
                    <Badge className="bg-[#00B140] text-white hover:bg-[#00B140]">
                      On Time
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>25 min</span>
                    </div>
                    <div className="text-sm text-gray-600">$3.35</div>
                    <div className="flex items-center gap-1 ml-auto">
                      <div className="bg-gray-100 rounded p-1" title="Elevator available">
                        <MoveUpRight className="w-3 h-3 text-gray-600" />
                      </div>
                      <div className="bg-gray-100 rounded p-1" title="Wheelchair accessible">
                        <Accessibility className="w-3 h-3 text-gray-600" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Badge className="bg-[#FDB913] text-black hover:bg-[#FDB913] text-xs">
                      Line 1
                    </Badge>
                    <Badge className="bg-[#DA291C] text-white hover:bg-[#DA291C] text-xs">
                      504 King
                    </Badge>
                  </div>
                </Card>

                {/* Favorite Route 2 */}
                <Card 
                  className="bg-white p-4 rounded-xl border-none shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onNavigate('journey-details')}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-[#FDB913] text-[#FDB913]" />
                      <div>
                        <p className="text-[#1B1E23] mb-1">Weekend Shopping</p>
                        <p className="text-sm text-gray-500">Bloor-Yonge → Yorkdale</p>
                      </div>
                    </div>
                    <Badge className="bg-[#00B140] text-white hover:bg-[#00B140]">
                      On Time
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>18 min</span>
                    </div>
                    <div className="text-sm text-gray-600">$3.35</div>
                    <div className="flex items-center gap-1 ml-auto">
                      <div className="bg-gray-100 rounded p-1" title="Elevator available">
                        <MoveUpRight className="w-3 h-3 text-gray-600" />
                      </div>
                      <div className="bg-gray-100 rounded p-1" title="Wheelchair accessible">
                        <Accessibility className="w-3 h-3 text-gray-600" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Badge className="bg-[#FDB913] text-black hover:bg-[#FDB913] text-xs">
                      Line 1
                    </Badge>
                  </div>
                </Card>
              </div>
            </div>

            {/* Door-to-Door Journey Options */}
            <div className="mb-6">
              <h3 className="text-[#1B1E23] mb-4">Suggested Routes</h3>
              
              <div className="space-y-3">
                {/* Route Option 1 - Fastest */}
                <Card 
                  className="bg-white p-4 rounded-xl border-2 border-[#DA291C] shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onNavigate('journey-details')}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge className="bg-[#DA291C] text-white hover:bg-[#DA291C] mb-2 text-xs">
                        Fastest Route
                      </Badge>
                      <p className="text-[#1B1E23]">Via Line 1 & Bus 32</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#DA291C]" />
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">25 min</span>
                    </div>
                    <div className="text-sm text-gray-600">$3.35</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-[#FDB913] rounded p-1">
                      <Train className="w-3 h-3 text-black" />
                    </div>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <div className="bg-[#DA291C] rounded p-1">
                      <Bus className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                      <Accessibility className="w-3 h-3 text-gray-600" />
                      <MoveUpRight className="w-3 h-3 text-gray-600" />
                    </div>
                  </div>
                </Card>

                {/* Route Option 2 - Least Transfers */}
                <Card 
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-[#DA291C] transition-all"
                  onClick={() => onNavigate('journey-details')}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 mb-2 text-xs">
                        Least Transfers
                      </Badge>
                      <p className="text-[#1B1E23]">Via Line 1 Only</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">28 min</span>
                    </div>
                    <div className="text-sm text-gray-600">$3.35</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-[#FDB913] rounded p-1">
                      <Train className="w-3 h-3 text-black" />
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                      <Accessibility className="w-3 h-3 text-gray-600" />
                      <MoveUpRight className="w-3 h-3 text-gray-600" />
                    </div>
                  </div>
                </Card>

                {/* Route Option 3 - Alternative */}
                <Card 
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-[#DA291C] transition-all"
                  onClick={() => onNavigate('journey-details')}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 mb-2 text-xs">
                        Alternative
                      </Badge>
                      <p className="text-[#1B1E23]">Via Streetcar 504 & Line 1</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">32 min</span>
                    </div>
                    <div className="text-sm text-gray-600">$3.35</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-blue-600 rounded p-1">
                      <Cable className="w-3 h-3 text-white" />
                    </div>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <div className="bg-[#FDB913] rounded p-1">
                      <Train className="w-3 h-3 text-black" />
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                      <Accessibility className="w-3 h-3 text-gray-600" />
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Popular Destinations */}
            <div className="mb-6">
              <h3 className="text-[#1B1E23] mb-4">Popular Destinations</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {popularDestinations.map((destination) => {
                  const Icon = destination.icon;
                  return (
                    <button
                      key={destination.name}
                      onClick={() => onNavigate('journey-details')}
                      className="bg-white border-2 border-gray-200 rounded-xl px-4 py-4 hover:border-[#DA291C] hover:bg-red-50 transition-all"
                    >
                      <Icon className="w-6 h-6 text-[#DA291C] mb-2" />
                      <p className="text-sm text-[#1B1E23] text-left">{destination.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
