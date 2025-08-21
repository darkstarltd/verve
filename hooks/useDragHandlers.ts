import React, { useState } from 'react';
import { DragEndEvent, DragOverEvent, DragStartEvent, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../context/AppContext';
import { Element, Template, Asset, CustomComponent, ComponentDefinition } from '../types';
import { componentLibrary, createDefaultElement } from '../constants';
import { TEMPLATES } from '../lib/templates';
import { findElementDeep } from '../lib/treeUtils';
import { RenderElement } from '../components/RenderElement';

export const useDragHandlers = () => {
    const { state, dispatch } = useAppContext();
    const { pages, activePageId, editingComponentId, customComponents, codeSnippets, assets, projectType } = state;
    
    const [activeId, setActiveId] = useState<string | null>(null);
    const [draggedTemplate, setDraggedTemplate] = useState<Template | null>(null);
    const [draggedAsset, setDraggedAsset] = useState<Asset | null>(null);
    const [dropIndicator, setDropIndicator] = useState<{ parentId: string | null; index: number } | null>(null);

    const activePage = pages.find(p => p.id === activePageId) || pages[0];
    const editingComponent = editingComponentId ? customComponents.find(c => c.id === editingComponentId) : null;
    const elementTree = editingComponent ? [editingComponent.mainElement] : (activePage?.elements || []);
    const BASE_COMPONENT_LIBRARY: ComponentDefinition[] = componentLibrary[projectType] || componentLibrary.web;

    const sensors = useSensors(
        useSensor(MouseSensor), useSensor(TouchSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
        if (event.active.data.current?.isTemplate) {
            const templateIndex = event.active.data.current?.templateIndex as number;
            setDraggedTemplate(TEMPLATES[templateIndex]);
        } else if (event.active.data.current?.isAsset) {
            const assetId = event.active.data.current?.assetId as string;
            setDraggedAsset(assets.find(a => a.id === assetId));
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { over } = event;
        if (!over) { setDropIndicator(null); return; }
        const overId = over.id as string;

        if (overId === 'canvas-droppable-area') {
            setDropIndicator({ parentId: null, index: elementTree.length });
            return;
        }

        const { element: overElement, parent } = findElementDeep(elementTree, overId);
        if (!overElement) { setDropIndicator(null); return; }

        const isContainer = overElement.children !== undefined || overElement.type === 'slot';
        if (isContainer) {
            setDropIndicator({ parentId: overId, index: overElement.children?.length || 0 });
        } else {
            const siblings = parent?.children || elementTree;
            const index = siblings.findIndex(e => e.id === overId);
            setDropIndicator({ parentId: parent?.id || null, index });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        setDraggedTemplate(null);
        setDraggedAsset(null);
        const { over, active } = event;

        if (!over || !dropIndicator) {
            setDropIndicator(null);
            return;
        }

        const activeId = active.id as string;
        
        if (active.data.current?.isAsset) {
            const asset = assets.find(a => a.id === active.data.current?.assetId);
            if (asset) {
                const imageTemplate = BASE_COMPONENT_LIBRARY.find(c => c.type === 'image')?.defaultElement;
                if (imageTemplate) {
                    const newElement = createDefaultElement({ ...imageTemplate, props: { ...imageTemplate.props, src: asset.url, alt: asset.name } });
                    dispatch({ type: 'ADD_ELEMENT', payload: { parentId: dropIndicator.parentId, index: dropIndicator.index, element: newElement } });
                }
            }
        } else if (active.data.current?.isTemplate) {
            const template = TEMPLATES[active.data.current.templateIndex as number];
            if (template) {
                const newElements = template.elements.map(createDefaultElement);
                dispatch({ type: 'ADD_ELEMENTS', payload: { parentId: dropIndicator.parentId, index: dropIndicator.index, elements: newElements } });
            }
        } else if (activeId.startsWith('component-')) {
            const component = BASE_COMPONENT_LIBRARY.find(c => c.type === active.data.current?.type);
            if (component) {
                const newElement = createDefaultElement(component.defaultElement);
                dispatch({ type: 'ADD_ELEMENT', payload: { parentId: dropIndicator.parentId, index: dropIndicator.index, element: newElement } });
            }
        } else if (activeId.startsWith('custom-component-')) {
            const customComponent = customComponents.find(c => c.id === active.data.current?.componentId);
            if (customComponent) {
                const newElement: Element = {
                    id: uuidv4(),
                    type: 'component-instance',
                    name: customComponent.name,
                    componentId: customComponent.id,
                    styles: { desktop: {} },
                    props: {},
                    children: [] // Instances can have children to put into slots
                };
                dispatch({ type: 'ADD_ELEMENT', payload: { parentId: dropIndicator.parentId, index: dropIndicator.index, element: newElement } });
            }
        } else if (activeId.startsWith('code-snippet-')) {
            const snippet = codeSnippets.find(s => s.id === active.data.current?.snippetId);
            if (snippet) {
                const newElement: Element = {
                    id: uuidv4(), type: 'custom-code', name: `Snippet: ${snippet.name}`, snippetId: snippet.id,
                    styles: { desktop: { padding: '10px', minHeight: '50px', border: '1px dashed var(--color-border)' } },
                };
                dispatch({ type: 'ADD_ELEMENT', payload: { parentId: dropIndicator.parentId, index: dropIndicator.index, element: newElement } });
            }
        } else if (activeId !== over.id) {
            dispatch({ type: 'MOVE_ELEMENT', payload: { activeId, targetParentId: dropIndicator.parentId, targetIndex: dropIndicator.index } });
        }
        setDropIndicator(null);
    };

    const { element: activeElement } = activeId ? findElementDeep(elementTree, activeId) : { element: null };
    const draggedComponent = activeId && activeId.startsWith('component-') ? BASE_COMPONENT_LIBRARY.find(c => `component-${c.type}` === activeId) : null;
    const draggedCustomComponent = activeId && activeId.startsWith('custom-component-') ? customComponents.find(c => `custom-component-${c.id}` === activeId) : null;

    const draggedItemOverlay = activeId
      ? draggedComponent
        ? React.createElement(
            'div',
            { className: 'p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg flex items-center gap-2' },
            draggedComponent.icon,
            ' ',
            React.createElement('span', null, draggedComponent.name)
          )
        : draggedCustomComponent
        ? React.createElement(
            'div',
            { className: 'p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg flex items-center gap-2' },
            React.createElement('span', null, draggedCustomComponent.name)
          )
        : draggedTemplate
        ? React.createElement(
            'div',
            { className: 'p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg flex items-center gap-2' },
            draggedTemplate.icon,
            ' ',
            React.createElement('span', null, draggedTemplate.name)
          )
        : draggedAsset
        ? React.createElement('img', {
            src: draggedAsset.url,
            alt: 'dragged asset',
            className: 'w-24 h-24 object-cover rounded-lg shadow-lg',
          })
        : activeElement
        ? React.createElement(RenderElement, {
            element: activeElement,
            isSelected: false,
            isDragOverlay: true,
            onContextMenu: () => {},
            mode: 'edit',
          })
        : null
      : null;

    return {
        sensors,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        draggedItemOverlay,
        dropIndicator
    };
};