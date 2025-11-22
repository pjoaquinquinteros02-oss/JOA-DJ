import React from 'react';

interface CrossfaderProps {
  value: number;
  onChange: (val: number) => void;
}

export const Crossfader: React.FC<CrossfaderProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col items-center w-full max-w-[300px]">
      <div className="relative w-full h-12 bg-black/40 rounded-lg border border-white/5 flex items-center px-2">
        {/* Track Line */}
        <div className="absolute left-4 right-4 h-1 bg-black rounded-full" />
        
        {/* Center Marker */}
        <div className="absolute left-1/2 top-2 bottom-2 w-0.5 bg-white/20 -translate-x-1/2" />

        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {/* Thumb */}
        <div 
          className="absolute w-10 h-8 bg-muted border border-white/20 rounded shadow-lg pointer-events-none flex flex-col items-center justify-center gap-1"
          style={{ 
            left: `calc(${value}% - 20px)` // Center the 40px thumb
          }}
        >
          <div className="w-0.5 h-4 bg-primary" />
        </div>
      </div>
      <div className="flex justify-between w-full px-2 mt-1">
        <span className="text-[10px] text-muted-foreground font-bold">A</span>
        <span className="text-[10px] text-muted-foreground font-bold">B</span>
      </div>
    </div>
  );
};
