import React, { useRef, useEffect } from 'react';
import { Game } from '../types';
import { X, RefreshCw, ThumbsUp, Share2 } from 'lucide-react';

interface GamePlayerProps {
  game: Game;
  onClose: () => void;
}

export const GamePlayer: React.FC<GamePlayerProps> = ({ game, onClose }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // We wrap the game code in a standard HTML boilerplate
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            overflow: hidden; 
            background: #000; 
            width: 100vw; 
            height: 100vh; 
            display: flex;
            justify-content: center;
            align-items: center;
            touch-action: none; 
            font-family: system-ui, sans-serif;
            color: white;
          }
          canvas {
            /* Strict Portrait Aspect Ratio & Containment */
            width: auto;
            height: auto;
            max-width: 100%;
            max-height: 100dvh; /* dynamic viewport height */
            aspect-ratio: 2/3;
            object-fit: contain;
            box-shadow: 0 0 30px rgba(52, 211, 153, 0.1);
            background: #020617;
          }
        </style>
      </head>
      <body>
        <canvas id="gameCanvas"></canvas>
        <script>
          const canvas = document.getElementById('gameCanvas');
          
          // Strict Logical Resolution
          canvas.width = 400;
          canvas.height = 600;

          // Error Boundary
          window.onerror = function(message, source, lineno, colno, error) {
            document.body.innerHTML = '<div style="padding:20px; color: #f87171; text-align:center;">' + 
              '<h3>Game crashed</h3><p>' + message + '</p></div>';
          };

          // INJECTED CODE START
          try {
             ${game.code}
          } catch(e) {
             console.error(e);
             document.body.innerHTML = '<div style="padding:20px; color: #f87171; text-align:center;">' + 
              '<h3>Init Error</h3><p>' + e.message + '</p></div>';
          }
          // INJECTED CODE END
        </script>
      </body>
    </html>
  `;

  const handleRestart = () => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = htmlContent;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
         <div className="pointer-events-auto">
            <button onClick={onClose} className="p-2 bg-slate-800/80 rounded-full text-white backdrop-blur-md">
              <X size={24} />
            </button>
         </div>
         <div className="pointer-events-auto flex gap-3">
            <button onClick={handleRestart} className="p-2 bg-slate-800/80 rounded-full text-white backdrop-blur-md hover:bg-emerald-600/80 transition">
              <RefreshCw size={24} />
            </button>
         </div>
      </div>

      {/* Game Container */}
      <div className="flex-1 flex items-center justify-center bg-slate-900">
        <iframe 
          ref={iframeRef}
          title="Game Sandbox"
          srcDoc={htmlContent}
          className="w-full h-full border-none"
          sandbox="allow-scripts" 
        />
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-slate-900 border-t border-slate-800 p-4 pb-8 flex items-center justify-between">
         <div>
            <h3 className="font-bold text-white">{game.title}</h3>
            <p className="text-xs text-slate-400">By {game.creator}</p>
         </div>
         <div className="flex gap-4">
             <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-rose-500 transition-colors">
                <ThumbsUp size={24} />
                <span className="text-[10px]">Like</span>
             </button>
             <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-500 transition-colors">
                <Share2 size={24} />
                <span className="text-[10px]">Share</span>
             </button>
         </div>
      </div>
    </div>
  );
};
