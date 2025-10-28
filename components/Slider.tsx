
import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  max: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  colorClass: string;
}

export const Slider: React.FC<SliderProps> = ({ label, value, max, onChange, colorClass }) => {
  const percentage = (value / max) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{value}/{max}</span>
      </div>
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
        <div 
          className={`absolute top-0 left-0 h-2 rounded-full ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min="0"
          max={max}
          value={value}
          onChange={onChange}
          className="absolute w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};