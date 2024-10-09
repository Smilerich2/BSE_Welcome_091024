import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize, Minimize } from 'lucide-react';
import { backgrounds } from '../constants';

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


const FloorPlan: React.FC = () => {
  // Zustandsvariablen
  const [currentFloor, setCurrentFloor] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Referenzen
  const svgRef = useRef<SVGSVGElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  // Konstanten
  const MAX_ZOOM = 6;

  // Effekt für Tastatursteuerung
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsDragging(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsDragging(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Funktionen für Interaktionen
  const handleFloorChange = (floor: number) => {
    setCurrentFloor(floor);
    resetZoom();
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

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
    if (!isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  // Render-Funktion
  return (
    <div className={`flex flex-col min-h-screen bg-gray-50 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="flex-grow flex flex-col">
        <div className={`flex-grow m-4 bg-white shadow-lg rounded-lg overflow-hidden flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 m-0' : ''}`}>
          <div className="p-4 flex flex-col h-full">
            <div ref={fullscreenRef} className="flex-grow relative overflow-hidden border border-blue-200 rounded-lg bg-white" style={{ height: isFullscreen ? '100vh' : '60vh' }}>
              {/* Stockwerk-Auswahl */}
              <div className="absolute top-2 left-2 right-2 z-10 flex flex-wrap justify-center gap-2 mb-4">
                {floors.map((floor, index) => (
                  <React.Fragment key={index}>
                    {index === 5 && (
                      <span className="self-center mx-2 text-gray-400">|</span>
                    )}
                    <button
                      onClick={() => handleFloorChange(index)}
                      className={`rounded-full text-xs px-3 py-1 ${
                        currentFloor === index
                          ? 'bg-blue-500 text-white'
                          : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                      } transition-all duration-300`}
                    >
                      {floor.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>

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

              {/* Steuerelemente */}
              <div className="absolute bottom-2 left-2 right-2 z-10 flex justify-center space-x-2">
                <button onClick={() => setScale(s => Math.max(s - 0.2, 1))} className="bg-white bg-opacity-20 rounded-full p-2 hover:bg-opacity-30 transition-all duration-300">
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button onClick={() => setScale(s => Math.min(s + 0.2, MAX_ZOOM))} className="bg-white bg-opacity-20 rounded-full p-2 hover:bg-opacity-30 transition-all duration-300">
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button onClick={resetZoom} className="bg-white bg-opacity-20 rounded-full px-3 py-1 text-xs hover:bg-opacity-30 transition-all duration-300">
                  Reset
                </button>
                <button onClick={toggleFullscreen} className="bg-white bg-opacity-20 rounded-full p-2 hover:bg-opacity-30 transition-all duration-300">
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            {/* Logo-Anzeige (nur wenn nicht im Vollbildmodus) */}
            {!isFullscreen && (
              <div className="mt-6 flex justify-center">
                <img
                  src={backgrounds.normal.logo}
                  alt="BSE-Logo"
                  className="h-auto w-full max-w-md"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer (nur wenn nicht im Vollbildmodus) */}
      {!isFullscreen && (
        <footer className="bg-blue-100 py-4 px-6 text-center text-blue-800 rounded-t-lg shadow-md">
          <p>
            &copy; 2024 Berufliche Schule Elmshorn - FRI ❤️  | {' '}
            <a 
              href="https://www.bs-elmshorn.de" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 no-underline"
            >
              🔗 Zur Schul-Homepage
            </a>
          </p>
        </footer>
      )}
    </div>
  );
};

export default FloorPlan;