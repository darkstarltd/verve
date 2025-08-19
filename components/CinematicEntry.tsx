
import React, { useState, useEffect } from 'react';
import { DigitalWeather } from './DigitalWeather';

interface CinematicEntryProps {
  onComplete: () => void;
}

const BOOT_SEQUENCE = [
  { text: 'Initializing Pro-Verve Core...', time: 1000 },
  { text: 'Loading AI Co-Processor...', time: 800 },
  { text: 'Syncing Component Matrix...', time: 1200 },
  { text: 'Calibrating Render Engine...', time: 700 },
  { text: 'Establishing Secure Connection...', time: 900 },
  { text: 'Authentication Required.', time: 500 },
];

export const CinematicEntry: React.FC<CinematicEntryProps> = ({ onComplete }) => {
  const [bootMessages, setBootMessages] = useState<string[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (currentMessageIndex < BOOT_SEQUENCE.length) {
      const { text, time } = BOOT_SEQUENCE[currentMessageIndex];
      const timer = setTimeout(() => {
        setBootMessages(prev => [...prev, text]);
        setCurrentMessageIndex(prev => prev + 1);
      }, time);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => setShowLogin(true), 500);
    }
  }, [currentMessageIndex]);

  return (
    <div className="fixed inset-0 bg-black text-gray-300 font-mono flex items-center justify-center z-50">
      <DigitalWeather effectType="snow" />
      <div className="z-10 bg-black/50 backdrop-blur-sm p-8 rounded-lg max-w-lg w-full text-center">
        <h1 className="text-4xl font-bold text-white mb-2">PRO-VERVE</h1>
        <p className="text-sm text-purple-400 mb-6">Visual Development Environment</p>
        
        <div className="text-left text-sm h-48 overflow-hidden">
          {bootMessages.map((msg, i) => (
            <p key={i} className="animate-fadeIn">{`> ${msg}`}</p>
          ))}
        </div>

        {showLogin && (
          <div className="animate-fadeIn space-y-4">
            <input 
              type="password"
              placeholder="Enter Access Key"
              className="w-full bg-gray-800/50 border border-purple-500 rounded-md px-4 py-2 text-center text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              onClick={onComplete}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105"
            >
              Access Platform
            </button>
          </div>
        )}
      </div>
    </div>
  );
};