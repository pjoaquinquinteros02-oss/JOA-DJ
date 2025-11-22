import React from 'react';

interface FaderProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
  label?: string;
  height?: string;
  color?: string;
}

export const Fader: React.FC<FaderProps> = ({ 
  value, 
  min = 0, 
  max = 100, 
  onChange, 
  label,
  height = "h-48",
  color = "var(--primary)"
}) => {
  return (
    <div className="flex flex-col items-center gap-2 h-full">
      <div className={`relative ${height} w-10 bg-black/40 rounded-lg border border-white/5 p-1 flex justify-center`}>
        <div className="absolute inset-x-0 top-4 bottom-4 w-1 bg-black mx-auto rounded-full opacity-50 pointer-events-none" />
        
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute w-[calc(100%-2rem)] h-[calc(100%-1rem)] -rotate-90 translate-y-[0%] origin-center appearance-none bg-transparent cursor-pointer focus:outline-none"
          style={{
            // This is a bit hacky for vertical range input cross-browser support, 
            // but transforms are usually the most reliable way
            width: `calc(var(--h) - 1rem)`, 
            height: '2rem',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-90deg)',
            '--h': height === 'h-48' ? '12rem' : '16rem'
          } as any}
        />
        
        {/* Visual Thumb representation since styling default range thumb is painful */}
        <div 
          className="absolute w-8 h-5 bg-muted border border-white/20 rounded shadow-lg pointer-events-none flex items-center justify-center"
          style={{ 
            bottom: `${((value - min) / (max - min)) * 90 + 2}%` // Adjusted for padding
          }}
        >
          <div className="w-6 h-0.5 bg-white/50" />
        </div>
      </div>
      {label && <span className="text-[10px] font-bold uppercase text-muted-foreground">{label}</span>}
    </div>
  );
};
