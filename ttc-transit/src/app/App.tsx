import { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { PlanScreen } from './components/PlanScreen';
import { ExploreScreen } from './components/ExploreScreen';
import { PaymentScreen } from './components/PaymentScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { JourneyDetailsScreen } from './components/JourneyDetailsScreen';
import { LiveTrackingScreen } from './components/LiveTrackingScreen';
import { LanguageSelectionScreen } from './components/LanguageSelectionScreen';
import { AccessibilityOptionsScreen } from './components/AccessibilityOptionsScreen';
import { ChatScreen } from './components/ChatScreen';
import { BottomNav } from './components/BottomNav';

export type Screen = 
  | 'welcome'
  | 'plan' 
  | 'explore' 
  | 'payment' 
  | 'profile' 
  | 'journey-details' 
  | 'live-tracking' 
  | 'language' 
  | 'accessibility' 
  | 'chat';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onNavigate={setCurrentScreen} />;
      case 'plan':
        return <PlanScreen onNavigate={setCurrentScreen} />;
      case 'explore':
        return <ExploreScreen onNavigate={setCurrentScreen} />;
      case 'payment':
        return <PaymentScreen onNavigate={setCurrentScreen} />;
      case 'profile':
        return <ProfileScreen onNavigate={setCurrentScreen} />;
      case 'journey-details':
        return <JourneyDetailsScreen onNavigate={setCurrentScreen} />;
      case 'live-tracking':
        return <LiveTrackingScreen onNavigate={setCurrentScreen} />;
      case 'language':
        return <LanguageSelectionScreen onNavigate={setCurrentScreen} />;
      case 'accessibility':
        return <AccessibilityOptionsScreen onNavigate={setCurrentScreen} />;
      case 'chat':
        return <ChatScreen onNavigate={setCurrentScreen} />;
      default:
        return <WelcomeScreen onNavigate={setCurrentScreen} />;
    }
  };

  // Show bottom nav on main screens only
  const showBottomNav = ['plan', 'explore', 'payment', 'profile'].includes(currentScreen);

  return (
    <div className="h-screen bg-white flex flex-col max-w-[430px] mx-auto relative">
      <div className={`flex-1 overflow-y-auto ${showBottomNav ? 'pb-20' : ''}`}>
        {renderScreen()}
      </div>
      {showBottomNav && <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />}
    </div>
  );
}
