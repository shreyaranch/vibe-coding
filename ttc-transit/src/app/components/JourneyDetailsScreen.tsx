import { ChevronLeft, Clock, MapPin, Accessibility, Bus, Users, Thermometer, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { Screen } from '../App';
import { useState } from 'react';

interface JourneyDetailsScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function JourneyDetailsScreen({ onNavigate }: JourneyDetailsScreenProps) {
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [expandedSegment, setExpandedSegment] = useState<number | null>(null);

  return (
    <div className="min-h-full bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-4 border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('plan')}>
              <ChevronLeft className="w-6 h-6 text-[#1B1E23]" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Bus className="w-5 h-5 text-[#1B1E23]" />
                <span className="text-[#1B1E23]">18 min</span>
              </div>
              <p className="text-sm text-gray-500">Arrive 6:54 PM</p>
            </div>
          </div>
          <button onClick={() => onNavigate('plan')}>
            <span className="text-2xl">✕</span>
          </button>
        </div>

        {/* Route badges */}
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <span>🚶</span>
            <Bus className="w-4 h-4 text-gray-600" />
            <Badge variant="secondary" className="bg-gray-200 text-gray-700 hover:bg-gray-200">6</Badge>
            <Badge variant="secondary" className="bg-gray-200 text-gray-700 hover:bg-gray-200">94</Badge>
            <span>🚶</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Timeline Journey */}
        <div className="relative">
          {/* Walking Segment 1 */}
          <div className="flex gap-4 mb-6">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-gray-400 mt-1"></div>
              <div className="w-0.5 h-full bg-gray-300 flex-1"></div>
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🚶</span>
                <span className="text-[#1B1E23]">Walk 4 min (220 m)</span>
              </div>
            </div>
          </div>

          {/* Bus Stop 1 - 6 */}
          <div className="flex gap-4 mb-6">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <div className="w-0.5 h-full bg-gray-300 flex-1"></div>
            </div>
            <div className="flex-1 pb-6">
              <Card className="bg-white p-4 rounded-xl border-none shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Bus className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">Yonge St at Bloor St NB - #2103</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="bg-gray-200 text-gray-700 hover:bg-gray-200">6</Badge>
                      <span className="text-sm text-gray-600">Bay via Bloor-Yonge Station</span>
                      <span className="text-[#DA291C]">6:40 PM</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      On time · in 11 min
                    </div>
                  </div>
                  <button 
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                  >
                    <Info className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* What's it like onboard */}
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <button 
                    onClick={() => setExpandedSegment(expandedSegment === 1 ? null : 1)}
                    className="flex items-center justify-between w-full text-sm text-gray-700 mb-2"
                  >
                    <span>What's it like onboard?</span>
                    {expandedSegment === 1 ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {expandedSegment === 1 && (
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-600">Crowded</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Accessibility className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-600">Accessibility</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Thermometer className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-600">Temp</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Alternative times */}
                {expandedSegment === 1 && (
                  <div className="border-t border-gray-100 pt-3 mt-3">
                    <button 
                      onClick={() => setShowAlternatives(!showAlternatives)}
                      className="flex items-center justify-between w-full text-sm text-gray-700 mb-2"
                    >
                      <span>Also in 29 min & 31 min</span>
                      {showAlternatives ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}

                {/* Ride info */}
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <button 
                    className="flex items-center justify-between w-full text-sm text-gray-700"
                  >
                    <span>Ride 7 stops (8 min)</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            </div>
          </div>

          {/* Transfer/Stop 2 */}
          <div className="flex gap-4 mb-6">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <div className="w-0.5 h-full bg-gray-300 flex-1"></div>
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Bus className="w-4 h-4 text-gray-600" />
                <span className="text-[#1B1E23]">Bay St at College St SB - #1646</span>
                <span className="text-sm text-gray-500">6:47 PM</span>
              </div>
            </div>
          </div>

          {/* Walking Segment 2 */}
          <div className="flex gap-4 mb-6">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-gray-400 mt-1"></div>
              <div className="w-0.5 h-full bg-gray-300 flex-1"></div>
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🚶</span>
                <span className="text-[#1B1E23]">Walk 7 min (500 m)</span>
              </div>
              <button 
                className="w-8 h-8 rounded-full bg-[#E8F5F0] flex items-center justify-center mt-2"
              >
                <Info className="w-4 h-4 text-[#00B140]" />
              </button>
            </div>
          </div>

          {/* Destination */}
          <div className="flex gap-4 mb-6">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-[#DA291C]"></div>
            </div>
            <div className="flex-1">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-[#DA291C] mt-0.5" />
                <div>
                  <p className="text-[#1B1E23]">Yorkdale Shopping Centre</p>
                  <p className="text-sm text-gray-500">3401 Dufferin St, Toronto, ON M6A 2T9</p>
                  <p className="text-sm text-[#DA291C] mt-1">6:54 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button 
            onClick={() => onNavigate('live-tracking')}
            className="flex-1 h-12 bg-[#DA291C] hover:bg-[#b31f15] text-white rounded-xl"
          >
            Start Journey
          </Button>
          <Button 
            variant="outline"
            className="flex-1 h-12 border-2 border-[#00B140] text-[#00B140] hover:bg-green-50 rounded-xl"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
