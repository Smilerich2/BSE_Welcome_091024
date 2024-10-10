import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface OverlayProps {
  type: 'iframe' | 'contact' | 'floorplan';
  content: string;
  onClose: () => void;
  children?: React.ReactNode;
}

const Overlay: React.FC<OverlayProps> = ({ type, content, onClose, children }) => {
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());

  const updateLastInteractionTime = useCallback(() => {
    setLastInteractionTime(Date.now());
  }, []);

  const handleInteraction = useCallback(() => {
    updateLastInteractionTime();
  }, [updateLastInteractionTime]);

  useEffect(() => {
    const checkInactivity = () => {
      const currentTime = Date.now();
      if (currentTime - lastInteractionTime > 60000) { // 60000 ms = 1 Minute
        onClose();
      }
    };

    const inactivityTimer = setInterval(checkInactivity, 1000); // Überprüfe jede Sekunde

    return () => clearInterval(inactivityTimer);
  }, [lastInteractionTime, onClose]);

  useEffect(() => {
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [handleInteraction]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-5/6 p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
        {type === 'iframe' && (
          <iframe
            src={content}
            className="w-full h-full"
            title="Overlay Content"
          />
        )}
        {type === 'contact' && (
          <div className="w-full h-full overflow-auto">
            <h2 className="text-2xl font-bold mb-4">Kontakt</h2>
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        )}
        {type === 'floorplan' && children}
      </div>
    </motion.div>
  );
};

export default Overlay;