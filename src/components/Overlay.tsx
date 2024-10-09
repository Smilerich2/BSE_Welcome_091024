import React from 'react';
import { X } from 'lucide-react';

interface OverlayProps {
  type: 'iframe' | 'contact' | 'floorplan';
  content?: string;
  onClose: () => void;
  children?: React.ReactNode;
}

const Overlay: React.FC<OverlayProps> = ({ type, content, onClose, children }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-xl ${type === 'iframe' || type === 'floorplan' ? 'w-full h-full' : 'max-w-md'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`relative ${type === 'iframe' || type === 'floorplan' ? 'w-full h-full' : 'p-8'}`}>
          {type === 'iframe' && (
            <iframe src={content} className="w-full h-full border-none" title="Overlay Content" />
          )}
          {type === 'contact' && (
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Kontakt</h2>
              <p className="text-xl mb-4">Wenn wir Ihr Interesse geweckt haben und Sie sich bewerben möchten oder zusätzliche Informationen wünschen, können Sie uns gerne kontaktieren unter:</p>
              <a href="mailto:info@bs-elmshorn.de" className="text-2xl text-blue-600 hover:underline">info@bs-elmshorn.de</a>
            </div>
          )}
          {type === 'floorplan' && children}
          <button
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overlay;