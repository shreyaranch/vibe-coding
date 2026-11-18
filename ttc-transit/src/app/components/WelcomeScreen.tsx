import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Navigation } from 'lucide-react';
import type { Screen } from '../App';
import ttcLogo from 'figma:asset/0fb3aaf3cb15b1b2c46134f7dd8b62b9a9e3d2c5.png';

interface WelcomeScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function WelcomeScreen({ onNavigate }: WelcomeScreenProps) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Splash Screen
  if (showSplash) {
    return (
      <div className="h-screen bg-gradient-to-b from-[#DA291C] to-[#b31f15] flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white rounded-3xl p-12 shadow-2xl"
        >
          <motion.div
            initial={{ rotate: -180 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <img src={ttcLogo} alt="TTC Logo" className="w-48 h-auto" />
          </motion.div>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-white mt-8 text-lg"
        >
          Toronto Transit Commission
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="mt-12"
        >
          <div className="flex gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1, delay: 0 }}
              className="w-2 h-2 bg-white rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
              className="w-2 h-2 bg-white rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
              className="w-2 h-2 bg-white rounded-full"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // Welcome Screen
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col items-center justify-between bg-white px-8 py-16"
    >
      {/* TTC Logo at Top */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <img 
            src={ttcLogo} 
            alt="TTC Logo" 
            className="w-56 h-auto mx-auto mb-8"
          />
          <h1 className="text-[#1B1E23] mb-3">Welcome to TTC</h1>
          <p className="text-gray-600 max-w-sm">
            Toronto Transit at Your Fingertips
          </p>
        </div>
      </div>

      {/* Plan My Trip Button */}
      <div className="w-full pb-8">
        <Button
          onClick={() => onNavigate('plan')}
          className="w-full h-16 bg-[#DA291C] hover:bg-[#b31f15] text-white rounded-xl text-lg shadow-xl"
        >
          <Navigation className="w-6 h-6 mr-3" />
          Plan My Trip
        </Button>
      </div>
    </motion.div>
  );
}
