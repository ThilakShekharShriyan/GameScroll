
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Feed } from './components/GameFeed';
import { CreateGame } from './components/CreateGame';
import { AdsManager } from './components/AdsManager';
import { Login } from './components/Login';
import { Game, User, Advertisement, Comment } from './types';
import { MOCK_GAMES } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'feed' | 'create' | 'profile' | 'ads'>('feed');
  const [games, setGames] = useState<Game[]>(MOCK_GAMES);
  
  // Ad Ecosystem State - Initialized Empty
  const [ads, setAds] = useState<Advertisement[]>([]);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handlePublishGame = (newGame: Game) => {
    setGames([newGame, ...games]); // Add new game to top
    setCurrentView('feed');
  };
  
  const handleAddAd = (ad: Advertisement) => {
    setAds([...ads, ad]);
  };

  const handleToggleLike = (gameId: string) => {
    setGames(prev => prev.map(g => {
        if (g.id === gameId) {
            const isLiked = !g.isLiked;
            return {
                ...g,
                isLiked,
                likes: g.likes + (isLiked ? 1 : -1)
            };
        }
        return g;
    }));
  };

  const handleAddComment = (gameId: string, text: string) => {
    if (!user) return;
    const newComment: Comment = {
        id: Date.now().toString(),
        username: user.name,
        avatar: user.avatar,
        text,
        createdAt: Date.now()
    };
    
    setGames(prev => prev.map(g => {
        if (g.id === gameId) {
            return {
                ...g,
                comments: g.comments + 1,
                commentsList: [newComment, ...(g.commentsList || [])]
            };
        }
        return g;
    }));
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-slate-900 text-slate-100 font-sans">
      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {currentView === 'feed' && (
          <Feed 
            games={games} 
            onPlay={() => {}} 
            onToggleLike={handleToggleLike}
            onAddComment={handleAddComment}
          />
        )}
        
        {currentView === 'ads' && (
          <AdsManager ads={ads} onAddAd={handleAddAd} />
        )}
        
        {currentView === 'create' && (
          <CreateGame 
            user={user} 
            onPublish={handlePublishGame} 
            availableAds={ads}
          />
        )}
        
        {currentView === 'profile' && (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900">
            <div className="w-24 h-24 rounded-full bg-slate-800 mb-4 overflow-hidden border-2 border-emerald-500">
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
            <p className="text-slate-400 mt-2">{user.email}</p>
            <div className="mt-8 p-4 bg-slate-800/50 rounded-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-2">My Stats</h3>
              <div className="flex justify-between text-sm">
                  <span>Games Created</span>
                  <span className="text-emerald-400 font-bold">{games.filter(g => g.creator === user.name).length}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                  <span>Total Likes</span>
                  <span className="text-emerald-400 font-bold">1,240</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                  <span>Active Ads</span>
                  <span className="text-emerald-400 font-bold">{ads.length}</span>
              </div>
            </div>
            <button 
              onClick={() => setUser(null)}
              className="mt-8 text-red-400 text-sm hover:text-red-300 underline"
            >
              Sign Out
            </button>
          </div>
        )}
      </main>

      {/* Navigation */}
      <Layout currentView={currentView} onViewChange={setCurrentView} />
    </div>
  );
};

export default App;
