import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Viewport, DeepReadonly, Element } from '../types';
import { Code, ZoomIn, ZoomOut, RotateCcw, Terminal } from 'lucide-react';

export const StatusBar: React.FC<{
  selectedElementPath?: readonly Element[];
}> = ({ selectedElementPath }) => {
    const { state, dispatch } = useAppContext();
    const { projectType, viewport, canvasWidth, canvasZoom, panels } = state;
    const isWeb = projectType === 'web';

    const [localCanvasWidth, setLocalCanvasWidth] = useState(String(Math.round(canvasWidth)));

    useEffect(() => {
        setLocalCanvasWidth(String(Math.round(canvasWidth)));
    }, [canvasWidth]);

    const handleCanvasWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalCanvasWidth(e.target.value);
    };

    const handleCanvasWidthSubmit = () => {
        const newWidth = parseInt(localCanvasWidth, 10);
        if (!isNaN(newWidth) && newWidth >= 320 && newWidth <= 2560) {
            dispatch({ type: 'SET_CANVAS_WIDTH', payload: newWidth });
        } else {
            setLocalCanvasWidth(String(Math.round(canvasWidth))); // reset to valid
        }
    };
    
    const handleViewportSnap = (vp: Viewport, width: number) => {
      dispatch({ type: 'SET_VIEWPORT', payload: vp });
      dispatch({ type: 'SET_CANVAS_WIDTH', payload: width });
    };
    
    const handleZoom = (direction: 'in' | 'out' | 'reset') => {
        let newZoom = canvasZoom;
        if (direction === 'in') newZoom = Math.min(2, canvasZoom + 0.1);
        else if (direction === 'out') newZoom = Math.max(0.25, canvasZoom - 0.1);
        else newZoom = 1;
        dispatch({ type: 'SET_CANVAS_ZOOM', payload: newZoom });
    };

    const handleToggleBottomPanel = (panel: 'terminal' | 'code') => {
        const currentPanel = panels.bottomActivePanel;
        if (currentPanel === panel) {
            dispatch({ type: 'SET_PANELS_STATE', payload: { bottomActivePanel: null } });
        } else {
            dispatch({ type: 'SET_PANELS_STATE', payload: { bottomActivePanel: panel } });
        }
    };
    
    const breadcrumbs = selectedElementPath?.map(el => el.name || el.type).join(' > ');

    return (
        <div className="h-8 bg-[var(--color-surface-light)] border-t border-[var(--color-border)] flex items-center justify-between px-4 text-xs text-[var(--color-text-secondary)]">
            <div className="flex items-center gap-4 min-w-0">
                <button onClick={() => handleToggleBottomPanel('terminal')} className={`flex items-center gap-1 hover:text-white ${panels.bottomActivePanel === 'terminal' ? 'text-[var(--color-primary)]' : ''}`}>
                    <Terminal size={16} /> Terminal
                </button>
                 <button onClick={() => handleToggleBottomPanel('code')} className={`flex items-center gap-1 hover:text-white ${panels.bottomActivePanel === 'code' ? 'text-[var(--color-primary)]' : ''}`}>
                    <Code size={16} /> Code Preview
                </button>
                {breadcrumbs && (
                    <div className="hidden md:flex items-center gap-2 min-w-0">
                        <span>Path:</span>
                        <span className="text-white font-medium truncate" title={breadcrumbs}>{breadcrumbs}</span>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1 bg-[var(--color-background)] p-0.5 rounded-md">
                    <button onClick={() => handleZoom('out')} className="px-1 py-0.5 rounded-md hover:bg-[var(--color-surface)]"><ZoomOut size={14}/></button>
                    <button onClick={() => handleZoom('reset')} className="px-2 py-0.5 rounded-md hover:bg-[var(--color-surface)] w-16 text-center">{Math.round(canvasZoom * 100)}%</button>
                    <button onClick={() => handleZoom('in')} className="px-1 py-0.5 rounded-md hover:bg-[var(--color-surface)]"><ZoomIn size={14}/></button>
                </div>
                {isWeb && (
                    <>
                        <div className="flex items-center bg-[var(--color-background)] px-2 py-0.5 rounded-md">
                            <input
                                type="number"
                                value={localCanvasWidth}
                                onChange={handleCanvasWidthChange}
                                onBlur={handleCanvasWidthSubmit}
                                onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                                className="w-12 bg-transparent text-center font-mono outline-none"
                                aria-label="Canvas width in pixels"
                            />
                            <span className="ml-1">px</span>
                        </div>
                        <div className="flex items-center gap-1 bg-[var(--color-background)] p-0.5 rounded-md">
                           <button onClick={() => handleViewportSnap('desktop', 1280)} className={`px-2 py-0.5 rounded-md ${viewport === 'desktop' ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-[var(--color-surface)]'}`}>Desktop</button>
                           <button onClick={() => handleViewportSnap('tablet', 768)} className={`px-2 py-0.5 rounded-md ${viewport === 'tablet' ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-[var(--color-surface)]'}`}>Tablet</button>
                           <button onClick={() => handleViewportSnap('mobile', 375)} className={`px-2 py-0.5 rounded-md ${viewport === 'mobile' ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-[var(--color-surface)]'}`}>Mobile</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
