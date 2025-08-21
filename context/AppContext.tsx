import React, { createContext, useContext, useReducer, useEffect, ReactNode, Dispatch } from 'react';
import { Page, Element, Viewport, Style, ProjectType, AppState, CustomComponent, Asset, PresentState, DeepPartial, ThemeState, PropDefinition, CodeSnippet, StateVariable, ActionStep, ApiDataSource, CopiedStyles, ThemeToken, ElementAnimation, AnimationKeyframe, MockApiEndpoint, Commit, MultiplayerCursor, ComponentSlot, PageTemplate, VariantPropertyGroup, VariantOption, ResponsiveStyles, AppMode, LogicFlow, FileNode, AnyDataSource, BuildState, BuildTarget, BuildStatus, DeepReadonly } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { produce, Draft } from 'immer';
import { findElementDeep, removeElement, insertElementAtIndex, duplicateElement, assignNewIdsToTree } from '../lib/treeUtils';
import { componentLibrary, createDefaultElement } from '../constants';
import { toast } from 'react-hot-toast';


type Action =
  | { type: 'SET_PROJECT_TYPE'; payload: ProjectType }
  | { type: 'UPDATE_PROJECT_NAME', payload: string }
  | { type: 'ADD_PAGE'; payload: { name: string } }
  | { type: 'DELETE_PAGE'; payload: string }
  | { type: 'DUPLICATE_PAGE'; payload: string }
  | { type: 'UPDATE_PAGE_NAME'; payload: { id: string, name: string } }
  | { type: 'SET_ACTIVE_PAGE'; payload: string | null }
  | { type: 'SET_PROJECT_PAGES'; payload: { pages: PageTemplate[] } }
  | { type: 'SET_ELEMENTS'; payload: Element[] }
  | { type: 'ADD_ELEMENT', payload: { parentId: string | null; index: number; element: Element }}
  | { type: 'ADD_ELEMENTS', payload: { parentId: string | null; index: number; elements: Element[] }}
  | { type: 'DELETE_ELEMENT', payload: { elementId: string } }
  | { type: 'DUPLICATE_ELEMENT', payload: { elementId: string } }
  | { type: 'MOVE_ELEMENT', payload: { activeId: string, targetParentId: string | null, targetIndex: number }}
  | { type: 'UPDATE_ELEMENT'; payload: { id: string, updates: DeepPartial<Element> } }
  | { type: 'WRAP_ELEMENT', payload: { elementId: string, wrapperType: 'container' | 'flex' }}
  | { type: 'ADJUST_Z_INDEX', payload: { elementId: string, direction: 'forward' | 'backward' }}
  | { type: 'APPLY_THEME', payload: { [elementType: string]: Style }}
  | { type: 'UPDATE_THEME', payload: Partial<ThemeState> }
  | { type: 'UPDATE_THEME_FONTS', payload: { primary: string; body: string } }
  | { type: 'ADD_THEME_VARIABLE', payload: { name: string, value: string } }
  | { type: 'UPDATE_THEME_VARIABLE', payload: { oldName: string, newName: string, value: string } }
  | { type: 'DELETE_THEME_VARIABLE', payload: { name: string } }
  | { type: 'ADD_THEME_TOKEN'; payload: { tokenType: 'colors' | 'fontSizes' | 'spacing' | 'radii', token: ThemeToken } }
  | { type: 'UPDATE_THEME_TOKEN'; payload: { tokenType: 'colors' | 'fontSizes' | 'spacing' | 'radii', token: ThemeToken } }
  | { type: 'DELETE_THEME_TOKEN'; payload: { tokenType: 'colors' | 'fontSizes' | 'spacing' | 'radii', tokenId: string } }
  | { type: 'ADD_GLOBAL_CLASS', payload: { className: string, styles: Style } }
  | { type: 'UPDATE_GLOBAL_CLASS', payload: { className: string, styles: Style } }
  | { type: 'DELETE_GLOBAL_CLASS', payload: { className: string } }
  | { type: 'FIND_PARENT', payload: { elementId: string, callback: (parent: Element | null) => void }}
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'COMMIT_CHANGES', payload: string }
  | { type: 'SET_SELECTED_ELEMENT_ID'; payload: string | null }
  | { type: 'SET_HOVERED_ELEMENT_ID'; payload: string | null }
  | { type: 'SET_ALT_KEY_PRESSED'; payload: boolean }
  | { type: 'SET_EDITING_COMPONENT_ID', payload: string | null }
  | { type: 'SET_VIEWPORT'; payload: Viewport }
  | { type: 'SET_CANVAS_WIDTH'; payload: number }
  | { type: 'SET_CANVAS_ZOOM'; payload: number }
  | { type: 'COPY_STYLES', payload: { elementId: string } }
  | { type: 'PASTE_STYLES', payload: { elementId: string } }
  | { type: 'SHOW_MODAL', payload: string }
  | { type: 'HIDE_MODAL', payload: string }
  | { type: 'TOGGLE_MODAL', payload: string }
  | { type: 'SET_PAGE_DATA_STATE'; payload: { sourceName: string, data: any } }
  | { type: 'ADD_API_DATA_SOURCE'; payload: ApiDataSource }
  | { type: 'UPDATE_API_DATA_SOURCE'; payload: ApiDataSource }
  | { type: 'DELETE_API_DATA_SOURCE'; payload: string }
  | { type: 'ADD_DATA_SOURCE', payload: AnyDataSource }
  | { type: 'UPDATE_DATA_SOURCE', payload: AnyDataSource }
  | { type: 'DELETE_DATA_SOURCE', payload: string }
  | { type: 'ADD_MOCK_API_ENDPOINT'; payload: MockApiEndpoint }
  | { type: 'UPDATE_MOCK_API_ENDPOINT'; payload: MockApiEndpoint }
  | { type: 'DELETE_MOCK_API_ENDPOINT'; payload: string }
  | { type: 'SET_ELEMENT_DATA_SOURCE'; payload: { elementId: string, dataSource: Element['dataSource'] }}
  | { type: 'CREATE_COMPONENT', payload: { name: string, element: Element }}
  | { type: 'UPDATE_COMPONENT_DEFINITION', payload: { componentId: string, updates: Partial<Pick<CustomComponent, 'propsDefinition' | 'componentStateDefinition' | 'defaultData'>> } }
  | { type: 'ADD_ASSET', payload: Asset }
  | { type: 'DELETE_ASSET', payload: string }
  | { type: 'ADD_CODE_SNIPPET', payload: CodeSnippet }
  | { type: 'UPDATE_CODE_SNIPPET', payload: CodeSnippet }
  | { type: 'DELETE_CODE_SNIPPET', payload: string }
  | { type: 'SET_APP_MODE'; payload: AppMode }
  | { type: 'SET_PREVIEW_MODE'; payload: boolean }
  | { type: 'UPDATE_CURSORS'; payload: MultiplayerCursor[] }
  | { type: 'ADD_COMPONENT_SLOT', payload: { componentId: string, slot: ComponentSlot } }
  | { type: 'UPDATE_COMPONENT_SLOT', payload: { componentId: string, slotId: string, name: string } }
  | { type: 'DELETE_COMPONENT_SLOT', payload: { componentId: string, slotId: string } }
  | { type: 'ADD_LOGIC_FLOW'; payload: { pageId: string; flow: LogicFlow } }
  | { type: 'SET_WORKSPACE', payload: FileNode[] }
  | { type: 'SET_BUILD_STATE', payload: Partial<BuildState> }
  // Panel Layout Actions
  | { type: 'SET_PANEL_LAYOUT'; payload: Partial<AppState['panelLayout']> }
  | { type: 'SET_PANELS_STATE'; payload: Partial<AppState['panels']> }
  // Variant Actions
  | { type: 'ADD_VARIANT_PROPERTY', payload: { componentId: string, property: VariantPropertyGroup } }
  | { type: 'UPDATE_VARIANT_PROPERTY', payload: { componentId: string, propertyId: string, name: string } }
  | { type: 'DELETE_VARIANT_PROPERTY', payload: { componentId: string, propertyId: string } }
  | { type: 'ADD_VARIANT_OPTION', payload: { componentId: string, propertyId: string, option: VariantOption } }
  | { type: 'UPDATE_VARIANT_OPTION', payload: { componentId: string, propertyId: string, optionId: string, name: string } }
  | { type: 'DELETE_VARIANT_OPTION', payload: { componentId: string, propertyId: string, optionId: string } }
  | { type: 'UPDATE_VARIANT_STYLE_OVERRIDE', payload: { componentId: string, combination: { [key: string]: string }, styles: ResponsiveStyles } }
  // Animation Actions
  | { type: 'ADD_ANIMATION'; payload: { elementId: string; animation: ElementAnimation } }
  | { type: 'UPDATE_ANIMATION'; payload: { elementId: string; animationId: string; updates: Partial<ElementAnimation> } }
  | { type: 'DELETE_ANIMATION'; payload: { elementId: string; animationId: string } }
  | { type: 'ADD_ANIMATION_KEYFRAME'; payload: { elementId: string; animationId: string; keyframe: AnimationKeyframe } }
  | { type: 'UPDATE_ANIMATION_KEYFRAME'; payload: { elementId: string; animationId: string; keyframeId: string; updates: Partial<AnimationKeyframe> } }
  | { type: 'DELETE_ANIMATION_KEYFRAME'; payload: { elementId: string; animationId: string; keyframeId: string } }
  // State & Action Types
  | { type: 'DEFINE_STATE_VARIABLE'; payload: { variable: StateVariable, index?: number } }
  | { type: 'DELETE_STATE_VARIABLE'; payload: { name: string } }
  | { type: 'DEFINE_GLOBAL_STATE_VARIABLE'; payload: { variable: StateVariable, index?: number } }
  | { type: 'DELETE_GLOBAL_STATE_VARIABLE'; payload: { name: string } }
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
    fonts: {
        primary: 'Inter',
        body: 'Inter'
    },
    colors: [
      { id: 'c1', name: 'Primary', value: '#8A42F4' },
      { id: 'c2', name: 'Accent', value: '#00E0FF' },
      { id: 'c3', name: 'Text', value: '#E0E0FF' },
      { id: 'c4', name: 'Surface', value: '#1A1C2C' },
    ],
    fontSizes: [
      { id: 'f1', name: 'Base', value: '16px' },
      { id: 'f2', name: 'Large', value: '24px' },
      { id: 'f3', name: 'Heading', value: '48px' },
    ],
    spacing: [
      { id: 's1', name: 'Small', value: '8px' },
      { id: 's2', name: 'Medium', value: '16px' },
      { id: 's3', name: 'Large', value: '32px' },
    ],
    radii: [],
    baseStyles: {
        heading: { color: 'var(--color-text-primary)' },
        text: { color: 'var(--color-text-secondary)' },
    },
    globalClasses: {}
};

const createHistorySnapshot = (draft: Draft<AppState>): PresentState => {
    const { history, runtimeState, visibleModalIds, copiedStyles, appMode, previewMode, altKeyPressed, hoveredElementId, unsavedChanges, commits, multiplayerCursors, panelLayout, panels, buildState, ...presentData } = draft;
    return JSON.parse(JSON.stringify(presentData));
};

const restoreFromSnapshot = (draft: Draft<AppState>, snapshot: PresentState) => {
    const mutableSnapshot = JSON.parse(JSON.stringify(snapshot)); // Ensure mutability
    Object.assign(draft, mutableSnapshot);
};

const appReducer = produce((draft: Draft<AppState>, action: Action) => {
    const nonUndoableActions: Action['type'][] = [
        'UNDO', 'REDO', 'FIND_PARENT', 'SET_ACTIVE_PAGE', 'SET_SELECTED_ELEMENT_ID', 'SET_HOVERED_ELEMENT_ID', 'SET_ALT_KEY_PRESSED',
        'SET_EDITING_COMPONENT_ID', 'SET_VIEWPORT', 'SET_CANVAS_WIDTH', 'SET_CANVAS_ZOOM', 'SHOW_MODAL', 'HIDE_MODAL', 'TOGGLE_MODAL',
        'EXECUTE_ACTIONS', 'INITIALIZE_RUNTIME_STATE', 'SET_PAGE_DATA_STATE', 'COPY_STYLES', 'COMMIT_CHANGES', 'UPDATE_CURSORS',
        'SET_APP_MODE', 'SET_PREVIEW_MODE', 'SET_PANEL_LAYOUT', 'SET_PANELS_STATE', 'SET_WORKSPACE', 'SET_BUILD_STATE'
    ];

    if (!nonUndoableActions.includes(action.type)) {
        draft.history.past.push(createHistorySnapshot(draft));
        draft.history.future = [];
        if (draft.history.past.length > 50) {
            draft.history.past.shift();
        }
        draft.unsavedChanges = (draft.unsavedChanges || 0) + 1;
    }
    
    const findActivePage = () => draft.pages.find(p => p.id === draft.activePageId);
    const getElementTree = (): Element[] => {
        const editingComponent = draft.editingComponentId ? draft.customComponents.find(c => c.id === draft.editingComponentId) : null;
        return editingComponent ? [editingComponent.mainElement as Element] : (findActivePage()?.elements as Element[]) || [];
    };
    const setElementTree = (tree: Element[]) => {
        const editingComponent = draft.editingComponentId ? draft.customComponents.find(c => c.id === draft.editingComponentId) : null;
        if (editingComponent) {
            editingComponent.mainElement = tree[0];
        } else {
            const page = findActivePage();
            if (page) {
                page.elements = tree;
            }
        }
    };

    switch (action.type) {
        case 'SET_WORKSPACE': draft.workspace = action.payload; break;
        case 'SET_BUILD_STATE': draft.buildState = { ...draft.buildState, ...action.payload }; break;
        case 'ADD_DATA_SOURCE': draft.dataSources.push(action.payload); break;
        case 'UPDATE_DATA_SOURCE': {
            const index = draft.dataSources.findIndex(ds => ds.id === action.payload.id);
            if (index > -1) draft.dataSources[index] = action.payload;
            break;
        }
        case 'DELETE_DATA_SOURCE': draft.dataSources = draft.dataSources.filter(ds => ds.id !== action.payload) as Draft<AnyDataSource[]>; break;

        case 'SET_PANEL_LAYOUT':
            draft.panelLayout = { ...draft.panelLayout, ...action.payload };
            break;
        case 'SET_PANELS_STATE':
            draft.panels = { ...draft.panels, ...action.payload };
            break;
        case 'SET_PROJECT_TYPE': draft.projectType = action.payload; break;
        case 'UPDATE_PROJECT_NAME': draft.projectName = action.payload; break;
        case 'ADD_PAGE': {
            const newPage: Page = { id: uuidv4(), name: action.payload.name, elements: [], dataState: {}, apiDataSources: [], stateDefinition: [], logicFlows: [] };
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
                 const newPage: Page = { id: uuidv4(), name: 'Home', elements: [], dataState: {}, apiDataSources: [], stateDefinition: [], logicFlows: [] };
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
                    elements: (pageToDuplicate.elements as Element[]).map(assignNewIdsToTree)
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
        case 'SET_ACTIVE_PAGE': draft.activePageId = action.payload; draft.selectedElementId = null; draft.editingComponentId = null; draft.visibleModalIds = []; break;
        case 'SET_PROJECT_PAGES': {
            const newPages: Page[] = action.payload.pages.map(pageTemplate => ({
                id: uuidv4(),
                name: pageTemplate.name,
                elements: pageTemplate.elements.map(createDefaultElement),
                dataState: {},
                apiDataSources: [],
                stateDefinition: [],
                logicFlows: []
            }));
            draft.pages = newPages;
            draft.activePageId = newPages[0]?.id || null;
            draft.selectedElementId = null;
            break;
        }
        case 'SET_ELEMENTS': {
            const page = findActivePage();
            if (page) page.elements = action.payload;
            break;
        }
        case 'ADD_ELEMENT': {
            const newTree = insertElementAtIndex(getElementTree(), action.payload.parentId, action.payload.index, action.payload.element);
            setElementTree(newTree);
            break;
        }
        case 'ADD_ELEMENTS': {
            let currentTree = getElementTree();
            action.payload.elements.forEach((element, i) => {
                currentTree = insertElementAtIndex(currentTree, action.payload.parentId, action.payload.index + i, element);
            });
            setElementTree(currentTree);
            break;
        }
        case 'DELETE_ELEMENT': {
            if (draft.selectedElementId === action.payload.elementId) draft.selectedElementId = null;
            const newTree = removeElement(getElementTree(), action.payload.elementId);
            setElementTree(newTree);
            break;
        }
        case 'DUPLICATE_ELEMENT': {
           let elementTree = getElementTree();
           const { element, parent, index } = findElementDeep(elementTree, action.payload.elementId);
           if (!element) break;
           const newElement = duplicateElement(element as Element);
           const targetArray = parent ? (parent as Draft<Element>).children : elementTree;
           targetArray.splice(index + 1, 0, newElement);
           setElementTree(elementTree);
           break;
        }
        case 'MOVE_ELEMENT': {
           const elementsWithout = removeElement(getElementTree(), action.payload.activeId);
           const { element } = findElementDeep(getElementTree(), action.payload.activeId);
           if (element) {
               const newTree = insertElementAtIndex(elementsWithout, action.payload.targetParentId, action.payload.targetIndex, element as Element);
               setElementTree(newTree);
           }
           break;
        }
        case 'UPDATE_ELEMENT': {
            const { element } = findElementDeep(getElementTree(), action.payload.id);
            if (element) {
                const deepMerge = (target: any, source: any) => {
                    for (const key in source) {
                        const sourceVal = source[key];
                        if (sourceVal !== null && typeof sourceVal === 'object' && !Array.isArray(sourceVal) && target[key] !== null && typeof target[key] === 'object') {
                            if (!target[key]) target[key] = {};
                            deepMerge(target[key], sourceVal);
                        } else {
                            target[key] = sourceVal;
                        }
                    }
                };
                deepMerge(element, action.payload.updates);
            }
            break;
        }
        case 'WRAP_ELEMENT': {
            const { elementId, wrapperType } = action.payload;
            let elementTree = getElementTree();
            const { element: elementToWrap, parent, index } = findElementDeep(elementTree, elementId);
            if (!elementToWrap) break;

            const lib = componentLibrary[draft.projectType] || componentLibrary.web;
            const wrapperTemplate = lib.find(c => c.type === wrapperType)?.defaultElement;
            if (!wrapperTemplate) break;

            const wrapperElement = createDefaultElement(wrapperTemplate);
            wrapperElement.children = [elementToWrap as Element];

            const targetArray = parent ? (parent as Draft<Element>).children : elementTree;
            targetArray[index] = wrapperElement;

            setElementTree(elementTree);
            draft.selectedElementId = wrapperElement.id;
            break;
        }
        case 'ADJUST_Z_INDEX': {
            const { elementId, direction } = action.payload;
            const { element } = findElementDeep(getElementTree(), elementId);
            if (element) {
                const currentZ = Number((element.styles.desktop as any).zIndex) || 0;
                const newZ = direction === 'forward' ? currentZ + 1 : currentZ - 1;
                if (!(element.styles.desktop as any)) (element.styles.desktop as any) = {};
                (element.styles.desktop as any).zIndex = newZ;
            }
            break;
        }
        case 'ADD_ANIMATION': {
            const { element } = findElementDeep(getElementTree(), action.payload.elementId);
            if (element) {
                if (!element.animations) (element as any).animations = [];
                (element.animations as any).push(action.payload.animation);
            }
            break;
        }
        case 'UPDATE_ANIMATION': {
            const { element } = findElementDeep(getElementTree(), action.payload.elementId);
            if (element?.animations) {
                const animIndex = element.animations.findIndex(a => a.id === action.payload.animationId);
                if (animIndex > -1) (element.animations as any)[animIndex] = { ...element.animations[animIndex], ...action.payload.updates };
            }
            break;
        }
        case 'DELETE_ANIMATION': {
            const { element } = findElementDeep(getElementTree(), action.payload.elementId);
            if (element?.animations) (element as any).animations = element.animations.filter(a => a.id !== action.payload.animationId);
            break;
        }
        case 'ADD_ANIMATION_KEYFRAME': {
            const { element } = findElementDeep(getElementTree(), action.payload.elementId);
            const anim = element?.animations?.find(a => a.id === action.payload.animationId);
            if (anim) (anim.keyframes as any).push(action.payload.keyframe);
            break;
        }
        case 'UPDATE_ANIMATION_KEYFRAME': {
            const { element } = findElementDeep(getElementTree(), action.payload.elementId);
            const anim = element?.animations?.find(a => a.id === action.payload.animationId);
            if (anim) {
                const keyframeIndex = anim.keyframes.findIndex(k => k.id === action.payload.keyframeId);
                if (keyframeIndex > -1) (anim.keyframes as any)[keyframeIndex] = { ...anim.keyframes[keyframeIndex], ...action.payload.updates };
            }
            break;
        }
        case 'DELETE_ANIMATION_KEYFRAME': {
            const { element } = findElementDeep(getElementTree(), action.payload.elementId);
            const anim = element?.animations?.find(a => a.id === action.payload.animationId);
            if (anim) (anim as any).keyframes = anim.keyframes.filter(k => k.id !== action.payload.keyframeId);
            break;
        }
        case 'APPLY_THEME': {
            const applyStyles = (elements: Element[]) => {
                elements.forEach(el => {
                    if(action.payload[el.type]) el.styles.desktop = { ...el.styles.desktop, ...action.payload[el.type] };
                    if(el.children) applyStyles(el.children as Element[]);
                });
            }
            applyStyles(getElementTree());
            break;
        }
        case 'UPDATE_THEME': Object.assign(draft.theme, action.payload); break;
        case 'UPDATE_THEME_FONTS': draft.theme.fonts = action.payload; break;
        case 'ADD_THEME_VARIABLE': draft.theme.variables[action.payload.name] = action.payload.value; break;
        case 'UPDATE_THEME_VARIABLE': {
            const { oldName, newName, value } = action.payload;
            if (oldName !== newName) delete draft.theme.variables[oldName];
            draft.theme.variables[newName] = value;
            break;
        }
        case 'DELETE_THEME_VARIABLE': delete draft.theme.variables[action.payload.name]; break;
        case 'ADD_THEME_TOKEN': (draft.theme as any)[action.payload.tokenType].push(action.payload.token); break;
        case 'UPDATE_THEME_TOKEN': {
            const { tokenType, token } = action.payload;
            const index = (draft.theme as any)[tokenType].findIndex((t: ThemeToken) => t.id === token.id);
            if (index > -1) (draft.theme as any)[tokenType][index] = token;
            break;
        }
        case 'DELETE_THEME_TOKEN': {
            const { tokenType, tokenId } = action.payload;
            (draft.theme as any)[tokenType] = (draft.theme as any)[tokenType].filter((t: ThemeToken) => t.id !== tokenId) as any;
            break;
        }
        case 'ADD_GLOBAL_CLASS': draft.theme.globalClasses[action.payload.className] = action.payload.styles; break;
        case 'UPDATE_GLOBAL_CLASS': draft.theme.globalClasses[action.payload.className] = action.payload.styles; break;
        case 'DELETE_GLOBAL_CLASS': delete draft.theme.globalClasses[action.payload.className]; break;
        case 'UNDO': {
            if (draft.history.past.length > 0) {
                draft.history.future.unshift(createHistorySnapshot(draft));
                const pastState = draft.history.past.pop();
                if (pastState) restoreFromSnapshot(draft, pastState as PresentState);
            }
            break;
        }
        case 'REDO': {
            if (draft.history.future.length > 0) {
                draft.history.past.push(createHistorySnapshot(draft));
                const futureState = draft.history.future.shift();
                if (futureState) restoreFromSnapshot(draft, futureState as PresentState);
            }
            break;
        }
        case 'COMMIT_CHANGES':
            (draft.commits as Draft<Commit>[]).unshift({ id: uuidv4(), message: action.payload, timestamp: new Date().toISOString(), state: createHistorySnapshot(draft) });
            draft.unsavedChanges = 0;
            break;
        case 'SET_SELECTED_ELEMENT_ID': draft.selectedElementId = action.payload; break;
        case 'SET_HOVERED_ELEMENT_ID': draft.hoveredElementId = action.payload; break;
        case 'SET_ALT_KEY_PRESSED': draft.altKeyPressed = action.payload; break;
        case 'SET_EDITING_COMPONENT_ID': draft.editingComponentId = action.payload; draft.selectedElementId = null; break;
        case 'SET_VIEWPORT': draft.viewport = action.payload; break;
        case 'SET_CANVAS_WIDTH': draft.canvasWidth = action.payload; break;
        case 'SET_CANVAS_ZOOM': draft.canvasZoom = action.payload; break;
        case 'COPY_STYLES': {
            const { element } = findElementDeep(getElementTree(), action.payload.elementId);
            if (element) draft.copiedStyles = { styles: element.styles as ResponsiveStyles, tailwindClasses: element.tailwindClasses, className: element.props?.className };
            toast.success('Styles copied!');
            break;
        }
        case 'PASTE_STYLES': {
            if (draft.copiedStyles) {
                const { element } = findElementDeep(getElementTree(), action.payload.elementId);
                if (element) {
                    element.styles = draft.copiedStyles.styles;
                    element.tailwindClasses = draft.copiedStyles.tailwindClasses;
                    if (!element.props) element.props = {};
                    element.props.className = draft.copiedStyles.className;
                }
            }
            break;
        }
        case 'SHOW_MODAL': if (!draft.visibleModalIds.includes(action.payload)) (draft.visibleModalIds as string[]).push(action.payload); break;
        case 'HIDE_MODAL': draft.visibleModalIds = draft.visibleModalIds.filter(id => id !== action.payload) as Draft<string[]>; break;
        case 'TOGGLE_MODAL': {
            const index = draft.visibleModalIds.indexOf(action.payload);
            if (index > -1) (draft.visibleModalIds as string[]).splice(index, 1);
            else (draft.visibleModalIds as string[]).push(action.payload);
            break;
        }
        case 'SET_PAGE_DATA_STATE': {
            const page = findActivePage();
            if (page) page.dataState[action.payload.sourceName] = action.payload.data;
            break;
        }
        case 'ADD_API_DATA_SOURCE': (findActivePage()?.apiDataSources as any)?.push(action.payload); break;
        case 'UPDATE_API_DATA_SOURCE': {
            const page = findActivePage();
            if (page) {
                const index = page.apiDataSources.findIndex(d => d.id === action.payload.id);
                if (index > -1) (page.apiDataSources as any)[index] = action.payload;
            }
            break;
        }
        case 'DELETE_API_DATA_SOURCE': {
            const page = findActivePage();
            if (page) (page as any).apiDataSources = page.apiDataSources.filter(d => d.id !== action.payload);
            break;
        }
        case 'ADD_MOCK_API_ENDPOINT': (draft.mockApiEndpoints as any).push(action.payload); break;
        case 'UPDATE_MOCK_API_ENDPOINT': {
            const index = draft.mockApiEndpoints.findIndex(e => e.id === action.payload.id);
            if (index > -1) (draft.mockApiEndpoints as any)[index] = action.payload;
            break;
        }
        case 'DELETE_MOCK_API_ENDPOINT': (draft as any).mockApiEndpoints = draft.mockApiEndpoints.filter(e => e.id !== action.payload); break;
        case 'CREATE_COMPONENT': {
            const newComponent: CustomComponent = {
                id: uuidv4(),
                name: action.payload.name,
                icon: 'Component',
                mainElement: assignNewIdsToTree(action.payload.element),
                propsDefinition: [],
                slots: [],
                variantProperties: [],
                variantStyleOverrides: [],
                componentStateDefinition: [],
                defaultData: {}
            };
            (draft.customComponents as any).push(newComponent);
            const { element, parent, index } = findElementDeep(getElementTree(), action.payload.element.id);
            if (element) {
                const instance: Element = {
                    id: element.id,
                    type: 'component-instance',
                    name: newComponent.name,
                    componentId: newComponent.id,
                    styles: { desktop: {} },
                    props: {},
                    children: (element.children as Element[]) || [],
                };
                const targetArray = parent ? (parent as Draft<Element>).children : getElementTree();
                (targetArray as any)[index] = instance;
            }
            break;
        }
        case 'UPDATE_COMPONENT_DEFINITION': {
            const component = draft.customComponents.find(c => c.id === action.payload.componentId);
            if (component) Object.assign(component, action.payload.updates);
            break;
        }
        case 'ADD_ASSET': (draft.assets as any).push(action.payload); break;
        case 'DELETE_ASSET': draft.assets = draft.assets.filter(a => a.id !== action.payload) as any; break;
        case 'ADD_CODE_SNIPPET': (draft.codeSnippets as any).push(action.payload); break;
        case 'UPDATE_CODE_SNIPPET': {
            const index = draft.codeSnippets.findIndex(s => s.id === action.payload.id);
            if (index > -1) (draft.codeSnippets as any)[index] = action.payload;
            break;
        }
        case 'DELETE_CODE_SNIPPET': draft.codeSnippets = draft.codeSnippets.filter(s => s.id !== action.payload) as any; break;
        case 'SET_APP_MODE': draft.appMode = action.payload; break;
        case 'SET_PREVIEW_MODE': draft.previewMode = action.payload; break;
        case 'UPDATE_CURSORS': draft.multiplayerCursors = action.payload as any; break;
        case 'ADD_COMPONENT_SLOT': {
            const comp = draft.customComponents.find(c => c.id === action.payload.componentId);
            if (comp) (comp.slots as any).push(action.payload.slot);
            break;
        }
        case 'UPDATE_COMPONENT_SLOT': {
            const comp = draft.customComponents.find(c => c.id === action.payload.componentId);
            const slot = comp?.slots.find(s => s.id === action.payload.slotId);
            if (slot) (slot as any).name = action.payload.name;
            break;
        }
        case 'DELETE_COMPONENT_SLOT': {
            const comp = draft.customComponents.find(c => c.id === action.payload.componentId);
            if (comp) (comp as any).slots = comp.slots.filter(s => s.id !== action.payload.slotId);
            break;
        }
        case 'ADD_LOGIC_FLOW': {
            const page = draft.pages.find(p => p.id === action.payload.pageId);
            if(page) (page.logicFlows as any).push(action.payload.flow);
            break;
        }
        case 'ADD_VARIANT_PROPERTY': {
            const comp = draft.customComponents.find(c => c.id === action.payload.componentId);
            if (comp) (comp.variantProperties as any).push(action.payload.property);
            break;
        }
        case 'UPDATE_VARIANT_PROPERTY': {
            const comp = draft.customComponents.find(c => c.id === action.payload.componentId);
            const prop = comp?.variantProperties.find(p => p.id === action.payload.propertyId);
            if (prop) (prop as any).name = action.payload.name;
            break;
        }
        case 'DELETE_VARIANT_PROPERTY': {
            const comp = draft.customComponents.find(c => c.id === action.payload.componentId);
            if (comp) (comp as any).variantProperties = comp.variantProperties.filter(p => p.id !== action.payload.propertyId);
            break;
        }
        case 'ADD_VARIANT_OPTION': {
            const comp = draft.customComponents.find(c => c.id === action.payload.componentId);
            const prop = comp?.variantProperties.find(p => p.id === action.payload.propertyId);
            if (prop) (prop.options as any).push(action.payload.option);
            break;
        }
        case 'UPDATE_VARIANT_OPTION': {
            const comp = draft.customComponents.find(c => c.id === action.payload.componentId);
            const prop = comp?.variantProperties.find(p => p.id === action.payload.propertyId);
            const option = prop?.options.find(o => o.id === action.payload.optionId);
            if (option) (option as any).name = action.payload.name;
            break;
        }
        case 'DELETE_VARIANT_OPTION': {
            const comp = draft.customComponents.find(c => c.id === action.payload.componentId);
            const prop = comp?.variantProperties.find(p => p.id === action.payload.propertyId);
            if (prop) (prop as any).options = prop.options.filter(o => o.id !== action.payload.optionId);
            break;
        }
        case 'UPDATE_VARIANT_STYLE_OVERRIDE': {
            const comp = draft.customComponents.find(c => c.id === action.payload.componentId);
            if (comp) {
                const index = comp.variantStyleOverrides.findIndex(o => JSON.stringify(o.variantCombination) === JSON.stringify(action.payload.combination));
                if (index > -1) {
                    (comp.variantStyleOverrides as any)[index].styles = action.payload.styles;
                } else {
                    (comp.variantStyleOverrides as any).push({ variantCombination: action.payload.combination, styles: action.payload.styles });
                }
            }
            break;
        }
        case 'DEFINE_STATE_VARIABLE': {
            const page = findActivePage();
            if (page) {
                if (action.payload.index !== undefined) {
                    (page.stateDefinition as any)[action.payload.index] = action.payload.variable;
                } else {
                    (page.stateDefinition as any).push(action.payload.variable);
                }
            }
            break;
        }
        case 'DELETE_STATE_VARIABLE': {
            const page = findActivePage();
            if (page) (page as any).stateDefinition = page.stateDefinition.filter(v => v.name !== action.payload.name);
            break;
        }
        case 'DEFINE_GLOBAL_STATE_VARIABLE': {
            if (action.payload.index !== undefined) {
                (draft.globalStateDefinition as any)[action.payload.index] = action.payload.variable;
            } else {
                (draft.globalStateDefinition as any).push(action.payload.variable);
            }
            break;
        }
        case 'DELETE_GLOBAL_STATE_VARIABLE': {
            draft.globalStateDefinition = draft.globalStateDefinition.filter(v => v.name !== action.payload.name) as any;
            break;
        }
        case 'EXECUTE_ACTIONS':
            // This is handled by the non-reducer part of the context now
            break;
        case 'INITIALIZE_RUNTIME_STATE': {
            const page = draft.pages.find(p => p.id === action.payload.pageId);
            const newRuntimeState: { [key: string]: any } = {};
            draft.globalStateDefinition.forEach(v => newRuntimeState[v.name] = v.initialValue);
            page?.stateDefinition.forEach(v => newRuntimeState[v.name] = v.initialValue);
            draft.runtimeState = newRuntimeState;
            break;
        }
    }
});

const AppContext = createContext<{
  state: DeepReadonly<AppState>;
  dispatch: Dispatch<Action>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  setSelectedElementId: (id: string | null) => void;
  updateElement: (id: string, updates: DeepPartial<Element>) => void;
  setPreviewMode: (isPreview: boolean) => void;
}>({} as any);

const isObject = (item: any): item is object => (item && typeof item === 'object' && !Array.isArray(item));

const deepMerge = <T extends object, U extends object>(target: T, source: U): T & U => {
    let output = { ...target } as T & U;
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            const sourceValue = (source as any)[key];
            const targetValue = (target as any)[key];
            if (isObject(sourceValue)) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: sourceValue });
                } else {
                    (output as any)[key] = deepMerge(targetValue, sourceValue);
                }
            } else {
                Object.assign(output, { [key]: sourceValue });
            }
        });
    }
    return output;
};

const initializer = (initialProjectSettings: { name: string, type: ProjectType }): AppState => {
    const savedStateRaw = localStorage.getItem('proverve-state');
    const mutableSavedData = savedStateRaw ? JSON.parse(savedStateRaw) : {};
    
    const initialState: AppState = {
        projectName: initialProjectSettings.name,
        projectType: initialProjectSettings.type,
        appMode: 'design',
        previewMode: false,
        workspace: [],
        pages: [{ id: uuidv4(), name: 'Home', elements: [], dataState: {}, stateDefinition: [], apiDataSources: [], logicFlows: [] }],
        dataSources: [],
        buildState: { target: 'web', status: 'idle', log: [] },
        globalStateDefinition: [],
        mockApiEndpoints: [],
        customComponents: [],
        assets: [],
        codeSnippets: [],
        activePageId: null,
        selectedElementId: null,
        hoveredElementId: null,
        editingComponentId: null,
        viewport: 'desktop',
        theme: defaultTheme,
        canvasWidth: 1280,
        canvasZoom: 1,
        copiedStyles: null,
        altKeyPressed: false,
        unsavedChanges: 0,
        commits: [],
        panelLayout: { leftSize: 280, rightSize: 320, bottomSize: 250 },
        panels: { leftCollapsed: false, rightCollapsed: false, bottomActivePanel: null },
        multiplayerCursors: [],
        runtimeState: {},
        visibleModalIds: [],
        history: { past: [], future: [] }
    };
    
    // Set active page ID after defining initial pages
    initialState.activePageId = initialState.pages[0].id;
    
    // Deep merge saved data, which is more robust for nested objects like theme.
    const finalState = deepMerge(initialState, mutableSavedData);

    // Always override these properties on a new session start for a clean state.
    finalState.projectName = initialProjectSettings.name;
    finalState.projectType = initialProjectSettings.type;
    finalState.appMode = 'design';
    finalState.previewMode = false;
    finalState.selectedElementId = null;
    finalState.editingComponentId = null;
    finalState.hoveredElementId = null;
    finalState.altKeyPressed = false;
    finalState.visibleModalIds = [];
    finalState.buildState = { target: 'web', status: 'idle', log: [] };

    // Ensure activePageId is valid after merging state.
    if (!finalState.activePageId || !finalState.pages.find(p => p.id === finalState.activePageId)) {
        finalState.activePageId = finalState.pages[0]?.id || null;
    }

    return finalState;
};

export const AppContextProvider: React.FC<{ children: ReactNode; initialProjectSettings: { name: string, type: ProjectType } }> = ({ children, initialProjectSettings }) => {
    const [state, dispatch] = useReducer(appReducer, initialProjectSettings, initializer);

    const debouncedSave = React.useRef(
      (stateToSave: AppState) => {
        const { history, runtimeState, visibleModalIds, selectedElementId, hoveredElementId, ...savableState } = stateToSave;
        localStorage.setItem('proverve-state', JSON.stringify(savableState));
      }
    ).current;
    
    const debouncedSaveRef = React.useRef<NodeJS.Timeout>();
    
    useEffect(() => {
        if(debouncedSaveRef.current) clearTimeout(debouncedSaveRef.current);
        debouncedSaveRef.current = setTimeout(() => {
            debouncedSave(state as AppState);
        }, 500);
    }, [state, debouncedSave]);

    useEffect(() => {
        dispatch({ type: 'INITIALIZE_RUNTIME_STATE', payload: { pageId: state.activePageId } });
    }, [state.activePageId, state.pages]);

    const undo = () => dispatch({ type: 'UNDO' });
    const redo = () => dispatch({ type: 'REDO' });
    const canUndo = state.history.past.length > 0;
    const canRedo = state.history.future.length > 0;
    const setSelectedElementId = (id: string | null) => dispatch({ type: 'SET_SELECTED_ELEMENT_ID', payload: id });
    const updateElement = (id: string, updates: DeepPartial<Element>) => dispatch({ type: 'UPDATE_ELEMENT', payload: { id, updates } });
    const setPreviewMode = (isPreview: boolean) => dispatch({ type: 'SET_PREVIEW_MODE', payload: isPreview });

    const contextValue = { state: state as DeepReadonly<AppState>, dispatch, undo, redo, canUndo, canRedo, setSelectedElementId, updateElement, setPreviewMode };
    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);