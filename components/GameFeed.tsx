
import React, { useEffect, useRef, useState } from 'react';
import { Game, Comment } from '../types';
import { Heart, MessageCircle, Share2, Disc3, Maximize2, Send, X } from 'lucide-react';

interface FeedProps {
  games: Game[];
  onPlay: (game: Game) => void;
  onToggleLike: (gameId: string) => void;
  onAddComment: (gameId: string, text: string) => void;
}

const ActiveGameRunner: React.FC<{ game: Game }> = ({ game }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { 
            margin: 0; padding: 0; overflow: hidden; background: transparent;
            width: 100vw; height: 100vh;
            display: flex; align-items: center; justify-content: center;
          }
          canvas { 
            /* FIXED LOGICAL RESOLUTION SCALED VISUALLY */
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            object-fit: contain; /* Keeps aspect ratio intact inside the container */
          }
        </style>
      </head>
      <body>
        <!-- Hardcoded logical size for consistency -->
        <canvas id="gameCanvas" width="400" height="600"></canvas>
        <script>
          const canvas = document.getElementById('gameCanvas');
          
          // Strict focus management
          window.focus(); 
          window.addEventListener('click', () => window.focus());
          
          // Block scrolling keys
          window.addEventListener('keydown', function(e) {
            if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
                e.preventDefault();
            }
          }, false);

          try {
             // Inject Game Code
             ${game.code}
          } catch(e) {
             console.error("Game Error", e);
             document.body.innerHTML = '<div style="color:red; text-align:center; padding:20px;">' + e.message + '</div>';
          }
        </script>
      </body>
    </html>
  `;

  useEffect(() => {
    const focusInterval = setInterval(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.focus();
      }
    }, 500);
    return () => clearInterval(focusInterval);
  }, []);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={htmlContent}
      className="w-full h-full border-none"
      sandbox="allow-scripts allow-same-origin"
      title={game.title}
    />
  );
};

const CommentsDrawer: React.FC<{ 
    game: Game; 
    onClose: () => void; 
    onAddComment: (text: string) => void; 
}> = ({ game, onClose, onAddComment }) => {
    const [text, setText] = useState('');
    const comments = game.commentsList || [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onAddComment(text);
            setText('');
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
            <div 
                className="bg-slate-900 border-t border-white/10 rounded-t-3xl w-full h-[60%] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <div className="flex flex-col">
                        <span className="font-bold text-white">Comments</span>
                        <span className="text-xs text-slate-500">{comments.length} total</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                    {comments.length === 0 ? (
                        <div className="text-center text-slate-500 mt-10 text-sm">
                            No comments yet. Be the first!
                        </div>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} className="flex gap-3">
                                <img src={comment.avatar} alt={comment.username} className="w-8 h-8 rounded-full bg-slate-800 flex-shrink-0" />
                                <div className="flex flex-col">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xs font-bold text-slate-300">{comment.username}</span>
                                        <span className="text-[10px] text-slate-600">{new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <p className="text-sm text-slate-200 leading-relaxed">{comment.text}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 bg-black/20 flex gap-2">
                    <input 
                        type="text" 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Add a comment..." 
                        className="flex-1 bg-slate-800 rounded-full px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button 
                        type="submit" 
                        disabled={!text.trim()}
                        className="p-2 bg-emerald-500 rounded-full text-white disabled:opacity-50 disabled:bg-slate-700 transition-all"
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
}

const FeedItem: React.FC<{ 
    game: Game; 
    isActive: boolean;
    onToggleLike: (id: string) => void;
    onAddComment: (id: string, text: string) => void;
}> = ({ game, isActive, onToggleLike, onAddComment }) => {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="h-full w-full snap-start relative flex flex-col bg-black border-b border-slate-900 overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-30 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900" />
          <img 
            src={game.creatorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${game.creator}`} 
            className="w-full h-full object-cover blur-3xl opacity-50"
            alt="bg"
          />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col pt-14 pb-24 px-4"> 
         
         {/* The Game Console / Screen Container */}
         <div className="flex-1 w-full max-w-md mx-auto relative flex flex-col">
            <div className="relative flex-1 bg-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/5 aspect-[2/3]">
                {isActive ? (
                  <ActiveGameRunner game={game} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-500 gap-4">
                     <div className="w-12 h-12 rounded-full border-2 border-slate-800 border-t-emerald-500 animate-spin" />
                  </div>
                )}
                
                {/* CRT/Scanline Effect Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>

                {/* Comments Overlay */}
                {showComments && (
                    <CommentsDrawer 
                        game={game} 
                        onClose={() => setShowComments(false)} 
                        onAddComment={(text) => onAddComment(game.id, text)}
                    />
                )}
            </div>
         </div>

         {/* Bottom Info */}
         <div className="mt-4 flex items-end justify-between max-w-md mx-auto w-full">
             <div className="flex-1 pr-12">
                <div className="flex items-center gap-2 mb-2">
                    <img src={game.creatorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${game.creator}`} className="w-6 h-6 rounded-full bg-slate-800" />
                    <span className="font-bold text-slate-200 text-sm">@{game.creator}</span>
                </div>
                <h2 className="text-xl font-black text-white leading-tight mb-1">{game.title}</h2>
                <p className="text-xs text-slate-400 line-clamp-1">{game.description}</p>
             </div>
         </div>

         {/* Right Action Bar */}
         <div className="absolute right-4 bottom-28 flex flex-col gap-5 items-center">
             <button 
                onClick={() => onToggleLike(game.id)}
                className="flex flex-col items-center gap-1 group"
             >
                 <div className={`p-3 backdrop-blur-md rounded-full border border-white/10 group-active:scale-90 transition-all ${game.isLiked ? 'bg-rose-500/20 text-rose-500' : 'bg-slate-800/80 text-white'}`}>
                   <Heart className={`w-6 h-6 ${game.isLiked ? 'fill-rose-500' : 'group-hover:text-rose-500'}`} />
                 </div>
                 <span className="text-[10px] font-bold">{game.likes}</span>
             </button>
             
             <button 
                onClick={() => setShowComments(true)}
                className="flex flex-col items-center gap-1 group"
             >
                 <div className="p-3 bg-slate-800/80 backdrop-blur-md rounded-full border border-white/10 group-active:scale-90 transition-transform">
                   <MessageCircle className="w-6 h-6 text-white group-hover:text-blue-400" />
                 </div>
                 <span className="text-[10px] font-bold">{game.comments}</span>
             </button>
             
             <button className="flex flex-col items-center gap-1 group">
                 <div className="p-3 bg-slate-800/80 backdrop-blur-md rounded-full border border-white/10 group-active:scale-90 transition-transform">
                   <Share2 className="w-6 h-6 text-white group-hover:text-emerald-400" />
                 </div>
             </button>
             <div className="mt-2 w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center animate-spin-slow">
                 <Disc3 size={16} />
             </div>
         </div>

      </div>
    </div>
  );
};

export const Feed: React.FC<FeedProps> = ({ games, onPlay, onToggleLike, onAddComment }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          setActiveIndex(index);
        }
      });
    }, {
      root: container,
      threshold: 0.6 
    });

    const elements = container.querySelectorAll('.feed-item-wrapper');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [games]);

  return (
    <div 
      ref={containerRef}
      className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar bg-black"
    >
      {games.map((game, index) => (
        <div 
          key={game.id} 
          data-index={index}
          className="feed-item-wrapper h-full w-full snap-start"
        >
          <FeedItem 
            game={game} 
            isActive={index === activeIndex} 
            onToggleLike={onToggleLike}
            onAddComment={onAddComment}
          />
        </div>
      ))}
    </div>
  );
};
