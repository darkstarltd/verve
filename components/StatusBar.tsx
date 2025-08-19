import React from 'react';
import { useAppContext } from '../context/AppContext';
import { TerminalIcon } from './icons';
import { Viewport } from '../types';

export const StatusBar: React.FC<{
  onToggleTerminal: () => void;
  isTerminalVisible: boolean;
}> = ({ onToggleTerminal, isTerminalVisible }) => {
    const { state: { projectType, viewport, canvasWidth }, dispatch } = useAppContext();
    const isWeb = projectType === 'web';
    
    const handleViewportSnap = (vp: Viewport, width: number) => {
      dispatch({ type: 'SET_VIEWPORT', payload: vp });
      dispatch({ type: 'SET_CANVAS_WIDTH', payload: width });
    };
    
    return (
        <div className="h-8 bg-[var(--color-surface-light)] border-t border-[var(--color-border)] flex items-center justify-between px-4 text-xs text-[var(--color-text-secondary)]">
            <div className="flex items-center gap-4">
                <button onClick={onToggleTerminal} className={`flex items-center gap-1 hover:text-white ${isTerminalVisible ? 'text-[var(--color-primary)]' : ''}`}>
                    <TerminalIcon /> Terminal
                </button>
            </div>
            {isWeb && (
                <div className="flex items-center gap-4">
                    <span className="font-mono bg-[var(--color-background)] px-2 py-0.5 rounded-md w-20 text-center">
                      {Math.round(canvasWidth)}px
                    </span>
                    <div className="flex items-center gap-1 bg-[var(--color-background)] p-0.5 rounded-md">
                       <button onClick={() => handleViewportSnap('desktop', 1280)} className={`px-2 py-0.5 rounded-md ${viewport === 'desktop' ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-[var(--color-surface)]'}`}>Desktop</button>
                       <button onClick={() => handleViewportSnap('tablet', 768)} className={`px-2 py-0.5 rounded-md ${viewport === 'tablet' ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-[var(--color-surface)]'}`}>Tablet</button>
                       <button onClick={() => handleViewportSnap('mobile', 375)} className={`px-2 py-0.5 rounded-md ${viewport === 'mobile' ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-[var(--color-surface)]'}`}>Mobile</button>
                    </div>
                </div>
            )}
        </div>
    );
}