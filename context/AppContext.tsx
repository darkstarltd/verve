import React, { createContext, useContext, useReducer, useEffect, ReactNode, Dispatch } from 'react';
import { Page, Element, Viewport, Style, ProjectType, AppState, CustomComponent, Asset, PresentState, DeepPartial, ThemeState, PropDefinition, CodeSnippet, StateVariable, ActionStep, ApiDataSource } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { produce, Draft } from 'immer';
import { renderToStaticMarkup } from 'react-dom/server';
import { ComponentIcon } from '../components/icons';
import { findElementDeep, findParentElement, removeElement, insertElementAtIndex, duplicateElement, assignNewIdsToTree } from '../lib/treeUtils';


type Action =
  | { type: 'SET_PROJECT_TYPE'; payload: ProjectType }
  | { type: 'ADD_PAGE'; payload: { name: string } }
  | { type: 'DELETE_PAGE'; payload: string }
  | { type: 'DUPLICATE_PAGE'; payload: string }
  | { type: 'UPDATE_PAGE_NAME'; payload: { id: string, name: string } }
  | { type: 'SET_ACTIVE_PAGE'; payload: string | null }
  | { type: 'SET_ELEMENTS'; payload: Element[] }
  | { type: 'ADD_ELEMENT', payload: { parentId: string | null; index: number; element: Element }}
  | { type: 'DELETE_ELEMENT', payload: { elementId: string } }
  | { type: 'DUPLICATE_ELEMENT', payload: { elementId: string } }
  | { type: 'MOVE_ELEMENT', payload: { activeId: string, targetParentId: string | null, targetIndex: number }}
  | { type: 'UPDATE_ELEMENT'; payload: { id: string, updates: DeepPartial<Element> } }
  | { type: 'APPLY_THEME', payload: { [elementType: string]: Style }}
  | { type: 'UPDATE_THEME', payload: ThemeState }
  | { type: 'ADD_GLOBAL_CLASS', payload: { className: string, styles: Style } }
  | { type: 'UPDATE_GLOBAL_CLASS', payload: { className: string, styles: Style } }
  | { type: 'DELETE_GLOBAL_CLASS', payload: { className: string } }
  | { type: 'FIND_PARENT', payload: { elementId: string, callback: (parent: Element | null) => void }}
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_SELECTED_ELEMENT_ID'; payload: string | null }
  | { type: 'SET_EDITING_COMPONENT_ID', payload: string | null }
  | { type: 'SET_VIEWPORT'; payload: Viewport }
  | { type: 'SET_CANVAS_WIDTH'; payload: number }
  | { type: 'SHOW_MODAL', payload: string }
  | { type: 'HIDE_MODAL', payload: string }
  | { type: 'TOGGLE_MODAL', payload: string }
  | { type: 'SET_PAGE_DATA_STATE'; payload: { sourceName: string, data: any } }
  | { type: 'ADD_API_DATA_SOURCE'; payload: ApiDataSource }
  | { type: 'UPDATE_API_DATA_SOURCE'; payload: ApiDataSource }
  | { type: 'DELETE_API_DATA_SOURCE'; payload: string }
  | { type: 'SET_ELEMENT_DATA_SOURCE'; payload: { elementId: string, dataSource: Element['dataSource'] }}
  | { type: 'CREATE_COMPONENT', payload: { name: string, element: Element }}
  | { type: 'UPDATE_COMPONENT_DEFINITION', payload: { componentId: string, updates: Partial<Pick<CustomComponent, 'propsDefinition' | 'defaultData'>> } }
  | { type: 'ADD_ASSET', payload: Asset }
  | { type: 'DELETE_ASSET', payload: string }
  | { type: 'ADD_CODE_SNIPPET', payload: CodeSnippet }
  | { type: 'UPDATE_CODE_SNIPPET', payload: CodeSnippet }
  | { type: 'DELETE_CODE_SNIPPET', payload: string }
  // New State & Action Types
  | { type: 'DEFINE_STATE_VARIABLE'; payload: { variable: StateVariable, index?: number } }
  | { type: 'DELETE_STATE_VARIABLE'; payload: { name: string } }
  | { type: 'EXECUTE_ACTIONS'; payload: { actions: ActionStep[] } }
  | { type: 'INITIALIZE_RUNTIME_STATE'; payload: { pageId: string | null } };

const defaultTheme: ThemeState = {
    variables: {
        '--color-background': '#0D0F1A',
        '--color-surface': '#1A1C2C',
        '--color-primary': '#8A42F4',
        '--color-primary-contrast': '#ffffff',
        '--color-text-primary': '#E0E0FF',
        '--color-text-secondary': '#A0A0C0',
    },
    baseStyles: {
        heading: { color: 'var(--color-text-primary)' },
        text: { color: 'var(--color-text-secondary)' },
    },
    globalClasses: {}
};

const createHistorySnapshot = (draft: Draft<AppState>): PresentState => {
    const { history, runtimeState, visibleModalIds, ...presentData } = draft;
    return JSON.parse(JSON.stringify(presentData));
};

const restoreFromSnapshot = (draft: Draft<AppState>, snapshot: PresentState) => {
    const mutableSnapshot = JSON.parse(JSON.stringify(snapshot));
    const { projectName, projectType, pages, customComponents, assets, codeSnippets, activePageId, selectedElementId, editingComponentId, viewport, theme, canvasWidth } = mutableSnapshot;
    draft.projectName = projectName;
    draft.projectType = projectType;
    draft.pages = pages;
    draft.customComponents = customComponents;
    draft.assets = assets;
    draft.codeSnippets = codeSnippets;
    draft.activePageId = activePageId;
    draft.selectedElementId = selectedElementId;
    draft.editingComponentId = editingComponentId;
    draft.viewport = viewport;
    draft.theme = theme;
    draft.canvasWidth = canvasWidth;
};

const appReducer = produce((draft: Draft<AppState>, action: Action): void => {
    const nonUndoableActions: Action['type'][] = [
        'UNDO', 'REDO', 'FIND_PARENT', 'SET_ACTIVE_PAGE', 'SET_SELECTED_ELEMENT_ID',
        'SET_EDITING_COMPONENT_ID', 'SET_VIEWPORT', 'SET_CANVAS_WIDTH', 'SHOW_MODAL', 'HIDE_MODAL', 'TOGGLE_MODAL',
        'EXECUTE_ACTIONS', 'INITIALIZE_RUNTIME_STATE', 'SET_PAGE_DATA_STATE'
    ];

    if (!nonUndoableActions.includes(action.type)) {
        const currentPresent = createHistorySnapshot(draft);
        draft.history.past.push(currentPresent);
        draft.history.future = [];
        if (draft.history.past.length > 50) {
            draft.history.past.shift();
        }
    }
    
    const findActivePage = (d: Draft<AppState>) => d.pages.find(p => p.id === d.activePageId);
    const getElementTree = (d: Draft<AppState>) => {
        const editingComponent = d.editingComponentId ? d.customComponents.find(c => c.id === d.editingComponentId) : null;
        return editingComponent ? [editingComponent.mainElement] : findActivePage(d)?.elements || [];
    };
    const setElementTree = (d: Draft<AppState>, tree: Element[]) => {
        const editingComponent = d.editingComponentId ? d.customComponents.find(c => c.id === d.editingComponentId) : null;
        if (editingComponent) {
            editingComponent.mainElement = tree[0];
        } else {
            const page = findActivePage(d);
            if (page) page.elements = tree;
        }
    };

    switch (action.type) {
        case 'SET_PROJECT_TYPE': draft.projectType = action.payload; break;
        case 'ADD_PAGE': {
            const newPage: Page = { id: uuidv4(), name: action.payload.name, elements: [], dataState: {}, apiDataSources: [], stateDefinition: [] };
            draft.pages.push(newPage); 
            draft.activePageId = newPage.id;
            break;
        }
        case 'DELETE_PAGE': {
            const pageIdToDelete = action.payload;
            const pageIndex = draft.pages.findIndex(p => p.id === pageIdToDelete);
            if (pageIndex === -1) break;
            draft.pages.splice(pageIndex, 1);
            if (draft.activePageId === pageIdToDelete) {
                draft.activePageId = draft.pages[Math.max(0, pageIndex - 1)]?.id || null;
            }
            if (draft.pages.length === 0) {
                 const newPage: Page = { id: uuidv4(), name: 'Home', elements: [], dataState: {}, apiDataSources: [], stateDefinition: [] };
                 draft.pages.push(newPage); 
                 draft.activePageId = newPage.id;
            }
            break;
        }
        case 'DUPLICATE_PAGE': {
            const pageToDuplicate = draft.pages.find(p => p.id === action.payload);
            if(pageToDuplicate) {
                const newPage: Page = {
                    ...JSON.parse(JSON.stringify(pageToDuplicate)),
                    id: uuidv4(),
                    name: `${pageToDuplicate.name} Copy`,
                    elements: pageToDuplicate.elements.map(assignNewIdsToTree)
                };
                draft.pages.push(newPage);
                draft.activePageId = newPage.id;
            }
            break;
        }
        case 'UPDATE_PAGE_NAME': {
            const page = draft.pages.find(p => p.id === action.payload.id);
            if(page) page.name = action.payload.name;
            break;
        }
        case 'SET_ACTIVE_PAGE': draft.activePageId = action.payload; draft.selectedElementId = null; draft.visibleModalIds = []; break;
        case 'SET_ELEMENTS': {
            const page = findActivePage(draft);
            if (page) page.elements = action.payload;
            break;
        }
        case 'ADD_ELEMENT': {
            const elementTree = getElementTree(draft);
            const newTree = insertElementAtIndex(elementTree, action.payload.parentId, action.payload.index, action.payload.element);
            setElementTree(draft, newTree);
            break;
        }
        case 'DELETE_ELEMENT': {
            if (draft.selectedElementId === action.payload.elementId) draft.selectedElementId = null;
            const elementTree = getElementTree(draft);
            const newTree = removeElement(elementTree, action.payload.elementId);
            setElementTree(draft, newTree);
            break;
        }
        case 'DUPLICATE_ELEMENT': {
           const elementTree = getElementTree(draft);
           const { element, parent, index } = findElementDeep(elementTree, action.payload.elementId);
           if (!element) break;
           const newElement = duplicateElement(element);
           const targetArray = parent ? parent.children! : elementTree;
           targetArray.splice(index + 1, 0, newElement);
           setElementTree(draft, elementTree);
           break;
        }
        case 'MOVE_ELEMENT': {
           const elementTree = getElementTree(draft);
           const { element } = findElementDeep(elementTree, action.payload.activeId);
           if (!element) break;
           const elementsWithout = removeElement(elementTree, action.payload.activeId);
           const newTree = insertElementAtIndex(elementsWithout, action.payload.targetParentId, action.payload.targetIndex, element);
           setElementTree(draft, newTree);
           break;
        }
        case 'UPDATE_ELEMENT': {
            const elementTree = getElementTree(draft);
            const { element } = findElementDeep(elementTree, action.payload.id);
            if (element) {
                const deepMerge = (target: any, source: any) => {
                    for (const key in source) {
                        if (source[key] instanceof Object && key in target) Object.assign(source[key], deepMerge(target[key], source[key]));
                    }
                    Object.assign(target || {}, source);
                };
                deepMerge(element, action.payload.updates);
            }
            break;
        }
        case 'APPLY_THEME': {
            const elementTree = getElementTree(draft);
            const applyStyles = (elements: Element[]) => {
                elements.forEach(el => {
                    if(action.payload[el.type]) el.styles.desktop = { ...el.styles.desktop, ...action.payload[el.type] };
                    if(el.children) applyStyles(el.children);
                });
            }
            applyStyles(elementTree);
            setElementTree(draft, elementTree);
            break;
        }
        case 'UPDATE_THEME': draft.theme = action.payload; break;
        case 'ADD_GLOBAL_CLASS': draft.theme.globalClasses[action.payload.className] = action.payload.styles; break;
        case 'UPDATE_GLOBAL_CLASS': draft.theme.globalClasses[action.payload.className] = action.payload.styles; break;
        case 'DELETE_GLOBAL_CLASS': delete draft.theme.globalClasses[action.payload.className]; break;
        case 'FIND_PARENT': {
            const elementTree = getElementTree(draft);
            action.payload.callback(findParentElement(elementTree, action.payload.elementId));
            break;
        }
        case 'UNDO': {
            if (draft.history.past.length === 0) break;
            const snapshot = createHistorySnapshot(draft);
            draft.history.future.unshift(snapshot);
            const stateToRestore = draft.history.past.pop()!;
            restoreFromSnapshot(draft, stateToRestore);
            break;
        }
        case 'REDO': {
            if (draft.history.future.length === 0) break;
            const snapshot = createHistorySnapshot(draft);
            draft.history.past.push(snapshot);
            const stateToRestore = draft.history.future.shift()!;
            restoreFromSnapshot(draft, stateToRestore);
            break;
        }
        case 'SET_SELECTED_ELEMENT_ID': draft.selectedElementId = action.payload; break;
        case 'SET_EDITING_COMPONENT_ID': draft.editingComponentId = action.payload; draft.selectedElementId = null; break;
        case 'SET_VIEWPORT': draft.viewport = action.payload; break;
        case 'SET_CANVAS_WIDTH': draft.canvasWidth = action.payload; break;
        case 'SHOW_MODAL': if (!draft.visibleModalIds.includes(action.payload)) draft.visibleModalIds.push(action.payload); break;
        case 'HIDE_MODAL': draft.visibleModalIds = draft.visibleModalIds.filter(id => id !== action.payload); break;
        case 'TOGGLE_MODAL': {
             const index = draft.visibleModalIds.indexOf(action.payload);
             if (index > -1) draft.visibleModalIds.splice(index, 1);
             else draft.visibleModalIds.push(action.payload);
             break;
        }
        case 'SET_PAGE_DATA_STATE': { 
            const page = findActivePage(draft); 
            if (page) {
                page.dataState[action.payload.sourceName] = action.payload.data;
            }
            break; 
        }
        case 'ADD_API_DATA_SOURCE': {
            const page = findActivePage(draft);
            if (page) page.apiDataSources.push(action.payload);
            break;
        }
        case 'UPDATE_API_DATA_SOURCE': {
            const page = findActivePage(draft);
            if (page) {
                const index = page.apiDataSources.findIndex(ds => ds.id === action.payload.id);
                if (index !== -1) page.apiDataSources[index] = action.payload;
            }
            break;
        }
        case 'DELETE_API_DATA_SOURCE': {
            const page = findActivePage(draft);
            if (page) {
                page.apiDataSources = page.apiDataSources.filter(ds => ds.id !== action.payload);
            }
            break;
        }
        case 'CREATE_COMPONENT': {
            const newComponent: CustomComponent = {
                id: uuidv4(), name: action.payload.name, icon: renderToStaticMarkup(<ComponentIcon />),
                mainElement: assignNewIdsToTree(JSON.parse(JSON.stringify(action.payload.element))),
                propsDefinition: [], defaultData: {}
            };
            draft.customComponents.push(newComponent);
            const newInstance: Element = {
                id: action.payload.element.id, type: 'component-instance', name: newComponent.name,
                componentId: newComponent.id, styles: { desktop: {} }, props: {}
            };
            const elementTree = getElementTree(draft);
            const { parent, index } = findElementDeep(elementTree, action.payload.element.id);
            if (parent && parent.children) { parent.children[index] = newInstance; } 
            else if (elementTree[index]?.id === action.payload.element.id) { elementTree[index] = newInstance; }
            setElementTree(draft, elementTree);
            draft.selectedElementId = newInstance.id;
            break;
        }
        case 'UPDATE_COMPONENT_DEFINITION': {
            const component = draft.customComponents.find(c => c.id === action.payload.componentId);
            if (component) {
                if (action.payload.updates.propsDefinition) component.propsDefinition = action.payload.updates.propsDefinition;
                if (action.payload.updates.defaultData) component.defaultData = action.payload.updates.defaultData;
            }
            break;
        }
        case 'ADD_ASSET': draft.assets.push(action.payload); break;
        case 'DELETE_ASSET': draft.assets = draft.assets.filter(asset => asset.id !== action.payload); break;
        case 'ADD_CODE_SNIPPET': draft.codeSnippets.push(action.payload); break;
        case 'UPDATE_CODE_SNIPPET': {
            const index = draft.codeSnippets.findIndex(s => s.id === action.payload.id);
            if (index !== -1) draft.codeSnippets[index] = action.payload;
            break;
        }
        case 'DELETE_CODE_SNIPPET': draft.codeSnippets = draft.codeSnippets.filter(s => s.id !== action.payload); break;
        case 'DEFINE_STATE_VARIABLE': {
            const page = findActivePage(draft);
            if(page) {
                const { variable, index } = action.payload;
                if(index !== undefined && page.stateDefinition[index]) page.stateDefinition[index] = variable;
                else page.stateDefinition.push(variable);
            }
            break;
        }
        case 'DELETE_STATE_VARIABLE': {
            const page = findActivePage(draft);
            if(page) page.stateDefinition = page.stateDefinition.filter(v => v.name !== action.payload.name);
            break;
        }
        case 'INITIALIZE_RUNTIME_STATE': {
            draft.runtimeState = {};
            const page = draft.pages.find(p => p.id === action.payload.pageId);
            if(page) page.stateDefinition.forEach(v => { draft.runtimeState[v.name] = v.initialValue; });
            break;
        }
        case 'EXECUTE_ACTIONS': {
            for (const step of action.payload.actions) {
                const { type, payload } = step;
                const { stateKey, value, modalId } = payload;
                switch (type) {
                    case 'set_state': if(stateKey) draft.runtimeState[stateKey] = value; break;
                    case 'increment_state': if(stateKey && typeof draft.runtimeState[stateKey] === 'number') draft.runtimeState[stateKey]++; break;
                    case 'decrement_state': if(stateKey && typeof draft.runtimeState[stateKey] === 'number') draft.runtimeState[stateKey]--; break;
                    case 'toggle_state': if(stateKey && typeof draft.runtimeState[stateKey] === 'boolean') draft.runtimeState[stateKey] = !draft.runtimeState[stateKey]; break;
                    case 'show_modal': if (modalId && !draft.visibleModalIds.includes(modalId)) draft.visibleModalIds.push(modalId); break;
                    case 'hide_modal': if (modalId) draft.visibleModalIds = draft.visibleModalIds.filter(id => id !== modalId); break;
                    case 'toggle_modal':
                        if (modalId) {
                            const index = draft.visibleModalIds.indexOf(modalId);
                            if (index > -1) draft.visibleModalIds.splice(index, 1);
                            else draft.visibleModalIds.push(modalId);
                        }
                        break;
                }
            }
            break;
        }
    }
});

type AppContextType = {
  state: AppState;
  dispatch: Dispatch<Action>;
  setSelectedElementId: (id: string | null) => void;
  updateElement: (id: string, updates: DeepPartial<Element>) => void;
  setViewport: (viewport: Viewport) => void;
  setCanvasWidth: (width: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const initializer = (initialProjectSettings: { name: string, type: ProjectType }): AppState => {
    const savedStateJSON = localStorage.getItem('proverve-state');
    if (savedStateJSON) {
        try {
            const savedPresent = JSON.parse(savedStateJSON);
            
            // Create a deep mutable copy. The state from localStorage is typed as PresentState,
            // which TypeScript can infer as deeply readonly. The initial state for useReducer
            // with Immer needs to be mutable.
            const mutableSavedPresent = JSON.parse(JSON.stringify(savedPresent));

            // Merge to ensure all properties are present, even if saved state is older
            const fullPresent = {
                projectName: initialProjectSettings.name,
                projectType: initialProjectSettings.type,
                pages: [],
                customComponents: [],
                assets: [],
                codeSnippets: [],
                activePageId: null,
                selectedElementId: null,
                editingComponentId: null,
                viewport: 'desktop',
                theme: defaultTheme,
                canvasWidth: 1280,
                ...mutableSavedPresent,
            };

            const initialRuntimeState = {};
            const activePage = fullPresent.pages.find(p => p.id === fullPresent.activePageId);
            if (activePage) {
                activePage.stateDefinition.forEach(v => {
                    initialRuntimeState[v.name] = v.initialValue;
                });
            }

            return {
                ...fullPresent,
                history: { past: [], future: [] },
                runtimeState: initialRuntimeState,
                visibleModalIds: [],
            };

        } catch (e) {
            console.error("Failed to parse saved state:", e);
            localStorage.removeItem('proverve-state');
        }
    }

    // If no saved state, create a new project
    const initialPage: Page = { id: uuidv4(), name: 'Home', elements: [], dataState: {}, apiDataSources: [], stateDefinition: [] };
    const basePresent: PresentState = {
        projectName: initialProjectSettings.name,
        projectType: initialProjectSettings.type,
        pages: [initialPage],
        customComponents: [],
        assets: [],
        codeSnippets: [],
        activePageId: initialPage.id,
        selectedElementId: null,
        editingComponentId: null,
        viewport: 'desktop',
        canvasWidth: 1280,
        theme: defaultTheme,
    };
    return {
        ...basePresent,
        history: { past: [], future: [] },
        runtimeState: {},
        visibleModalIds: [],
    };
};

export const AppContextProvider: React.FC<{ children: ReactNode, initialProjectSettings: { name: string, type: ProjectType } }> = ({ children, initialProjectSettings }) => {
  const [state, dispatch] = useReducer(appReducer, initialProjectSettings, initializer);

  useEffect(() => {
    const { history, runtimeState, visibleModalIds, ...presentData } = state;
    localStorage.setItem('proverve-state', JSON.stringify(presentData));
  }, [state]);

  useEffect(() => {
    dispatch({ type: 'INITIALIZE_RUNTIME_STATE', payload: { pageId: state.activePageId } });
  }, [state.activePageId]);
  
  const setSelectedElementId = (id: string | null) => dispatch({ type: 'SET_SELECTED_ELEMENT_ID', payload: id });
  const updateElement = (id: string, updates: DeepPartial<Element>) => dispatch({ type: 'UPDATE_ELEMENT', payload: { id, updates }});
  const setViewport = (viewport: Viewport) => dispatch({ type: 'SET_VIEWPORT', payload: viewport });
  const setCanvasWidth = (width: number) => dispatch({ type: 'SET_CANVAS_WIDTH', payload: width });

  const canUndo = state.history.past.length > 0;
  const canRedo = state.history.future.length > 0;

  const undo = () => {
    if (canUndo) dispatch({ type: 'UNDO' });
  };
  const redo = () => {
    if (canRedo) dispatch({ type: 'REDO' });
  };

  return (
    <AppContext.Provider value={{ state, dispatch, setSelectedElementId, updateElement, setViewport, setCanvasWidth, undo, redo, canUndo, canRedo }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppContextProvider');
  return context;
};