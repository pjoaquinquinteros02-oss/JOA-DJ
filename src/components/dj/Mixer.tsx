import React from 'react';
import { useDJ } from '../../context/DJContext';
import { Knob } from './Knob';
import { Fader } from './Fader';
import { Crossfader } from './Crossfader';

export const Mixer: React.FC = () => {
  const { deckA, deckB, setVolume, setEq, setGain, crossfader, setCrossfader } = useDJ();
  const [meterA, setMeterA] = React.useState(0);
  const [meterB, setMeterB] = React.useState(0);

  // Simulate VU Meter Bounce
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (deckA.playing) {
        setMeterA(Math.max(0, Math.min(100, deckA.volume + (Math.random() * 20 - 10))));
      } else {
        setMeterA(0);
      }
      if (deckB.playing) {
        setMeterB(Math.max(0, Math.min(100, deckB.volume + (Math.random() * 20 - 10))));
      } else {
        setMeterB(0);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [deckA.playing, deckA.volume, deckB.playing, deckB.volume]);

  return (
    <div className="flex flex-col w-[340px] bg-[#131316] border-x border-[#333] p-4 relative z-10 shadow-2xl">
      {/* Top Section: Gains */}
      <div className="flex justify-between mb-6 px-4">
        <Knob 
          label="GAIN" 
          value={deckA.gain} 
          onChange={(v) => setGain('A', v)} 
          color="#22d3ee"
        />
        <div className="flex flex-col items-center justify-center">
             <div className="text-xs font-bold text-muted-foreground tracking-widest mb-1">MASTER</div>
             <div className="w-16 h-8 bg-black rounded border border-white/10 flex items-center justify-center">
                <div className="flex gap-1 h-4">
                    <div className="w-1 bg-green-500 h-full animate-pulse" />
                    <div className="w-1 bg-green-500 h-3 self-end" />
                    <div className="w-1 bg-yellow-500 h-2 self-end" />
                    <div className="w-1 bg-red-500 h-1 self-end" />
                </div>
             </div>
        </div>
        <Knob 
          label="GAIN" 
          value={deckB.gain} 
          onChange={(v) => setGain('B', v)} 
          color="#f43f5e"
        />
      </div>

      {/* EQ Section */}
      <div className="flex-1 flex justify-between px-2">
        {/* Deck A EQ */}
        <div className="flex flex-col gap-4 items-center bg-[#0f0f11] p-3 rounded-lg border border-white/5">
          <Knob label="HIGH" value={deckA.eq.high} onChange={(v) => setEq('A', 'high', v)} />
          <Knob label="MID" value={deckA.eq.mid} onChange={(v) => setEq('A', 'mid', v)} />
          <Knob label="LOW" value={deckA.eq.low} onChange={(v) => setEq('A', 'low', v)} />
        </div>

        {/* VU Meters (Center) */}
        <div className="flex gap-2 items-center justify-center px-2">
            <div className="w-2 h-48 bg-black rounded-full overflow-hidden flex flex-col justify-end p-[1px]">
               <div 
                 className="w-full bg-gradient-to-t from-green-500 via-yellow-400 to-red-500 opacity-80 transition-all duration-75" 
                 style={{ height: `${meterA}%` }} 
               />
            </div>
            <div className="w-2 h-48 bg-black rounded-full overflow-hidden flex flex-col justify-end p-[1px]">
               <div 
                 className="w-full bg-gradient-to-t from-green-500 via-yellow-400 to-red-500 opacity-80 transition-all duration-75" 
                 style={{ height: `${meterB}%` }} 
               />
            </div>
        </div>

        {/* Deck B EQ */}
        <div className="flex flex-col gap-4 items-center bg-[#0f0f11] p-3 rounded-lg border border-white/5">
          <Knob label="HIGH" value={deckB.eq.high} onChange={(v) => setEq('B', 'high', v)} />
          <Knob label="MID" value={deckB.eq.mid} onChange={(v) => setEq('B', 'mid', v)} />
          <Knob label="LOW" value={deckB.eq.low} onChange={(v) => setEq('B', 'low', v)} />
        </div>
      </div>

      {/* Volume Faders */}
      <div className="flex justify-between px-6 mt-6 h-48">
         <Fader 
           value={deckA.volume} 
           onChange={(v) => setVolume('A', v)} 
           height="h-40"
           label="VOL A"
         />
         <Fader 
           value={deckB.volume} 
           onChange={(v) => setVolume('B', v)} 
           height="h-40"
           label="VOL B"
         />
      </div>

      {/* Crossfader */}
      <div className="mt-4 flex justify-center">
        <Crossfader value={crossfader} onChange={setCrossfader} />
      </div>
    </div>
  );
};
