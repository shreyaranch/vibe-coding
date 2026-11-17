import { ChevronLeft, Accessibility, Eye, Type, MoveUpRight } from 'lucide-react';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { useState } from 'react';
import type { Screen } from '../App';

interface AccessibilityOptionsScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function AccessibilityOptionsScreen({ onNavigate }: AccessibilityOptionsScreenProps) {
  const [highContrast, setHighContrast] = useState(false);
  const [textToSpeech, setTextToSpeech] = useState(false);
  const [largerText, setLargerText] = useState(false);
  const [showElevators, setShowElevators] = useState(true);

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('profile')}>
            <ChevronLeft className="w-6 h-6 text-[#1B1E23]" />
          </button>
          <h1 className="text-[#1B1E23]">Accessibility</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        <p className="text-gray-600 mb-6">
          Customize your experience
        </p>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {/* High Contrast */}
          <Card className="bg-white p-4 rounded-xl border-none shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-purple-100 rounded-lg p-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[#1B1E23] mb-1">High Contrast Mode</p>
                  <p className="text-sm text-gray-500">Better visibility</p>
                </div>
              </div>
              <Switch
                checked={highContrast}
                onCheckedChange={setHighContrast}
              />
            </div>
          </Card>

          {/* Text-to-Speech */}
          <Card className="bg-white p-4 rounded-xl border-none shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-blue-100 rounded-lg p-2">
                  <Accessibility className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[#1B1E23] mb-1">Text-to-Speech</p>
                  <p className="text-sm text-gray-500">Read content aloud</p>
                </div>
              </div>
              <Switch
                checked={textToSpeech}
                onCheckedChange={setTextToSpeech}
              />
            </div>
          </Card>

          {/* Larger Text */}
          <Card className="bg-white p-4 rounded-xl border-none shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-green-100 rounded-lg p-2">
                  <Type className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[#1B1E23] mb-1">Larger Text</p>
                  <p className="text-sm text-gray-500">Increase font size</p>
                </div>
              </div>
              <Switch
                checked={largerText}
                onCheckedChange={setLargerText}
              />
            </div>
          </Card>

          {/* Show Elevators/Escalators */}
          <Card className="bg-white p-4 rounded-xl border-none shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-orange-100 rounded-lg p-2">
                  <MoveUpRight className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[#1B1E23] mb-1">Show Elevators & Escalators</p>
                  <p className="text-sm text-gray-500">Station facilities</p>
                </div>
              </div>
              <Switch
                checked={showElevators}
                onCheckedChange={setShowElevators}
              />
            </div>
          </Card>
        </div>

        <Button
          onClick={() => onNavigate('profile')}
          className="w-full h-12 bg-[#DA291C] hover:bg-[#b31f15] text-white rounded-xl"
        >
          Save Settings
        </Button>

        {/* Info */}
        <Card className="bg-blue-50 border border-blue-200 p-4 mt-6 rounded-xl">
          <p className="text-sm text-gray-700">
            <strong className="text-[#1B1E23]">Accessibility Icons:</strong>
          </p>
          <div className="mt-2 space-y-1 text-sm text-gray-700">
            <p>♿ Wheelchair accessible</p>
            <p>🛗 Elevator available</p>
            <p>🌀 Escalator available</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
