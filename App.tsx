
import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { AppContextProvider, useAppContext } from './context/AppContext';
import { ProjectType, Element, CodeSnippet, Asset, DeepPartial, ElementTemplate, ActionStep, PageTemplate, ThemeState } from './types';
import { CinematicEntry } from './components/CinematicEntry';
import { NewProjectModal } from './components/NewProjectModal';
import { Header } from './components/Header';
import { DesignView } from './components/DesignView';
import { IDEView } from './components/IDEView';
import { LogicView } from './components/logic/LogicView';
import { ShareModal } from './components/ShareModal';
import { SettingsModal } from './components/SettingsModal';
import { CodeExportModal } from './components/CodeExportModal';
import { AiGenerateModal } from './components/AiGenerateModal';
import { AiRefineModal } from './components/AiRefineModal';
import { CreateComponentModal } from './components/CreateComponentModal';
import { ImportCodeModal } from './components/ImportCodeModal';
import { AssetStudioModal } from './components/AssetStudioModal';
import { CommandPalette } from './components/CommandPalette';
import { DesignSystemPanel } from './components/DesignSystemPanel';
import { AiInteractionModal } from './components/AiInteractionModal';
import { generateWebsiteFromPrompt, generateLayoutFromImage, generateLayoutFromUrl, generateMultiPageWebsiteFromPrompt, refineElementFromPrompt, generateInteractionsFromPrompt, generateCodeFromPrompt, generateDesignSystemFromPrompt } from './lib/ai';
import { createDefaultElement } from './constants';
import { findElementDeep } from './lib/treeUtils';
import { v4 as uuidv4 } from 'uuid';
import { DevTools } from './components/DevTools';

function AppContent() {
  const { state, dispatch, undo, redo, canUndo, canRedo, setSelectedElementId, updateElement } = useAppContext();
  const { projectName, appMode, pages, activePageId, projectType, theme, selectedElementId, editingComponentId, customComponents } = state;

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalContext, setModalContext] = useState<any>(null);

  const openModal = (modalName: string, context: any = null) => {
    setActiveModal(modalName);
    setModalContext(context);
  };
  const closeModal = () => {
    setActiveModal(null);
    setModalContext(null);
  };
  
  const activePage = pages.find(p => p.id === activePageId) || pages[0];
  const editingComponent = editingComponentId ? customComponents.find(c => c.id === editingComponentId) : null;
  const rootElements = editingComponent ? [editingComponent.mainElement] : (activePage?.elements || []);

  const handleAiGeneration = async (prompt: string, image?: string, url?: string, businessBrief?: boolean) => {
    try {
      const mutableTheme: ThemeState = JSON.parse(JSON.stringify(theme));
      if (businessBrief) {
        const pages: PageTemplate[] = await generateMultiPageWebsiteFromPrompt(prompt, projectType, mutableTheme);
        dispatch({ type: 'SET_PROJECT_PAGES', payload: { pages } });
      } else {
        let generatedElements: ElementTemplate[];
        if (url) generatedElements = await generateLayoutFromUrl(url, projectType, mutableTheme);
        else if (image) generatedElements = await generateLayoutFromImage(prompt, image, projectType, mutableTheme);
        else generatedElements = await generateWebsiteFromPrompt(prompt, projectType, mutableTheme);
        const newElementsWithIds = generatedElements.map(createDefaultElement);
        dispatch({ type: 'SET_ELEMENTS', payload: newElementsWithIds });
      }
      closeModal();
      setSelectedElementId(null);
    } catch (error) { throw error; }
  };
  
  const handleDesignSystemGeneration = async (prompt: string) => {
    try {
        const generatedTheme: Partial<ThemeState> = await generateDesignSystemFromPrompt(prompt);
        dispatch({ type: 'UPDATE_THEME', payload: generatedTheme });
        closeModal();
    } catch (error) { throw error; }
  };
  
  const handleAiRefinement = async (prompt: string) => {
    if (!selectedElementId) return;
    const { element } = findElementDeep(rootElements, selectedElementId);
    if (!element) return;
    try {
      const updates: DeepPartial<Element> = await refineElementFromPrompt(prompt, element as Element, projectType);
      updateElement(element.id, updates);
      closeModal();
    } catch (error) { throw error; }
  };
  
  const handleAiInteractionGeneration = async (prompt: string): Promise<ActionStep[]> => {
    if (!activePage) throw new Error("No active page");
    try {
      const stateContext = {
        stateVars: activePage.stateDefinition,
        modals: [], 
        pages: pages.map(p => ({ id: p.id, name: p.name }))
      };
      const interactions = await generateInteractionsFromPrompt(prompt, stateContext);
      updateElement(selectedElementId!, { interactions: interactions as any });
      closeModal();
      return interactions;
    } catch (e) { throw e; }
  };
  
  const handleAiCodeGeneration = async (prompt: string, language: string): Promise<string> => {
    try { return await generateCodeFromPrompt(prompt, language); }
    catch (error) { throw error; }
  };

  const handleCreateComponent = (name: string) => {
      if (modalContext) {
          dispatch({ type: 'CREATE_COMPONENT', payload: { name, element: modalContext as Element } });
          toast.success(`Component "${name}" created!`);
          closeModal();
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
    closeModal();
  };
  
  const handleAddAsset = (asset: Omit<Asset, 'id'>) => {
    dispatch({ type: 'ADD_ASSET', payload: { ...asset, id: uuidv4() } });
  }

  const renderActiveView = () => {
    switch (appMode) {
      case 'design': return <DesignView openModal={openModal} />;
      case 'logic': return <LogicView />;
      case 'code': return <IDEView />;
      case 'devtools': return <DevTools />;
      default: return <DesignView openModal={openModal} />;
    }
  };

  const renderModal = () => {
    switch (activeModal) {
      case 'share': return <ShareModal onClose={closeModal} />;
      case 'settings': return <SettingsModal onClose={closeModal} />;
      case 'export': return <CodeExportModal onClose={closeModal} />;
      case 'aiGenerate': return <AiGenerateModal onClose={closeModal} onGenerate={handleAiGeneration} />;
      case 'aiRefine': return <AiRefineModal onClose={closeModal} onGenerate={handleAiRefinement} />;
      case 'aiInteraction': return <AiInteractionModal onClose={closeModal} onGenerate={handleAiInteractionGeneration} />;
      case 'createComponent': return <CreateComponentModal onClose={closeModal} onCreate={handleCreateComponent}/>;
      case 'importCode': return <ImportCodeModal onClose={closeModal} onSave={handleSaveSnippet} editingSnippet={modalContext} onAiGenerate={handleAiCodeGeneration} />;
      case 'assetStudio': return <AssetStudioModal onClose={closeModal} onAddAsset={handleAddAsset} />;
      case 'designSystem': return <DesignSystemPanel onGenerate={handleDesignSystemGeneration} onClose={closeModal} />;
      case 'commandPalette': return <CommandPalette onClose={closeModal} onExport={() => openModal('export')} onAiGenerate={() => openModal('aiGenerate')} onImportCode={() => openModal('importCode')} />;
      default: return null;
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <Header
        projectName={projectName}
        undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo}
        appMode={appMode}
        onModeChange={(mode) => dispatch({ type: 'SET_APP_MODE', payload: mode })}
        onShareClick={() => openModal('share')}
        onSettingsClick={() => openModal('settings')}
      />
      <main className="flex-1 overflow-hidden">
        {renderActiveView()}
      </main>
      <Toaster position="bottom-center" toastOptions={{ style: { background: 'var(--color-surface-light)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' } }} />
      {renderModal()}
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