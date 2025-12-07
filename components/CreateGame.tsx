
import React, { useState, useRef, useEffect } from 'react';
import { generateGameCode, debugGameCode } from '../services/geminiService';
import { Game, User, Advertisement } from '../types';
import { Button } from './Button';
import { Sparkles, Terminal, Cpu, Rocket, CheckCircle2, RefreshCw, Wand2, Code2, Megaphone } from 'lucide-react';

interface CreateGameProps {
  user: User;
  onPublish: (game: Game) => void;
  availableAds: Advertisement[];
}

const STEPS = [
  { label: 'Deconstructing Idea...', icon: Terminal },
  { label: 'Generating Logic...', icon: Cpu },
  { label: 'Injecting Sponsors...', icon: Megaphone },
  { label: 'Compiling Sandbox...', icon: Code2 },
];

export const CreateGame: React.FC<CreateGameProps> = ({ user, onPublish, availableAds }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  
  // Ad State
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  
  // New state for iterative refinement
  const [refineText, setRefineText] = useState('');

  const handleGenerate = async () => {
    if (!prompt) return;
    
    // Pick an ad if available and not selected
    // Logic: If multiple ads exist, choose the one with the HIGHEST CPM (Bid)
    const adToUse = selectedAd || (availableAds.length > 0 ? [...availableAds].sort((a, b) => b.cpm - a.cpm)[0] : null);

    // Check if this is likely a precompiled template (Fake the wait time)
    const lowerPrompt = prompt.toLowerCase();
    const isTemplate = lowerPrompt.includes('flappy') || 
                       lowerPrompt.includes('snake') || 
                       lowerPrompt.includes('breakout') || 
                       lowerPrompt.includes('typing') ||
                       lowerPrompt.includes('defense');

    // Random duration between 20s (20000ms) and 30s (30000ms) for templates
    // Standard 2s minimum for others + actual API time
    const minDelay = isTemplate ? Math.floor(Math.random() * 10000) + 20000 : 2000;

    setIsGenerating(true);
    setProgressStep(0);
    setGeneratedCode(null);

    // Calculate animation speed to match the target delay
    // We distribute the steps across the wait time
    const stepIntervalTime = minDelay / (STEPS.length + 0.5);

    const stepInterval = setInterval(() => {
      setProgressStep(prev => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, stepIntervalTime);

    try {
      // Run generation and timer in parallel
      const [code] = await Promise.all([
        generateGameCode({ prompt, ad: adToUse }),
        new Promise(resolve => setTimeout(resolve, minDelay))
      ]);
      
      clearInterval(stepInterval);
      setProgressStep(STEPS.length);
      
      // Small visual pause at 100% before showing result
      setTimeout(() => {
          setGeneratedCode(code);
          setIsGenerating(false);
          if (adToUse) setSelectedAd(adToUse); // Lock in the used ad
      }, 500);

    } catch (err: any) {
      clearInterval(stepInterval);
      setIsGenerating(false);
      alert("Failed to generate: " + err.message);
    }
  };

  const handleRefine = async () => {
    if (!generatedCode || !refineText.trim()) return;
    setIsDebugging(true);
    
    try {
      const fixedCode = await debugGameCode(generatedCode, refineText);
      setGeneratedCode(fixedCode);
      setRefineText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsDebugging(false);
    }
  };

  const handleConfirmPublish = () => {
    if (!generatedCode) return;

    const newGame: Game = {
        id: Date.now().toString(),
        title: prompt.split(' ').slice(0, 4).join(' ') + (prompt.split(' ').length > 4 ? '...' : ''),
        description: prompt,
        creator: user.name,
        creatorAvatar: user.avatar,
        code: generatedCode,
        likes: 0,
        comments: 0,
        shares: 0,
        tags: ['gen-z', 'ai', 'beta', ...(selectedAd ? ['sponsored'] : [])],
        createdAt: Date.now(),
        sponsoredBy: selectedAd || undefined
      };

    onPublish(newGame);
  };

  const GamePreviewRunner = ({ code }: { code: string }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    
    // Robust focus handling
    useEffect(() => {
        const focusGame = () => {
             if(iframeRef.current?.contentWindow) {
                 iframeRef.current.contentWindow.focus();
             }
        };

        const interval = setInterval(focusGame, 1000);
        iframeRef.current?.addEventListener('mouseenter', focusGame);
        return () => {
            clearInterval(interval);
            iframeRef.current?.removeEventListener('mouseenter', focusGame);
        };
    }, [code]); 

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
                margin: 0; padding: 0;
                overflow: hidden; 
                background: #020617; 
                color: white; 
                height: 100vh; width: 100vw;
                display: flex; align-items: center; justify-content: center;
                font-family: sans-serif; 
            }
            canvas { 
                /* FIXED LOGICAL RESOLUTION SCALED VISUALLY */
                width: 100%;
                height: 100%;
                object-fit: contain; /* This is crucial: keeps 400x600 ratio inside the 100% container */
                box-shadow: 0 0 20px rgba(0,0,0,0.5);
            }
          </style>
        </head>
        <body>
          <canvas id="gameCanvas" width="400" height="600"></canvas>
          <script>
            const canvas = document.getElementById('gameCanvas');
            
            // Focus Handlers
            window.addEventListener('click', () => window.focus());
            window.focus();

            // Prevent Scrolling
            window.addEventListener('keydown', (e) => {
                 if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
                     e.preventDefault();
                 }
            });
            
            try { 
                ${code} 
            } catch(e) { 
                document.body.innerHTML = '<div style="color:#ef4444; font-family:monospace; padding:20px; text-align:center;">RUNTIME ERROR<br>'+e.message+'</div>'; 
            }
          </script>
        </body>
      </html>
    `;
    return <iframe ref={iframeRef} srcDoc={htmlContent} className="w-full h-full border-none rounded-xl bg-slate-900" sandbox="allow-scripts allow-same-origin" />;
  };

  if (isGenerating) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-black aurora-bg">
        <div className="w-full max-w-xs backdrop-blur-xl bg-black/40 p-8 rounded-3xl border border-white/10 shadow-2xl">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === progressStep;
            const isDone = idx < progressStep;
            
            return (
              <div key={idx} className={`flex items-center gap-4 mb-6 transition-all duration-500 ${isActive || isDone ? 'opacity-100 translate-x-0' : 'opacity-30 translate-x-[-10px]'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${isActive ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 animate-bounce' : isDone ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-800 bg-slate-900 text-slate-600'}`}>
                  {isDone ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                </div>
                <span className={`font-medium tracking-wide ${isActive ? 'text-white' : 'text-slate-500'}`}>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // PREVIEW MODE
  if (generatedCode) {
    return (
        <div className="h-full flex flex-col bg-black">
            {/* Top Bar */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                   Preview
                </span>
                
                {selectedAd && (
                    <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded-full border border-white/10">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: selectedAd.color}}></div>
                        <span className="text-[10px] text-slate-300">Ads: {selectedAd.brandName}</span>
                    </div>
                )}

                <button onClick={() => setGeneratedCode(null)} className="text-slate-500 hover:text-white transition-colors">
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Game Container - Boxed like Feed */}
            {/* FORCE ASPECT RATIO HERE in the wrapper */}
            <div className="flex-1 p-4 flex items-center justify-center bg-black/50 overflow-hidden">
                <div className="w-full h-full max-w-[400px] max-h-[600px] aspect-[2/3] relative shadow-2xl rounded-2xl ring-1 ring-white/10 overflow-hidden bg-slate-900">
                    <GamePreviewRunner code={generatedCode} />
                </div>
            </div>
            
            {/* Iterative Control Panel */}
            <div className="p-4 bg-slate-900 border-t border-white/10 pb-24">
                <div className="mb-4">
                    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 block">Vibe Debugging (Refine)</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={refineText}
                            onChange={(e) => setRefineText(e.target.value)}
                            placeholder="e.g. Make the player blue, faster speed..." 
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                            onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                        />
                        <button 
                            onClick={handleRefine}
                            disabled={!refineText.trim() || isDebugging}
                            className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg disabled:opacity-50"
                        >
                            {isDebugging ? <RefreshCw className="animate-spin" size={20} /> : <Wand2 size={20} />}
                        </button>
                    </div>
                </div>

                <Button 
                    onClick={handleConfirmPublish}
                    className="w-full !bg-gradient-to-r from-emerald-500 to-cyan-500 !text-white !border-none shadow-emerald-500/20 py-4"
                    disabled={isDebugging}
                >
                    <Rocket size={18} className="mr-2" />
                    Ship Game
                </Button>
            </div>
        </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-6 pb-24 max-w-lg mx-auto flex flex-col aurora-bg">
      <div className="flex-1 mt-8">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500 mb-4 tracking-tighter">
            Make <br/>
            Something <br/>
            <span className="text-emerald-400">Sick.</span>
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed mb-8">
            Type what you want. We inject sponsors & deploy.
        </p>

        <div className="glass-panel p-1 rounded-2xl shadow-2xl mb-6 group focus-within:border-emerald-500/50 transition-colors">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A cyberpunk samurai runner game where I deflect bullets with spacebar..."
            className="w-full bg-transparent text-white text-xl p-4 placeholder:text-slate-600 focus:outline-none resize-none h-48 font-medium"
          />
          <div className="px-4 py-2 flex justify-between items-center border-t border-white/5">
             <span className="text-xs text-slate-500 font-mono">{prompt.length}/500 chars</span>
             <Terminal size={16} className="text-slate-600 group-focus-within:text-emerald-500" />
          </div>
        </div>
        
        {availableAds.length > 0 ? (
            <div className="mb-8 bg-slate-900/50 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Megaphone className="text-emerald-400" size={20} />
                    <div className="text-sm">
                        <span className="text-white font-bold block">Ad Injection Active</span>
                        <span className="text-slate-500 text-xs">Highest bidder will be applied automatically.</span>
                    </div>
                </div>
                <div className="text-emerald-400 font-bold text-sm">
                    {availableAds.sort((a,b) => b.cpm - a.cpm)[0].brandName} (${availableAds.sort((a,b) => b.cpm - a.cpm)[0].cpm} CPM)
                </div>
            </div>
        ) : (
            <div className="mb-8 text-xs text-center text-slate-500">
                No ads available. Create one in the Ad Studio to earn.
            </div>
        )}

        <div className="flex flex-wrap gap-2 mb-8">
          {['Flappy Bird Clone', 'Retro Snake', 'Neon Breakout', 'Typing Defense'].map(idea => (
            <button 
              key={idea}
              onClick={() => setPrompt(idea)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-xs font-bold text-slate-300 transition-all hover:scale-105 active:scale-95"
            >
              {idea}
            </button>
          ))}
        </div>
      </div>

      <Button 
        onClick={handleGenerate} 
        disabled={!prompt.trim()}
        className="w-full py-5 text-xl rounded-2xl shadow-emerald-500/20 shadow-2xl"
      >
        <span className="flex items-center gap-2 font-black tracking-tight">
          <Sparkles size={24} />
          GENERATE
        </span>
      </Button>
    </div>
  );
};
