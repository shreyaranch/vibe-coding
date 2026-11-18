import { useState } from 'react';
import { Train, Bus, Cable, Accessibility as AccessibilityIcon, MoveUpRight, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import type { Screen } from '../App';
import ttcLogo from 'figma:asset/0fb3aaf3cb15b1b2c46134f7dd8b62b9a9e3d2c5.png';

interface ExploreScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function ExploreScreen({ onNavigate }: ExploreScreenProps) {
  const [activeTab, setActiveTab] = useState('subway');

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header with TTC Logo */}
      <div className="bg-white px-6 pt-12 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <img src={ttcLogo} alt="TTC" className="h-8 w-auto" />
        </div>
        <h1 className="text-[#1B1E23]">Real-Time Updates</h1>
      </div>

      {/* Tab Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0 rounded-none">
            <TabsTrigger 
              value="subway" 
              className="flex flex-col items-center gap-1 py-3 bg-transparent border-b-2 border-transparent data-[state=active]:border-[#DA291C] data-[state=active]:bg-transparent rounded-none text-gray-600 data-[state=active]:text-[#DA291C]"
            >
              <Train className="w-5 h-5" />
              <span className="text-xs">Subway</span>
            </TabsTrigger>
            <TabsTrigger 
              value="bus" 
              className="flex flex-col items-center gap-1 py-3 bg-transparent border-b-2 border-transparent data-[state=active]:border-[#DA291C] data-[state=active]:bg-transparent rounded-none text-gray-600 data-[state=active]:text-[#DA291C]"
            >
              <Bus className="w-5 h-5" />
              <span className="text-xs">Bus</span>
            </TabsTrigger>
            <TabsTrigger 
              value="streetcar" 
              className="flex flex-col items-center gap-1 py-3 bg-transparent border-b-2 border-transparent data-[state=active]:border-[#DA291C] data-[state=active]:bg-transparent rounded-none text-gray-600 data-[state=active]:text-[#DA291C]"
            >
              <Cable className="w-5 h-5" />
              <span className="text-xs">Streetcar</span>
            </TabsTrigger>
            <TabsTrigger 
              value="wheel-trans" 
              className="flex flex-col items-center gap-1 py-3 bg-transparent border-b-2 border-transparent data-[state=active]:border-[#DA291C] data-[state=active]:bg-transparent rounded-none text-gray-600 data-[state=active]:text-[#DA291C]"
            >
              <AccessibilityIcon className="w-5 h-5" />
              <span className="text-xs">Wheel-Trans</span>
            </TabsTrigger>
          </TabsList>

          {/* Subway Tab */}
          <TabsContent value="subway" className="mt-0">
            <div className="p-4 space-y-3 pb-24">
              {/* Service Alert */}
              <Card className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-xl">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-900 mb-1">
                      <strong>Service Change</strong>
                    </p>
                    <p className="text-xs text-yellow-800">
                      Line 2 eastbound experiencing minor delays due to track maintenance.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Union Station */}
              <Card className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-[#1B1E23] mb-1">Union Station</h3>
                    <p className="text-xs text-gray-500">Line 1 - Yonge-University</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="bg-gray-100 rounded p-1" title="Wheelchair accessible">
                      <AccessibilityIcon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="bg-gray-100 rounded p-1" title="Elevator available">
                      <MoveUpRight className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                </div>

                {/* Live Departures */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-[#00B140]">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-[#FDB913] text-black hover:bg-[#FDB913]">Line 1</Badge>
                      <span className="text-sm text-[#1B1E23]">→ Finch</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#00B140] rounded-full animate-pulse" />
                      <span className="text-sm text-[#00B140]">Arriving</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-[#00B140]">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-[#FDB913] text-black hover:bg-[#FDB913]">Line 1</Badge>
                      <span className="text-sm text-[#1B1E23]">→ Vaughan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#00B140] rounded-full" />
                      <span className="text-sm text-[#00B140]">2 min</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-[#00B140]">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-[#FDB913] text-black hover:bg-[#FDB913]">Line 1</Badge>
                      <span className="text-sm text-[#1B1E23]">→ Finch</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#00B140] rounded-full" />
                      <span className="text-sm text-[#00B140]">5 min</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Adult Fare</span>
                  <span className="text-[#DA291C]">$3.35</span>
                </div>
              </Card>

              {/* Bloor-Yonge Station */}
              <Card className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-[#1B1E23] mb-1">Bloor-Yonge</h3>
                    <p className="text-xs text-gray-500">Line 1 & Line 2</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="bg-gray-100 rounded p-1" title="Wheelchair accessible">
                      <AccessibilityIcon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="bg-gray-100 rounded p-1" title="Elevator available">
                      <MoveUpRight className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                </div>

                {/* Live Departures */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-[#00B140]">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-[#FDB913] text-black hover:bg-[#FDB913]">Line 1</Badge>
                      <span className="text-sm text-[#1B1E23]">→ Finch</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#00B140] rounded-full" />
                      <span className="text-sm text-[#00B140]">3 min</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-[#DA291C]">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-[#00B140] text-white hover:bg-[#00B140]">Line 2</Badge>
                      <span className="text-sm text-[#1B1E23]">→ Kennedy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#DA291C] rounded-full animate-pulse" />
                      <span className="text-sm text-[#DA291C]">Delayed +3 min</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-[#00B140]">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-[#FDB913] text-black hover:bg-[#FDB913]">Line 1</Badge>
                      <span className="text-sm text-[#1B1E23]">→ Vaughan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#00B140] rounded-full" />
                      <span className="text-sm text-[#00B140]">6 min</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Adult Fare</span>
                  <span className="text-[#DA291C]">$3.35</span>
                </div>
              </Card>

              {/* King Station */}
              <Card className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-[#1B1E23] mb-1">King Station</h3>
                    <p className="text-xs text-gray-500">Line 1</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="bg-gray-100 rounded p-1" title="Wheelchair accessible">
                      <AccessibilityIcon className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                </div>

                {/* Live Departures */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-[#00B140]">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-[#FDB913] text-black hover:bg-[#FDB913]">Line 1</Badge>
                      <span className="text-sm text-[#1B1E23]">→ Vaughan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#00B140] rounded-full" />
                      <span className="text-sm text-[#00B140]">4 min</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-[#00B140]">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-[#FDB913] text-black hover:bg-[#FDB913]">Line 1</Badge>
                      <span className="text-sm text-[#1B1E23]">→ Finch</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#00B140] rounded-full" />
                      <span className="text-sm text-[#00B140]">7 min</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Adult Fare</span>
                  <span className="text-[#DA291C]">$3.35</span>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Bus Tab */}
          <TabsContent value="bus" className="mt-0">
            <div className="p-4 space-y-3 pb-24">
              <Card className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-[#1B1E23] mb-1">32 Eglinton West</h3>
                    <p className="text-xs text-gray-500">Westbound at Yonge St</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="bg-gray-100 rounded p-1" title="Wheelchair accessible">
                      <AccessibilityIcon className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-[#00B140]">
                    <span className="text-sm text-[#1B1E23]">Next bus</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#00B140] rounded-full" />
                      <span className="text-sm text-[#00B140]">2 min</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-[#00B140]">
                    <span className="text-sm text-[#1B1E23]">Following bus</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#00B140] rounded-full" />
                      <span className="text-sm text-gray-600">8 min</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-[#00B140]">
                    <span className="text-sm text-[#1B1E23]">Following bus</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#00B140] rounded-full" />
                      <span className="text-sm text-gray-600">15 min</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Adult Fare</span>
                  <span className="text-[#DA291C]">$3.35</span>
                </div>
              </Card>

              <Card className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-[#1B1E23] mb-1">97 Yonge</h3>
                    <p className="text-xs text-gray-500">Southbound at Eglinton</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="bg-gray-100 rounded p-1" title="Wheelchair accessible">
                      <AccessibilityIcon className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-[#FDB913]">
                    <span className="text-sm text-[#1B1E23]">Next bus</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#FDB913] rounded-full animate-pulse" />
                      <span className="text-sm text-[#FDB913]">Service Change</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-[#00B140]">
                    <span className="text-sm text-[#1B1E23]">Following bus</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#00B140] rounded-full" />
                      <span className="text-sm text-gray-600">12 min</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Adult Fare</span>
                  <span className="text-[#DA291C]">$3.35</span>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Streetcar Tab */}
          <TabsContent value="streetcar" className="mt-0">
            <div className="p-4 space-y-3 pb-24">
              <Card className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-[#1B1E23] mb-1">504 King</h3>
                    <p className="text-xs text-gray-500">Eastbound at Spadina</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="bg-gray-100 rounded p-1" title="Wheelchair accessible">
                      <AccessibilityIcon className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-[#DA291C]">
                    <span className="text-sm text-[#1B1E23]">→ Broadview Stn</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#DA291C] rounded-full animate-pulse" />
                      <span className="text-sm text-[#DA291C]">Delayed +5 min</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-[#00B140]">
                    <span className="text-sm text-[#1B1E23]">Following</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#00B140] rounded-full" />
                      <span className="text-sm text-gray-600">12 min</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Adult Fare</span>
                  <span className="text-[#DA291C]">$3.35</span>
                </div>
              </Card>

              <Card className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-[#1B1E23] mb-1">509 Harbourfront</h3>
                    <p className="text-xs text-gray-500">Westbound at Union</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="bg-gray-100 rounded p-1" title="Wheelchair accessible">
                      <AccessibilityIcon className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-[#00B140]">
                    <span className="text-sm text-[#1B1E23]">→ Exhibition</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#00B140] rounded-full" />
                      <span className="text-sm text-[#00B140]">3 min</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-[#00B140]">
                    <span className="text-sm text-[#1B1E23]">Following</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#00B140] rounded-full" />
                      <span className="text-sm text-gray-600">10 min</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Adult Fare</span>
                  <span className="text-[#DA291C]">$3.35</span>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Wheel-Trans Tab */}
          <TabsContent value="wheel-trans" className="mt-0">
            <div className="p-4 pb-24">
              <Card className="bg-blue-50 border border-blue-200 p-6 rounded-xl text-center">
                <AccessibilityIcon className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                <h3 className="text-[#1B1E23] mb-2">Wheel-Trans Service</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Door-to-door accessible transit service for customers who cannot use conventional transit.
                </p>
                <button className="text-[#DA291C] text-sm">
                  Learn More →
                </button>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
