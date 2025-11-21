import React from 'react';
import type { ColorStep } from '../types';
import Icon from './Icon';

interface ColorInputProps {
  step: ColorStep;
  onUpdate: (id: string, newStep: Partial<ColorStep>) => void;
  onRemove: (id: string) => void;
  index: number;
}

// FIX: Explicitly type ColorInput as a React.FC to correctly handle the `key` prop provided in App.tsx.
// This resolves the TypeScript error without needing to modify the props interface.
const ColorInput: React.FC<ColorInputProps> = ({ step, onUpdate, onRemove, index }) => {
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(step.id, { color: e.target.value });
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const duration = Math.max(0.1, parseFloat(e.target.value) || 1);
    onUpdate(step.id, { duration });
  };

  return (
    <div className="flex items-center space-x-2 p-2 rounded-lg bg-white/10">
      <span className="font-mono text-sm text-gray-400 w-6 text-center">{index + 1}</span>
      <div className="relative h-10 w-10 flex-shrink-0">
         <input
            type="color"
            value={step.color}
            onChange={handleColorChange}
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
            aria-label={`Select color for step ${index + 1}`}
          />
         <div className="w-full h-full rounded-md border-2 border-white/20" style={{ backgroundColor: step.color }}></div>
      </div>
      <div className="flex-grow">
        <label htmlFor={`duration-${step.id}`} className="sr-only">Duration</label>
        <div className="relative">
          <input
            id={`duration-${step.id}`}
            type="number"
            step="0.1"
            min="0.1"
            value={step.duration}
            onChange={handleDurationChange}
            className="w-full bg-transparent text-white border border-white/20 rounded-md py-2 pl-3 pr-10 text-center"
          />
           <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">sec</span>
        </div>
      </div>
      <button
        onClick={() => onRemove(step.id)}
        className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-full hover:bg-white/10"
        aria-label={`Remove step ${index + 1}`}
      >
        <Icon name="trash" className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ColorInput;