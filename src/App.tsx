import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Pencil, Maximize, Minimize } from 'lucide-react';
import BackgroundVideo from './components/BackgroundVideo';
import Clock from './components/Clock';
import DashboardButton from './components/DashboardButton';
import Overlay from './components/Overlay';
import MessageInput from './components/MessageInput';
import FloorPlan from './components/FloorPlan';
import { backgrounds, buttons } from './constants';
import { BackgroundType } from './types';

const App: React.FC = () => {
  // State-Definitionen
  const [background, setBackground] = useState<BackgroundType>('normal');
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayContent, setOverlayContent] = useState<string>('');
  const [overlayType, setOverlayType] = useState<'iframe' | 'contact' | 'floorplan'>('iframe');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [message, setMessage] = useState('');

  // Lade gespeicherte Nachricht beim Start
  useEffect(() => {
    const savedMessage = localStorage.getItem('welcomeMessage');
    if (savedMessage) {
      setMessage(savedMessage);
    }
  }, []);

  // Hintergrund ändern
  const handleBackgroundChange = (newBackground: BackgroundType) => {
    setBackground(newBackground);
  };

  // Vollbildmodus umschalten
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Fehler beim Aktivieren des Vollbildmodus: ${e.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Vollbildmodus-Änderungen überwachen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Neue Nachricht speichern
  const handleMessageSubmit = (newMessage: string) => {
    setMessage(newMessage);
    localStorage.setItem('welcomeMessage', newMessage);
  };

  // Overlay-Inhalt festlegen
  const handleButtonClick = (button: typeof buttons[0]) => {
    if (button.name === 'Raumplan') {
      setOverlayType('floorplan');
    } else if (button.url) {
      setOverlayContent(button.url);
      setOverlayType('iframe');
    } else {
      setOverlayType('contact');
    }
    setShowOverlay(true);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundVideo background={background} />

      {/* Nachricht-Eingabe-Button */}
      <button
        onClick={() => setShowMessageInput(true)}
        className="absolute top-4 left-4 z-50 bg-white bg-opacity-20 rounded-full p-2 hover:bg-opacity-30 transition-all duration-300"
        title="Nachricht eingeben"
      >
        <Pencil className="w-4 h-4 text-white" />
      </button>

      {/* Hauptinhalt */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden border border-white border-opacity-20 p-8">
          <div className="flex flex-col h-full">
            <h1 className="text-5xl font-bold text-white mb-2 tracking-tight text-center">Herzlich Willkommen</h1>
            <p className="text-xl text-white mb-8 opacity-80 text-center">Berufliche Schule Elmshorn</p>
            <Clock />
            
            {/* Willkommensnachricht */}
            {message && (
              <div className="mb-4 p-4 bg-white bg-opacity-20 rounded-xl">
                <p className="text-white text-lg text-center">{message}</p>
              </div>
            )}

            {/* Dashboard-Buttons */}
            <div className="mt-auto">
              <div className="flex flex-col sm:flex-row justify-center gap-6 w-full max-w-lg mx-auto">
                {buttons.map((button) => (
                  <DashboardButton
                    key={button.name}
                    {...button}
                    onClick={() => handleButtonClick(button)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schullogo */}
      <div className="absolute bottom-4 left-4 z-20">
        <img
          src={backgrounds[background].logo}
          alt="Schullogo"
          className="w-auto h-auto max-h-48"
        />
      </div>

      {/* Steuerungsbuttons */}
      <div className="absolute bottom-4 right-4 flex space-x-2 z-20">
        {/* Vollbildmodus-Button */}
        <button
          onClick={toggleFullscreen}
          className="w-10 h-10 rounded-full bg-black bg-opacity-50 text-white transition-colors duration-200 hover:bg-opacity-75 flex items-center justify-center"
          title={isFullscreen ? "Vollbildmodus beenden" : "Vollbildmodus"}
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>

        {/* Hintergrund-Auswahlbuttons */}
        {(Object.keys(backgrounds) as Array<BackgroundType>).map((bg) => (
          <button
            key={bg}
            className={`w-10 h-10 rounded-full ${
              background === bg ? 'bg-white text-black' : 'bg-black bg-opacity-50 text-white'
            } transition-colors duration-200 hover:bg-opacity-75 flex items-center justify-center`}
            onClick={() => handleBackgroundChange(bg)}
            title={bg.charAt(0).toUpperCase() + bg.slice(1)}
          >
            <img
              src={backgrounds[bg].icon}
              alt={`${bg} icon`}
              className="w-5 h-5"
            />
          </button>
        ))}
      </div>

      {/* Overlay und MessageInput */}
      <AnimatePresence>
        {showOverlay && (
          <Overlay
            type={overlayType}
            content={overlayContent}
            onClose={() => setShowOverlay(false)}
          >
            {overlayType === 'floorplan' && <FloorPlan />}
          </Overlay>
        )}

        {showMessageInput && (
          <MessageInput
            onClose={() => setShowMessageInput(false)}
            onMessageSubmit={handleMessageSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;