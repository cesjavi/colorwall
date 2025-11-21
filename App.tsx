
import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { ColorStep, SavedPattern } from './types';
import ColorInput from './components/ColorInput';
import Icon from './components/Icon';
import { useColorChanger } from './hooks/useColorChanger';

const DEFAULT_PATTERN: ColorStep[] = [
  { id: crypto.randomUUID(), color: '#ff0000', duration: 5 },
  { id: crypto.randomUUID(), color: '#ffffff', duration: 5 },
];

// Helper to determine if a color is light or dark
const isColorLight = (hexColor: string): boolean => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
};


const App = () => {
  const [pattern, setPattern] = useState<ColorStep[]>(DEFAULT_PATTERN);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isConfigVisible, setIsConfigVisible] = useState(false);
  
  // Text customization state
  const [displayText, setDisplayText] = useState('');
  const [textColorMode, setTextColorMode] = useState<'auto' | 'custom'>('auto');
  const [customTextColor, setCustomTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(12);
  
  // Save/Load State
  const [savedPatterns, setSavedPatterns] = useState<SavedPattern[]>(() => {
    try {
      const saved = localStorage.getItem('color-cycler-patterns');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse saved patterns", error);
      return [];
    }
  });
  const [saveName, setSaveName] = useState('');
  const [showSavedPatterns, setShowSavedPatterns] = useState(false);
  const [loadedPatternId, setLoadedPatternId] = useState<string | null>(null);

  const [currentColor, resetColorChanger] = useColorChanger(pattern, isPlaying);

  const finalDisplayText = displayText.replace(/\{color\}/gi, currentColor);
  const finalTextColor = textColorMode === 'auto'
      ? (isColorLight(currentColor) ? '#000000' : '#ffffff')
      : customTextColor;

  // Wake Lock Logic
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        } catch (err) {
          console.warn('Could not acquire wake lock:', err);
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        } catch (err) {
          console.warn('Could not release wake lock:', err);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isPlaying) {
        requestWakeLock();
      }
    };

    if (isPlaying) {
      requestWakeLock();
      document.addEventListener('visibilitychange', handleVisibilityChange);
    } else {
      releaseWakeLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      releaseWakeLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);


  const handleUpdateStep = useCallback((id: string, newStep: Partial<ColorStep>) => {
    setPattern(prev =>
      prev.map(step => (step.id === id ? { ...step, ...newStep } : step))
    );
  }, []);

  const handleRemoveStep = useCallback((id: string) => {
    setPattern(prev => prev.filter(step => step.id !== id));
  }, []);

  const handleAddStep = () => {
    const newStep: ColorStep = {
      id: crypto.randomUUID(),
      color: '#ffffff',
      duration: 5,
    };
    setPattern(prev => [...prev, newStep]);
  };
  
  const handleTogglePlay = () => {
    if (pattern.length > 0) {
      setIsPlaying(prev => !prev);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    resetColorChanger();
  };
  
  const toggleConfigVisibility = () => {
    setIsConfigVisible(prev => !prev);
  };

  // Saving Logic
  const handleSavePattern = () => {
    if (!saveName.trim()) return;
    
    const newPattern: SavedPattern = {
      id: crypto.randomUUID(),
      name: saveName.trim(),
      steps: pattern
    };

    const updatedPatterns = [...savedPatterns, newPattern];
    setSavedPatterns(updatedPatterns);
    localStorage.setItem('color-cycler-patterns', JSON.stringify(updatedPatterns));
    setSaveName('');
  };

  const handleLoadPattern = (saved: SavedPattern) => {
    // Regenerate IDs to ensure fresh state for React rendering
    const newSteps = saved.steps.map(step => ({
      ...step,
      id: crypto.randomUUID()
    }));
    setPattern(newSteps);
    
    // Show visual feedback
    setLoadedPatternId(saved.id);
    setTimeout(() => setLoadedPatternId(null), 1500);
    
    // Auto play when loading
    setIsPlaying(true);
  };

  const handleDeletePattern = (id: string) => {
    const updatedPatterns = savedPatterns.filter(p => p.id !== id);
    setSavedPatterns(updatedPatterns);
    localStorage.setItem('color-cycler-patterns', JSON.stringify(updatedPatterns));
  };

  return (
    <main
      className="relative flex flex-col h-screen w-screen transition-colors duration-500 ease-in-out overflow-hidden"
      style={{ backgroundColor: currentColor }}
    >
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="text-center">
           <h1
            className="font-bold font-mono tracking-widest uppercase break-all transition-colors duration-500"
            style={{
              color: finalTextColor,
              fontSize: `${textSize}vw`,
              lineHeight: 1.1,
            }}
          >
            {finalDisplayText}
          </h1>
        </div>
      </div>
      
      <div 
        className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ease-in-out ${
          isConfigVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
        }`}
        aria-hidden={!isConfigVisible}
      >
        <div className="max-w-2xl mx-auto bg-black/40 backdrop-blur-md rounded-2xl p-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Text Content */}
                <div>
                    <label htmlFor="displayText" className="block text-sm font-medium text-gray-300 mb-1">Display Text</label>
                    <input
                        type="text"
                        id="displayText"
                        value={displayText}
                        onChange={(e) => setDisplayText(e.target.value)}
                        className="w-full bg-white/10 text-white border border-white/20 rounded-md py-2 px-3 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Use {color} for hex"
                    />
                </div>

                {/* Text Size */}
                <div>
                    <label htmlFor="textSize" className="block text-sm font-medium text-gray-300 mb-1">
                        Text Size <span className="font-mono text-xs">({textSize}vw)</span>
                    </label>
                    <input
                        type="range"
                        id="textSize"
                        min="1"
                        max="25"
                        step="0.5"
                        value={textSize}
                        onChange={(e) => setTextSize(Number(e.target.value))}
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                {/* Text Color */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Text Color</label>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center bg-white/10 p-1 rounded-lg">
                            <button onClick={() => setTextColorMode('auto')} className={`px-3 py-1 text-sm rounded-md transition-colors ${textColorMode === 'auto' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-white/10'}`}>Auto</button>
                            <button onClick={() => setTextColorMode('custom')} className={`px-3 py-1 text-sm rounded-md transition-colors ${textColorMode === 'custom' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-white/10'}`}>Custom</button>
                        </div>
                        {textColorMode === 'custom' && (
                            <div className="relative h-10 w-10">
                                <input
                                    type="color"
                                    value={customTextColor}
                                    onChange={(e) => setCustomTextColor(e.target.value)}
                                    className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                                    aria-label="Select custom text color"
                                />
                                <div className="w-full h-full rounded-md border-2 border-white/20" style={{ backgroundColor: customTextColor }}></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="border-t border-white/20 mb-4"></div>

            <div className="max-h-48 overflow-y-auto pr-2 space-y-2 mb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
               {pattern.map((step, index) => (
                    <ColorInput
                        key={step.id}
                        index={index}
                        step={step}
                        onUpdate={handleUpdateStep}
                        onRemove={handleRemoveStep}
                    />
                ))}
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20">
                <button
                    onClick={handleAddStep}
                    className="flex items-center justify-center space-x-2 bg-white/10 text-white rounded-lg py-3 px-4 hover:bg-white/20 transition-all"
                >
                    <Icon name="plus" className="h-5 w-5" />
                    <span className="text-sm font-semibold">Add</span>
                </button>
                <button
                    onClick={handleTogglePlay}
                    disabled={pattern.length === 0}
                    className="flex items-center justify-center space-x-2 bg-blue-500 text-white rounded-lg py-3 px-4 hover:bg-blue-600 transition-all disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    <Icon name={isPlaying ? 'pause' : 'play'} className="h-6 w-6" />
                    <span className="text-lg font-bold">{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <button
                    onClick={handleReset}
                    className="flex items-center justify-center space-x-2 bg-white/10 text-white rounded-lg py-3 px-4 hover:bg-white/20 transition-all"
                >
                    <Icon name="reset" className="h-5 w-5" />
                    <span className="text-sm font-semibold">Reset</span>
                </button>
            </div>
            
            {/* Saved Patterns Section */}
            <div className="mt-4 pt-4 border-t border-white/20">
                <button 
                  onClick={() => setShowSavedPatterns(!showSavedPatterns)}
                  className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Icon name="folder" className="h-4 w-4" />
                    Saved Patterns ({savedPatterns.length})
                  </span>
                  <Icon 
                    name="chevron-down" 
                    className={`h-4 w-4 transition-transform ${showSavedPatterns ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                {showSavedPatterns && (
                  <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex space-x-2">
                        <input 
                            value={saveName} 
                            onChange={e => setSaveName(e.target.value)}
                            placeholder="Name your pattern..."
                            className="flex-1 bg-white/10 text-white border border-white/20 rounded-l-md py-2 px-3 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && handleSavePattern()}
                        />
                        <button 
                          onClick={handleSavePattern}
                          disabled={!saveName.trim()}
                          className="bg-green-600 text-white px-4 rounded-r-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Save current pattern"
                        >
                          <Icon name="save" className="h-5 w-5" />
                        </button>
                    </div>
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/20">
                        {savedPatterns.length === 0 ? (
                          <p className="text-gray-500 text-center text-xs py-2 italic">No saved patterns yet</p>
                        ) : (
                          savedPatterns.map(p => (
                              <div 
                                key={p.id} 
                                className={`flex items-center justify-between p-2 rounded transition-all duration-300 group ${
                                    loadedPatternId === p.id 
                                    ? 'bg-green-500/20 ring-1 ring-green-500/50' 
                                    : 'bg-white/5 hover:bg-white/10'
                                }`}
                              >
                                  <span className="text-white text-sm font-mono truncate flex-1 mr-2 flex items-center gap-2">
                                    {p.name}
                                    {loadedPatternId === p.id && (
                                      <span className="text-[10px] uppercase bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded font-bold tracking-wide animate-pulse">
                                        Loaded
                                      </span>
                                    )}
                                  </span>
                                  <div className="flex space-x-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                      <button 
                                        onClick={() => handleLoadPattern(p)}
                                        className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded"
                                        title="Load pattern"
                                      >
                                        <Icon name="folder" className="h-4 w-4" />
                                      </button>
                                      <button 
                                        onClick={() => handleDeletePattern(p.id)}
                                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                                        title="Delete pattern"
                                      >
                                        <Icon name="trash" className="h-4 w-4" />
                                      </button>
                                  </div>
                              </div>
                          ))
                        )}
                    </div>
                  </div>
                )}
            </div>
        </div>
      </div>

      <button
        onClick={toggleConfigVisibility}
        className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-all shadow-lg"
        aria-label={isConfigVisible ? 'Hide settings' : 'Show settings'}
      >
        <Icon name={isConfigVisible ? 'chevron-down' : 'settings'} className="h-7 w-7" />
      </button>

    </main>
  );
};

export default App;
