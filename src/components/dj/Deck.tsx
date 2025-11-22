import React, { useEffect, useRef } from 'react';
import { useDJ } from '../../context/DJContext';
import { Play, Pause, RotateCcw, Disc } from 'lucide-react';
import { Fader } from './Fader';

interface DeckProps {
  id: 'A' | 'B';
}

export const Deck: React.FC<DeckProps> = ({ id }) => {
  const { deckA, deckB, togglePlay, setPitch, setVolume, updateTime, loadTrack } = useDJ();
  const state = id === 'A' ? deckA : deckB;
  const color = id === 'A' ? 'text-cyan-400' : 'text-rose-500';
  const borderColor = id === 'A' ? 'border-cyan-400/30' : 'border-rose-500/30';
  const bgGlow = id === 'A' ? 'shadow-[0_0_30px_-5px_rgba(34,211,238,0.15)]' : 'shadow-[0_0_30px_-5px_rgba(244,63,94,0.15)]';

  // Simulate playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.playing && state.track) {
      interval = setInterval(() => {
        // Standard playback + pitch influence
        const pitchFactor = 1 + (state.pitch / 100); 
        const nextTime = state.currentTime + (0.1 * pitchFactor);
        
        if (nextTime >= state.track.duration) {
          updateTime(id, 0);
          togglePlay(id); // Stop at end
        } else {
          updateTime(id, nextTime);
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [state.playing, state.pitch, state.track, state.currentTime, id, updateTime, togglePlay]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Calculate rotation based on time for the jog wheel
  const rotation = (state.currentTime * 360) % 360;

  return (
    <div className={`flex flex-col h-full bg-[#18181b] border ${borderColor} rounded-xl p-4 relative overflow-hidden ${bgGlow}`}>
      {/* Header Info */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <h2 className={`text-2xl font-black tracking-tighter ${color}`}>DECK {id}</h2>
          {state.track ? (
            <div className="mt-1">
              <div className="text-white font-bold truncate max-w-[200px]">{state.track.title}</div>
              <div className="text-muted-foreground text-sm truncate max-w-[200px]">{state.track.artist}</div>
            </div>
          ) : (
            <div className="text-muted-foreground mt-2 italic">No Track Loaded</div>
          )}
        </div>
        
        <div className="flex flex-col items-end bg-black/50 p-2 rounded border border-white/10">
          <div className="text-3xl font-mono text-white tabular-nums">
            {formatTime(state.currentTime)}
          </div>
          <div className="flex gap-3 text-xs font-mono text-muted-foreground">
            <span>REMAIN {state.track ? formatTime(state.track.duration - state.currentTime) : '0:00.00'}</span>
            <span className={color}>{state.track?.bpm || 0} BPM</span>
          </div>
        </div>
      </div>

      {/* Main Control Area */}
      <div className="flex-1 flex gap-4">
        
        {/* Pitch Slider */}
        <div className="h-full py-4">
           <Fader 
             value={state.pitch} 
             min={-10} 
             max={10} 
             onChange={(val) => setPitch(id, val)} 
             label="PITCH"
             height="h-64"
             color={id === 'A' ? '#22d3ee' : '#f43f5e'}
           />
           <div className="text-center text-xs font-mono mt-2 text-white/50">{state.pitch > 0 ? '+' : ''}{state.pitch.toFixed(1)}%</div>
        </div>

        {/* Jog Wheel */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-64 h-64 rounded-full bg-[#0a0a0a] border-4 border-[#222] shadow-2xl flex items-center justify-center overflow-hidden group">
            {/* Outer Ring */}
            <div className="absolute inset-0 rounded-full border border-white/10 vinyl-groove opacity-80" />
            
            {/* Spinning Platter */}
            <div 
              className="absolute inset-2 rounded-full"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
               {/* Cover Art or Placeholder */}
               {state.track ? (
                 <img src={state.track.cover} alt="cover" className="w-full h-full object-cover rounded-full opacity-60" />
               ) : (
                 <div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center">
                    <Disc className="w-24 h-24 text-white/10" />
                 </div>
               )}
               
               {/* Marker */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-8 bg-white shadow-[0_0_10px_white]" />
            </div>

            {/* Center Hub */}
            <div className="absolute w-16 h-16 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-full border border-white/10 shadow-lg flex items-center justify-center z-10">
               <div className={`w-2 h-2 rounded-full ${state.playing ? 'bg-green-500 animate-pulse' : 'bg-red-900'}`} />
            </div>
          </div>

          {/* Waveform (Simulated) */}
          <div className="w-full h-16 bg-black/40 mt-6 rounded border border-white/5 relative overflow-hidden">
             {state.track && (
               <div 
                  className="absolute inset-y-0 left-0 flex items-center gap-[1px] opacity-60 transition-transform duration-100 ease-linear will-change-transform"
                  style={{ 
                    width: '200%',
                    transform: `translateX(-${(state.currentTime / state.track.duration) * 50}%)`
                  }}
               >
                  {Array.from({ length: 120 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1 rounded-full ${id === 'A' ? 'bg-cyan-500' : 'bg-rose-500'}`}
                      style={{ 
                        height: `${20 + Math.random() * 80}%`,
                        opacity: 0.5 + (Math.random() * 0.5)
                      }}
                    />
                  ))}
               </div>
             )}
             {/* Playhead */}
             <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white z-10" />
          </div>
        </div>
      </div>

      {/* Transport Controls */}
      <div className="flex justify-center gap-4 mt-4 mb-2">
        <button 
          className="w-16 h-16 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center hover:bg-zinc-700 active:scale-95 transition-all shadow-lg group"
          onClick={() => updateTime(id, 0)}
        >
          <div className="flex flex-col items-center">
            <span className="text-white/80 text-xs font-bold mb-1 group-hover:text-white">CUE</span>
            <div className="w-1 h-1 bg-orange-500 rounded-full shadow-[0_0_5px_orange]" />
          </div>
        </button>

        <button 
          className={`w-20 h-20 rounded-full border-2 flex items-center justify-center active:scale-95 transition-all shadow-lg ${state.playing ? 'bg-green-500/20 border-green-500' : 'bg-zinc-800 border-zinc-600 hover:bg-zinc-700'}`}
          onClick={() => togglePlay(id)}
        >
           {state.playing ? (
             <Pause className={`w-8 h-8 ${state.playing ? 'text-green-400 fill-green-400' : 'text-white'}`} />
           ) : (
             <Play className="w-8 h-8 text-white ml-1" />
           )}
        </button>

        <button 
          className="w-16 h-16 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center hover:bg-zinc-700 active:scale-95 transition-all shadow-lg"
          onClick={() => setPitch(id, 0)}
        >
           <span className="text-white/80 text-xs font-bold">SYNC</span>
        </button>
      </div>
    </div>
  );
};
