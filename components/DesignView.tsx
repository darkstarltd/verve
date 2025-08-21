
import React, { useState, useEffect, useCallback } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';

import { Element, MultiplayerCursor } from '../types';
import { findElementDeep, findElementPath, findParentElement } from '../lib/treeUtils';

import { useAppContext } from '../context/AppContext';
import { Sidebar } from './Sidebar';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { CodePreviewPanel } from './CodePreviewPanel';
import { ActivityBar } from './ActivityBar';
import { StatusBar } from './StatusBar';
import { TerminalPanel } from './TerminalPanel';
import { MeasurementGuides } from './MeasurementGuides';
import { useDragHandlers } from '../hooks/useDragHandlers';
import { ContextMenu } from './ContextMenu';

const Resizer: React.FC<{ onMouseDown: (e: React.MouseEvent) => void, vertical?: boolean, isDragging: boolean }> = ({ onMouseDown, vertical, isDragging }) => {
    return (
      <div
        onMouseDown={onMouseDown}
        className={`resizer ${vertical ? 'vertical' : 'horizontal'} ${isDragging ? 'is-dragging' : ''}`}
        aria-hidden="true"
      />
    );
};

export function DesignView({ openModal }: { openModal: (modal: string, context?: any) => void }) {
  const { state, dispatch, setSelectedElementId, setPreviewMode } = useAppContext();
  const { pages, activePageId, projectType, selectedElementId, customComponents, editingComponentId, theme, codeSnippets, hoveredElementId, altKeyPressed, multiplayerCursors, previewMode, panelLayout, panels } = state;
  
  const [resizingPanel, setResizingPanel] = useState<'left' | 'right' | 'bottom' | null>(null);
  
  useEffect(() => {
    if (projectType === 'web') {
      const root = document.documentElement;
      Object.entries(theme.variables).forEach(([name, value]) => root.style.setProperty(name, value));
      root.style.setProperty('--font-primary', theme.fonts.primary);
      root.style.setProperty('--font-body', theme.fonts.body);
    }
  }, [theme, projectType]);
    
  useEffect(() => {
    const primaryFont = theme.fonts.primary?.replace(/ /g, '+');
    const bodyFont = theme.fonts.body?.replace(/ /g, '+');
    if (!primaryFont || !bodyFont) return;
    
    const fontUrl = `https://fonts.googleapis.com/css2?family=${primaryFont}:wght@400;700&family=${bodyFont}:wght@400;500;600&display=swap`;

    let link = document.getElementById('google-fonts-link') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.id = 'google-fonts-link';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    if (link.href !== fontUrl) link.href = fontUrl;
  }, [theme.fonts]);

  const styleObjectToString = (styles: any): string => { 
    if (!styles) return '';
    return Object.entries(styles).map(([key, value]) => {
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `  ${kebabKey}: ${value};`;
    }).join('\n'); 
  }

  useEffect(() => {
    if (projectType !== 'web') return;
    const styleId = 'proverve-global-styles';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
    }
    const cssString = Object.entries(theme.globalClasses)
      .map(([className, styles]) => `.${className} {\n${styleObjectToString(styles as any)}\n}`)
      .join('\n');
    styleEl.innerHTML = cssString;
  }, [theme.globalClasses, projectType]);

  const [activeSidebarTab, setActiveSidebarTab] = useState<any>('explorer');

  const activePage = pages.find(p => p.id === activePageId) || pages[0];
  const editingComponent = editingComponentId ? customComponents.find(c => c.id === editingComponentId) : null;
  const rootElements = editingComponent ? [editingComponent.mainElement] : (activePage?.elements || []);
  
  const { sensors, handleDragStart, handleDragOver, handleDragEnd, draggedItemOverlay, dropIndicator } = useDragHandlers();

    const createResizeHandler = useCallback((panel: 'left' | 'right' | 'bottom') => (mouseDownEvent: React.MouseEvent) => {
        mouseDownEvent.preventDefault();
        setResizingPanel(panel);
        document.body.style.cursor = panel === 'bottom' ? 'ns-resize' : 'ew-resize';
        const startSize = panel === 'left' ? panelLayout.leftSize : panel === 'right' ? panelLayout.rightSize : panelLayout.bottomSize;
        const startPosition = panel === 'bottom' ? mouseDownEvent.clientY : mouseDownEvent.clientX;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const delta = panel === 'bottom' ? startPosition - moveEvent.clientY : moveEvent.clientX - startPosition;
            const newSize = panel === 'right' ? startSize - delta : startSize + delta;
            
            const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

            let sizeKey: 'leftSize' | 'rightSize' | 'bottomSize';
            let minSize: number, maxSize: number;

            if(panel === 'left') { sizeKey = 'leftSize'; minSize = 200; maxSize = 500; }
            else if (panel === 'right') { sizeKey = 'rightSize'; minSize = 250; maxSize = 600; }
            else { sizeKey = 'bottomSize'; minSize = 100; maxSize = window.innerHeight - 200; }
            
            dispatch({ type: 'SET_PANEL_LAYOUT', payload: { [sizeKey]: clamp(newSize, minSize, maxSize) }});
        };
        const handleMouseUp = () => {
            setResizingPanel(null);
            document.body.style.cursor = '';
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [dispatch, panelLayout]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Alt' && !altKeyPressed) dispatch({ type: 'SET_ALT_KEY_PRESSED', payload: true }); };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.key === 'Alt') dispatch({ type: 'SET_ALT_KEY_PRESSED', payload: false }); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [altKeyPressed, dispatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isModifier = isMac ? e.metaKey : e.ctrlKey;

      if (isModifier && e.key === 'd') { e.preventDefault(); if (selectedElementId) dispatch({ type: 'DUPLICATE_ELEMENT', payload: { elementId: selectedElementId }}); } 
      else if (isModifier && e.key === 'k') { e.preventDefault(); openModal('commandPalette'); } 
      else if (e.key === 'Escape' && previewMode) setPreviewMode(false);
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
            const target = e.target as HTMLElement;
            if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
                e.preventDefault();
                dispatch({ type: 'DELETE_ELEMENT', payload: { elementId: selectedElementId } });
            }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, dispatch, previewMode, setPreviewMode, openModal]);
  
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elementId: string } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault(); e.stopPropagation();
    setSelectedElementId(elementId);
    setContextMenu({ x: e.clientX, y: e.clientY, elementId });
  };
  
  const selectedElementPath = selectedElementId ? findElementPath(rootElements, selectedElementId) : [];
  const selectedElement = selectedElementPath.length > 0 ? selectedElementPath[selectedElementPath.length - 1] : null;
  const selectedElementParent = selectedElementId ? findParentElement(rootElements, selectedElementId) : null;
  const { element: hoveredElement } = hoveredElementId ? findElementDeep(rootElements, hoveredElementId) : { element: null };

  const renderBottomPanel = () => {
    if (panels.bottomActivePanel === 'terminal') return <TerminalPanel />;
    if (panels.bottomActivePanel === 'code') return <CodePreviewPanel />;
    return null;
  };

  return (
    <div className="flex flex-col h-full">
        <div className="flex flex-1 overflow-hidden">
            <ActivityBar activeTab={activeSidebarTab} onTabChange={setActiveSidebarTab} onAssetStudioClick={() => openModal('assetStudio')} />
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
                <div className="flex flex-1 overflow-hidden">
                    {!panels.leftCollapsed && (
                        <>
                            <div style={{ width: `${panelLayout.leftSize}px`}} className="flex-shrink-0 h-full">
                                <Sidebar activeTab={activeSidebarTab} onAddSnippet={() => openModal('importCode')} onEditSnippet={(s) => openModal('importCode', s)} onAiTheme={() => openModal('designSystem')} />
                            </div>
                            <Resizer onMouseDown={createResizeHandler('left')} isDragging={resizingPanel === 'left'} />
                        </>
                    )}
                    <main className="flex-1 flex flex-col overflow-hidden relative min-w-0">
                        <div className="flex-1 overflow-hidden relative">
                            <Canvas elements={rootElements} dropIndicator={dropIndicator} onContextMenu={handleContextMenu} mode={previewMode ? 'preview' : 'edit'} cursors={multiplayerCursors} />
                            {altKeyPressed && selectedElement && hoveredElement && <MeasurementGuides selectedElement={selectedElement} hoveredElement={hoveredElement} />}
                        </div>
                        {panels.bottomActivePanel && <Resizer onMouseDown={createResizeHandler('bottom')} vertical isDragging={resizingPanel === 'bottom'} />}
                        {panels.bottomActivePanel && (
                            <div style={{ height: `${panelLayout.bottomSize}px`}} className="flex-shrink-0">
                                {renderBottomPanel()}
                            </div>
                        )}
                    </main>
                    {!panels.rightCollapsed && (
                        <>
                            <Resizer onMouseDown={createResizeHandler('right')} isDragging={resizingPanel === 'right'} />
                            <div style={{ width: `${panelLayout.rightSize}px`}} className="flex-shrink-0 h-full overflow-y-auto">
                                <PropertiesPanel parentElement={selectedElementParent as Element | null} onAiRefine={() => openModal('aiRefine')} onAiInteraction={() => openModal('aiInteraction')} />
                            </div>
                        </>
                    )}
                </div>
                <DragOverlay>{draggedItemOverlay}</DragOverlay>
            </DndContext>
        </div>
        <StatusBar selectedElementPath={selectedElementPath as Element[]} />
        {contextMenu && (
            <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)} elementId={contextMenu.elementId}
            onCreateComponent={() => {
                const { element: elementToComponent } = findElementDeep(rootElements, contextMenu.elementId);
                if (elementToComponent) openModal('createComponent', elementToComponent);
            }}
            />
        )}
    </div>
  );
}
