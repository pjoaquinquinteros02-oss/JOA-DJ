import React, { useState, useRef, useEffect } from 'react';

interface KnobProps {
  value: number;
  min?: number;
  max?: number;
  label: string;
  onChange: (val: number) => void;
  color?: string;
}

export const Knob: React.FC<KnobProps> = ({ 
  value, 
  min = 0, 
  max = 100, 
  label, 
  onChange,
  color = "var(--primary)"
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(0);
  const knobRef = useRef<HTMLDivElement>(null);

  const percentage = ((value - min) / (max - min)) * 100;
  const rotation = -135 + (percentage * 2.7); // Map 0-100 to -135 to 135 degrees

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const deltaY = startY - e.clientY;
      const range = max - min;
      const deltaValue = (deltaY / 100) * range; // Sensitivity
      let newValue = startValue + deltaValue;
      newValue = Math.max(min, Math.min(max, newValue));
      onChange(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startY, startValue, min, max, onChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
  };

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div 
        ref={knobRef}
        className="relative w-12 h-12 rounded-full bg-muted border-2 border-muted-foreground/20 cursor-ns-resize touch-none"
        onMouseDown={handleMouseDown}
        style={{ 
          boxShadow: `inset 0 0 10px rgba(0,0,0,0.5)` 
        }}
      >
        <div 
          className="absolute w-full h-full rounded-full"
          style={{ 
            transform: `rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.1s'
          }}
        >
          <div 
            className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
        
        {/* Center cap */}
        <div className="absolute inset-3 rounded-full bg-card border border-white/5" />
      </div>
      <span className="text-[10px] font-bold uppercase text-muted-foreground">{label}</span>
    </div>
  );
};
