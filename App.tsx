
import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, DragOverEvent, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { v4 as uuidv4 } from 'uuid';
import { Toaster, toast } from 'react-hot-toast';
import tippy from 'tippy.js';

import { Element, ProjectType, CustomComponent, ThemeState, CodeSnippet, Style, Asset } from './types';
import { WEB_COMPONENT_LIBRARY, NATIVE_COMPONENT_LIBRARY, FLUTTER_COMPONENT_LIBRARY, KOTLIN_COMPONENT_LIBRARY, createDefaultElement } from './constants';
import { generateWebsiteFromPrompt, generateThemeFromPrompt, Theme, generateLayoutFromImage } from './lib/ai';
import { findElementDeep } from './lib/treeUtils';

import { AppContextProvider, useAppContext } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { CinematicEntry } from './components/CinematicEntry';
import { RenderElement } from './components/RenderElement';
import { CodeExportModal } from './components/CodeExportModal';
import { CodePreviewPanel } from './components/CodePreviewPanel';
import { AiGenerateModal } from './components/AiGenerateModal';
import { AiThemeModal } from './components/AiThemeModal';
import { ContextMenu } from './components/ContextMenu';
import { CreateComponentModal } from './components/CreateComponentModal';
import { ImportCodeModal } from './components/ImportCodeModal';
import { ActivityBar, ActivityBarTab } from './components/ActivityBar';
import { StatusBar } from './components/StatusBar';
import { AssetStudioModal } from './components/AssetStudioModal';
import { TerminalPanel } from './components/TerminalPanel';
import { CommandPalette } from './components/CommandPalette';
import { NewProjectModal } from './components/NewProjectModal';
import { DevTools } from './components/DevTools';


function styleObjectToString(styles: Style): string { 
    if (!styles) return '';
    return Object.entries(styles).map(([key, value]) => {
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `  ${kebabKey}: ${value};`;
    }).join('\n'); 
}

function AppContent() {
  const { state, dispatch, setSelectedElementId, undo, redo, canUndo, canRedo } = useAppContext();
  const { pages, activePageId, projectType, selectedElementId, customComponents, editingComponentId, theme, projectName } = state;
  
  useEffect(() => {
    tippy('[data-tippy-content]', {
        theme: 'proverve',
        animation: 'shift-away-subtle',
    });
  }, []);
  
  useEffect(() => {
    if (projectType === 'web') {
      const root = document.documentElement;
      for (const [key, value] of Object.entries(theme.variables)) {
        root.style.setProperty(key, value);
      }
    }
  }, [theme.variables, projectType]);

  // Effect for injecting global CSS classes for live preview
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
      .map(([className, styles]) => `.${className} {\n${styleObjectToString(styles)}\n}`)
      .join('\n');
    styleEl.innerHTML = cssString;
  }, [theme.globalClasses, projectType]);

  const getActivePage = () => pages.find(p => p.id === activePageId) || pages[0];

  const [activeId, setActiveId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showCodePreview, setShowCodePreview] = useState(false);
  const [codePanelHeight, setCodePanelHeight] = useState(250);
  const [dropIndicator, setDropIndicator] = useState<{ parentId: string | null; index: number } | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elementId: string } | null>(null);
  const [showCreateComponentModal, setShowCreateComponentModal] = useState<Element | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<CodeSnippet | null>(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState<ActivityBarTab>('explorer');
  const [showAssetStudio, setShowAssetStudio] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  
  const activePage = getActivePage();
  const editingComponent = editingComponentId ? customComponents.find(c => c.id === editingComponentId) : null;
  
  const elementTree = editingComponent ? [editingComponent.mainElement] : (activePage?.elements || []);
  const rootElements = editingComponent ? [editingComponent.mainElement] : (activePage?.elements || []);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isModifier = isMac ? e.metaKey : e.ctrlKey;

      if (isModifier && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (isModifier && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        redo();
      } else if (isModifier && e.key === 'd') {
        e.preventDefault();
        if (selectedElementId) dispatch({ type: 'DUPLICATE_ELEMENT', payload: { elementId: selectedElementId }});
      } else if (isModifier && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(v => !v);
      } else if (e.key === 'Escape') {
          if (showCommandPalette) setShowCommandPalette(false);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
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
  }, [selectedElementId, dispatch, showCommandPalette, undo, redo]);
  
  const BASE_COMPONENT_LIBRARY = (() => {
    switch (projectType) {
        case 'native': return NATIVE_COMPONENT_LIBRARY;
        case 'flutter': return FLUTTER_COMPONENT_LIBRARY;
        case 'kotlin': return KOTLIN_COMPONENT_LIBRARY;
        case 'web': default: return WEB_COMPONENT_LIBRARY;
    }
  })();

  const CUSTOM_COMPONENT_DEFINITIONS: CustomComponent[] = customComponents.map(c => ({...c}));

  const sensors = useSensors(
    useSensor(MouseSensor), useSensor(TouchSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);
  
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) { setDropIndicator(null); return; }
    const overId = over.id as string;
    
    if (overId === 'canvas-droppable-area') { setDropIndicator({ parentId: null, index: elementTree.length }); return; }
    const { element: overElement, parent } = findElementDeep(elementTree, overId);
    if (!overElement) { setDropIndicator(null); return; }

    const isContainer = overElement.children !== undefined;
    if (isContainer) {
      setDropIndicator({ parentId: overId, index: overElement.children!.length });
    } else {
        const siblings = parent?.children || elementTree;
        const index = siblings.findIndex(e => e.id === overId);
        setDropIndicator({ parentId: parent?.id || null, index });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { over, active } = event;
    if (!over || !dropIndicator) { setDropIndicator(null); return; }
    const activeId = active.id as string;

    if (activeId.startsWith('component-')) {
      const type = active.data.current?.type;
      const component = BASE_COMPONENT_LIBRARY.find(c => c.type === type);
      if (component) {
        const newElement = createDefaultElement(component.defaultElement);
        dispatch({ type: 'ADD_ELEMENT', payload: { parentId: dropIndicator.parentId, index: dropIndicator.index, element: newElement } });
      }
    } else if (activeId.startsWith('custom-component-')) {
        const componentId = active.data.current?.componentId;
        const customComponent = CUSTOM_COMPONENT_DEFINITIONS.find(c => c.id === componentId);
        if (customComponent) {
            const newElement: Element = {
                id: uuidv4(),
                type: 'component-instance',
                name: customComponent.name,
                componentId: customComponent.id,
                styles: { desktop: {} },
                props: {},
            };
            dispatch({ type: 'ADD_ELEMENT', payload: { parentId: dropIndicator.parentId, index: dropIndicator.index, element: newElement } });
        }
    } else if (activeId !== over.id) {
      dispatch({ type: 'MOVE_ELEMENT', payload: { activeId, targetParentId: dropIndicator.parentId, targetIndex: dropIndicator.index } });
    }
    setDropIndicator(null);
  };
  
  const handleAiGeneration = async (prompt: string, image?: string) => {
    try {
      const generatedElements = image
        ? await generateLayoutFromImage(prompt, image, projectType)
        : await generateWebsiteFromPrompt(prompt, projectType);
        
      const newElementsWithIds = generatedElements.map(el => createDefaultElement(el as Omit<Element, 'id'>));
      dispatch({ type: 'SET_ELEMENTS', payload: newElementsWithIds });
      setShowAiModal(false);
      setSelectedElementId(null);
      toast.success('Layout generated successfully!');
    } catch (error) {
      console.error("AI generation failed:", error);
      toast.error('AI generation failed. Please try again.');
      throw error;
    }
  };

  const handleThemeGeneration = async (prompt: string) => {
    try {
        const generatedTheme: Theme = await generateThemeFromPrompt(prompt, projectType);
        const newThemeState: ThemeState = {
            ...state.theme,
            variables: generatedTheme.variables || state.theme.variables,
            baseStyles: generatedTheme.baseStyles
        };
        dispatch({ type: 'UPDATE_THEME', payload: newThemeState });
        if (projectType === 'web' && newThemeState.baseStyles) {
            dispatch({ type: 'APPLY_THEME', payload: newThemeState.baseStyles });
        }
        toast.success('AI theme applied!');
    } catch (error) {
      console.error("AI theme generation failed:", error);
      toast.error('AI theme generation failed. Please try again.');
      throw error;
    }
  };

  const handleContextMenu = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault(); e.stopPropagation();
    setSelectedElementId(elementId);
    setContextMenu({ x: e.clientX, y: e.clientY, elementId });
  };
  
  const closeContextMenu = () => setContextMenu(null);

  const handleCreateComponent = (name: string) => {
      if (showCreateComponentModal) {
          dispatch({ type: 'CREATE_COMPONENT', payload: { name, element: showCreateComponentModal } });
          setShowCreateComponentModal(null);
          toast.success(`Component "${name}" created!`);
      }
  };

  const handleSaveSnippet = (snippetData: Omit<CodeSnippet, 'id'> & { id?: string }) => {
    if (snippetData.id) {
        dispatch({ type: 'UPDATE_CODE_SNIPPET', payload: snippetData as CodeSnippet });
        toast.success(`Snippet "${snippetData.name}" updated!`);
    } else {
        dispatch({ type: 'ADD_CODE_SNIPPET', payload: { ...snippetData, id: uuidv4() } });
        toast.success(`Snippet "${snippetData.name}" created!`);
    }
    setShowImportModal(false);
    setEditingSnippet(null);
  };

  const handleAddSnippet = () => {
    setEditingSnippet(null);
    setShowImportModal(true);
  };

  const handleEditSnippet = (snippet: CodeSnippet) => {
      setEditingSnippet(snippet);
      setShowImportModal(true);
  };
  
  const handleAddAsset = (asset: Omit<Asset, 'id'>) => {
    dispatch({ type: 'ADD_ASSET', payload: { ...asset, id: uuidv4() } });
  }

  const { element: activeElement } = activeId ? findElementDeep(rootElements, activeId) : { element: null };
  const draggedComponent = activeId && activeId.startsWith('component-')
    ? BASE_COMPONENT_LIBRARY.find(c => `component-${c.type}` === activeId)
    : null;
   const draggedCustomComponent = activeId && activeId.startsWith('custom-component-')
    ? CUSTOM_COMPONENT_DEFINITIONS.find(c => `custom-component-${c.id}` === activeId)
    : null;

  return (
    <div className="flex flex-col h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <Header
        projectName={projectName}
        onExport={() => setIsExporting(true)}
        onAiGenerate={() => setShowAiModal(true)}
        onCommandPalette={() => setShowCommandPalette(true)}
        undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo}
      />
      <div className="flex flex-1 overflow-hidden">
        <ActivityBar activeTab={activeSidebarTab} onTabChange={setActiveSidebarTab} onAssetStudioClick={() => setShowAssetStudio(true)} />
        {activeSidebarTab === 'devtools' ? (
          <DevTools />
        ) : (
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
            <Sidebar activeTab={activeSidebarTab} onAddSnippet={handleAddSnippet} onEditSnippet={handleEditSnippet}/>
            <main className="flex-1 flex flex-col">
              <Canvas elements={rootElements} dropIndicator={dropIndicator} onContextMenu={handleContextMenu} />
              {showTerminal && <TerminalPanel />}
            </main>
            <PropertiesPanel />
            <DragOverlay>
              {activeId && (draggedComponent ? (
                <div className="p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg flex items-center gap-2">
                    {draggedComponent.icon} <span>{draggedComponent.name}</span>
                </div>
              ) : draggedCustomComponent ? (
                  <div className="p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg flex items-center gap-2">
                    <span>{draggedCustomComponent.name}</span>
                </div>
              ) : activeElement ? (<RenderElement element={activeElement} isSelected={false} isDragOverlay onContextMenu={()=>{}}/>) : null)}
            </DragOverlay>
          </DndContext>
        )}
      </div>
      <StatusBar onToggleTerminal={() => setShowTerminal(!showTerminal)} isTerminalVisible={showTerminal} />
      {showCommandPalette && <CommandPalette onClose={() => setShowCommandPalette(false)} onExport={() => setIsExporting(true)} onAiGenerate={() => setShowAiModal(true)} onImportCode={handleAddSnippet} />}
      {showAiModal && <AiGenerateModal onClose={() => setShowAiModal(false)} onGenerate={handleAiGeneration} />}
      {showThemeModal && <AiThemeModal onClose={() => setShowThemeModal(false)} onGenerate={handleThemeGeneration} />}
      {isExporting && <CodeExportModal onClose={() => setIsExporting(false)} />}
      {showImportModal && <ImportCodeModal onClose={() => setShowImportModal(false)} onSave={handleSaveSnippet} editingSnippet={editingSnippet} />}
      {showAssetStudio && <AssetStudioModal onClose={() => setShowAssetStudio(false)} onAddAsset={handleAddAsset} />}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu}
          elementId={contextMenu.elementId}
          onCreateComponent={() => {
              const { element: elementToComponent } = findElementDeep(rootElements, contextMenu.elementId);
              if (elementToComponent) setShowCreateComponentModal(elementToComponent);
          }}
        />
      )}
       {showCreateComponentModal && <CreateComponentModal onClose={() => setShowCreateComponentModal(null)} onCreate={handleCreateComponent}/>}
       <Toaster position="bottom-center" toastOptions={{ style: { background: 'var(--color-surface-light)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' } }} />
    </div>
  );
}

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [projectSettings, setProjectSettings] = useState<{name: string, type: ProjectType} | null>(() => {
    const saved = localStorage.getItem('proverve-state');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.projectName && parsed.projectType) {
                return { name: parsed.projectName, type: parsed.projectType };
            }
        } catch (e) {
            console.error("Failed to parse saved project settings:", e);
            localStorage.removeItem('proverve-state'); // Clear corrupted data
            return null;
        }
    }
    return null;
  });

  if (!appReady) {
    return <CinematicEntry onComplete={() => setAppReady(true)} />;
  }

  if (!projectSettings) {
    return <NewProjectModal onProjectCreate={setProjectSettings} />;
  }
  
  return (
    <AppContextProvider initialProjectSettings={projectSettings}>
        <AppContent />
    </AppContextProvider>
  );
}