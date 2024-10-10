import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, X } from 'lucide-react';

// Definition der Stockwerke mit Namen und SVG-Pfaden
const floors = [
  { name: 'Untergeschoss', svg: '/1.svg' },
  { name: 'Erdgeschoss', svg: '/2.svg' },
  { name: '1. Stock', svg: '/3.svg' },
  { name: '2. Stock', svg: '/4.svg' },
  { name: '3. Stock', svg: '/5.svg' },
  { name: 'Werkstatt EG', svg: '/6.svg' },
  { name: 'Werkstatt OG', svg: '/7.svg' },
];

interface FloorPlanProps {
  onClose: () => void;
}

const FloorPlan: React.FC<FloorPlanProps> = ({ onClose }) => {
  // Zustandsvariablen
  const [currentFloor, setCurrentFloor] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());

  // Referenzen
  const svgRef = useRef<SVGSVGElement>(null);

  // Konstanten
  const MAX_ZOOM = 6;

  // Funktionen für Interaktionen
  const handleFloorChange = (floor: number) => {
    setCurrentFloor(floor);
    resetZoom();
    updateLastInteractionTime();
  };

  const handleZoom = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());

    setScale(prevScale => {
      const newScale = Math.min(prevScale + 0.2, MAX_ZOOM);
      const scaleFactor = newScale / prevScale;
      const newX = svgPoint.x - (svgPoint.x - position.x) * scaleFactor;
      const newY = svgPoint.y - (svgPoint.y - position.y) * scaleFactor;
      setPosition({ x: newX, y: newY });
      return newScale;
    });
    updateLastInteractionTime();
  };

  // Maus-Ereignishandler
  const handleMouseDown = (event: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging && svgRef.current) {
      const svg = svgRef.current;
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
      setDragStart({ x: svgPoint.x, y: svgPoint.y });
    }
    updateLastInteractionTime();
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging) {
      handleDrag(event.clientX, event.clientY);
    }
  };

  // Touch-Ereignishandler
  const handleTouchStart = (event: React.TouchEvent<SVGSVGElement>) => {
    event.preventDefault();
    if (event.touches.length === 2) {
      const distance = getTouchDistance(event.touches[0], event.touches[1]);
      setLastTouchDistance(distance);
    } else if (event.touches.length === 1) {
      setIsDragging(true);
      const touch = event.touches[0];
      if (svgRef.current) {
        const svg = svgRef.current;
        const point = svg.createSVGPoint();
        point.x = touch.clientX;
        point.y = touch.clientY;
        const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
        setDragStart({ x: svgPoint.x, y: svgPoint.y });
      }
    }
    updateLastInteractionTime();
  };

  const handleTouchMove = (event: React.TouchEvent<SVGSVGElement>) => {
    event.preventDefault();
    if (event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = getTouchDistance(touch1, touch2);
      
      if (lastTouchDistance > 0) {
        const delta = distance - lastTouchDistance;
        const zoomFactor = 1 + delta * 0.001;
        
        setScale(prevScale => {
          const newScale = Math.min(Math.max(prevScale * zoomFactor, 1), MAX_ZOOM);
          return newScale;
        });
      }
      
      setLastTouchDistance(distance);
    } else if (event.touches.length === 1 && isDragging) {
      handleDrag(event.touches[0].clientX, event.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastTouchDistance(0);
  };

  // Hilfsfunktionen
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleDrag = (clientX: number, clientY: number) => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
    
    setPosition(prev => ({
      x: prev.x + (svgPoint.x - dragStart.x) / scale,
      y: prev.y + (svgPoint.y - dragStart.y) / scale
    }));
    
    setDragStart({ x: svgPoint.x, y: svgPoint.y });
  };

  const resetZoom = () => {
    setScale(1.5);
    setPosition({ x: 0, y: 0 });
  };

  // Aktualisiere die Interaktionszeit bei relevanten Benutzeraktionen
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

  // Render-Funktion
  return (
    <div className="fixed inset-0 z-50 bg-gray-50">
      <div className="h-full relative">
        {/* SVG-Anzeige */}
        <svg
          ref={svgRef}
          className={isDragging ? "cursor-move" : "cursor-zoom-in"}
          onClick={!isDragging ? handleZoom : undefined}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          viewBox="-500 -500 1000 1000"
          style={{
            width: '100%',
            height: '100%',
            touchAction: 'none',
          }}
        >
          <g transform={`scale(${scale}) translate(${position.x} ${position.y})`}>
            <image
              href={floors[currentFloor].svg}
              x="-500"
              y="-500"
              width="1000"
              height="1000"
              preserveAspectRatio="xMidYMid meet"
            />
          </g>
        </svg>

        {/* Schließen-Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100 transition-all duration-300"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Linke Seitenleiste für alle Stockwerke */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-lg p-4 shadow-lg">
          <h3 className="text-lg font-semibold mb-3 text-center text-gray-800">Stockwerkauswahl</h3>
          <div className="space-y-2">
            {floors.slice(0, 5).map((floor, index) => (
              <button
                key={index}
                onClick={() => handleFloorChange(index)}
                className={`block w-full py-2 px-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  currentFloor === index
                    ? 'bg-blue-500 text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-800'
                }`}
              >
                {floor.name}
              </button>
            ))}
            <div className="my-2 border-t border-gray-300"></div>
            {floors.slice(5).map((floor, index) => (
              <button
                key={index + 5}
                onClick={() => handleFloorChange(index + 5)}
                className={`block w-full py-2 px-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  currentFloor === index + 5
                    ? 'bg-blue-500 text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-800'
                }`}
              >
                {floor.name}
              </button>
            ))}
          </div>
        </div>

        {/* Steuerelemente */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex justify-center space-x-2">
          <button onClick={() => setScale(s => Math.max(s - 0.2, 1))} className="bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100 transition-all duration-300">
            <ZoomOut className="h-5 w-5" />
          </button>
          <button onClick={() => setScale(s => Math.min(s + 0.2, MAX_ZOOM))} className="bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100 transition-all duration-300">
            <ZoomIn className="h-5 w-5" />
          </button>
          <button onClick={resetZoom} className="bg-white bg-opacity-80 rounded-full px-3 py-2 text-xs font-medium hover:bg-opacity-100 transition-all duration-300">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloorPlan;