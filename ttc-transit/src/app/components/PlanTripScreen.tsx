import { useState } from 'react';
import { MapPin, Navigation, Clock, DollarSign, Bus, Train, Cable, ArrowRight, Accessibility, ChevronLeft } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { Screen } from '../App';

interface PlanTripScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function PlanTripScreen({ onNavigate }: PlanTripScreenProps) {
  const [showResults, setShowResults] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const handleSearch = () => {
    if (from && to) {
      setShowResults(true);
    }
  };

  return (
    <div className="min-h-full bg-white">
      {/* Header */}
      <div className="bg-[#DA291C] px-6 pt-12 pb-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => onNavigate('home')}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1>Plan Your Trip</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Input Section */}
        <div className="mb-6">
          <div className="relative mb-4">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Navigation className="w-5 h-5 text-green-600" />
            </div>
            <Input
              type="text"
              placeholder="From: Current Location"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="pl-12 h-14 rounded-xl border-2 border-gray-200 focus:border-[#DA291C]"
            />
          </div>
          
          <div className="relative mb-4">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <MapPin className="w-5 h-5 text-[#DA291C]" />
            </div>
            <Input
              type="text"
              placeholder="To: Enter destination"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="pl-12 h-14 rounded-xl border-2 border-gray-200 focus:border-[#DA291C]"
            />
          </div>

          <Button 
            onClick={handleSearch}
            className="w-full h-12 bg-[#DA291C] hover:bg-[#b31f15] text-white rounded-xl"
          >
            Find Routes
          </Button>
        </div>

        {/* Results */}
        {showResults && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3>Suggested Routes</h3>
              <span className="text-sm text-gray-500">3 options</span>
            </div>

            {/* Route Option 1 - Fastest */}
            <Card className="bg-white border-2 border-[#DA291C] p-4 mb-4 rounded-xl shadow-md">
              <div className="flex items-center justify-between mb-3">
                <Badge className="bg-[#DA291C] text-white hover:bg-[#DA291C]">Fastest</Badge>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">28 min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">$3.30</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-400 rounded-lg p-2">
                    <Train className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p>Line 1 - Yonge-University</p>
                    <p className="text-sm text-gray-500">Union Station → Yorkdale</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-[#DA291C] rounded-lg p-2">
                    <Bus className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p>Bus 32 - Eglinton West</p>
                    <p className="text-sm text-gray-500">Yorkdale → Destination</p>
                  </div>
                  <Accessibility className="w-4 h-4 text-green-600" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Departs in 5 min</span>
                  <Button 
                    onClick={() => onNavigate('journey-details')}
                    className="bg-[#DA291C] hover:bg-[#b31f15] text-white rounded-lg"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>

            {/* Route Option 2 - Fewest Transfers */}
            <Card className="bg-white border border-gray-200 p-4 mb-4 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Fewest Transfers</Badge>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">35 min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">$3.30</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-400 rounded-lg p-2">
                    <Train className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p>Line 1 - Yonge-University</p>
                    <p className="text-sm text-gray-500">Direct route • No transfers</p>
                  </div>
                  <Accessibility className="w-4 h-4 text-green-600" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Departs in 8 min</span>
                  <Button 
                    variant="outline" 
                    onClick={() => onNavigate('journey-details')}
                    className="border-[#DA291C] text-[#DA291C] hover:bg-[#DA291C] hover:text-white rounded-lg"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>

            {/* Route Option 3 - Most Accessible */}
            <Card className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Most Accessible</Badge>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">32 min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">$3.30</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 rounded-lg p-2">
                    <Cable className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p>Streetcar 510 - Spadina</p>
                    <p className="text-sm text-gray-500">Union → Spadina Station</p>
                  </div>
                  <Accessibility className="w-4 h-4 text-green-600" />
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-yellow-400 rounded-lg p-2">
                    <Train className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p>Line 1 - Yonge-University</p>
                    <p className="text-sm text-gray-500">Spadina → Destination</p>
                  </div>
                  <Accessibility className="w-4 h-4 text-green-600" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Departs in 12 min</span>
                  <Button 
                    variant="outline" 
                    onClick={() => onNavigate('journey-details')}
                    className="border-[#DA291C] text-[#DA291C] hover:bg-[#DA291C] hover:text-white rounded-lg"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Suggestions when no results */}
        {!showResults && (
          <div>
            <h3 className="mb-4">Popular Destinations</h3>
            <div className="space-y-2">
              {['Union Station', 'Yorkdale Station', 'Scarborough Town Centre', 'Pearson Airport'].map((destination) => (
                <button
                  key={destination}
                  onClick={() => {
                    setTo(destination);
                    setFrom('Current Location');
                  }}
                  className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#DA291C]" />
                    <span>{destination}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
