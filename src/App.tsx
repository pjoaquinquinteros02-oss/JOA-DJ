import React from 'react';
import { DJProvider } from './context/DJContext';
import { Deck } from './components/dj/Deck';
import { Mixer } from './components/dj/Mixer';
import { Library } from './components/dj/Library';
import { Settings, Wifi, Battery, Laptop } from 'lucide-react';

const TopBar = () => (
  <div className="h-12 bg-[#09090b] border-b border-white/10 flex items-center justify-between px-4">
    <div className="flex items-center gap-4">
       <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
          <span className="font-black text-lg tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">MixMaster PRO</span>
       </div>
       <div className="h-6 w-[1px] bg-white/10" />
       <div className="flex gap-4 text-xs font-medium text-muted-foreground">
          <button className="hover:text-white transition-colors">FILE</button>
          <button className="hover:text-white transition-colors">VIEW</button>
          <button className="hover:text-white transition-colors">OPTIONS</button>
          <button className="hover:text-white transition-colors">HELP</button>
       </div>
    </div>

    <div className="flex items-center gap-6">
       <div className="flex items-center gap-2 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded border border-green-400/20">
          <Wifi className="w-3 h-3" />
          <span>ONLINE</span>
       </div>
       <div className="flex items-center gap-3 text-muted-foreground">
          <Laptop className="w-4 h-4" />
          <Battery className="w-4 h-4" />
          <Settings className="w-4 h-4 hover:text-white cursor-pointer" />
       </div>
       <div className="text-xs font-mono text-white/50">
          CPU: 12%
       </div>
    </div>
  </div>
);

const MainLayout = () => {
  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden selection:bg-primary selection:text-black">
      <TopBar />
      
      {/* Main Decks Area */}
      <div className="flex-1 p-4 flex gap-2 min-h-0">
        {/* Deck A */}
        <div className="flex-1 min-w-0">
           <Deck id="A" />
        </div>

        {/* Mixer */}
        <div className="flex-none z-20">
           <Mixer />
        </div>

        {/* Deck B */}
        <div className="flex-1 min-w-0">
           <Deck id="B" />
        </div>
      </div>

      {/* Library Area */}
      <div className="h-[350px] flex-none z-30 relative shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
         <Library />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <DJProvider>
       <MainLayout />
    </DJProvider>
  );
};

export default App;
