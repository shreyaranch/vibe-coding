import { useState } from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import type { Screen } from '../App';

interface LanguageSelectionScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function LanguageSelectionScreen({ onNavigate }: LanguageSelectionScreenProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('english');

  const languages = [
    { id: 'english', name: 'English', flag: '🇬🇧' },
    { id: 'french', name: 'Français', flag: '🇫🇷' },
  ];

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('profile')}>
            <ChevronLeft className="w-6 h-6 text-[#1B1E23]" />
          </button>
          <h1 className="text-[#1B1E23]">Language</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        <p className="text-gray-600 mb-6">
          Select your preferred language
        </p>

        <div className="space-y-3 mb-6">
          {languages.map((language) => (
            <Card
              key={language.id}
              onClick={() => setSelectedLanguage(language.id)}
              className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                selectedLanguage === language.id
                  ? 'border-[#DA291C] bg-red-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{language.flag}</span>
                  <p className="text-[#1B1E23]">{language.name}</p>
                </div>
                {selectedLanguage === language.id && (
                  <div className="bg-[#DA291C] rounded-full p-1">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        <Button
          onClick={() => onNavigate('profile')}
          className="w-full h-12 bg-[#DA291C] hover:bg-[#b31f15] text-white rounded-xl"
        >
          Save
        </Button>
      </div>
    </div>
  );
}
