
import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Element, ProjectType, DeepReadonly } from '../types';
import { componentLibrary } from '../constants';
import { ChevronDown, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const getElementIcon = (element: DeepReadonly<Element>, projectType: ProjectType) => {
    const lib = componentLibrary[projectType] || componentLibrary.web;
    const componentDef = lib.find(c => c.type === element.type);
    if (componentDef) return componentDef.icon;
    return '📄';
};

const findAncestors = (elements: readonly Element[], elementId: string): string[] => {
    const path: string[] = [];
    const search = (els: readonly Element[], targetId: string): boolean => {
        for (const el of els) {
            if (el.id === targetId) return true;
            if (el.children && el.children.length > 0) {
                path.push(el.id);
                if (search(el.children, targetId)) return true;
                path.pop();
            }
        }
        return false;
    };
    search(elements, elementId);
    return path;
};

const SortableTreeItem: React.FC<{
    element: DeepReadonly<Element>;
    level: number;
    selectedId: string | null;
    expandedIds: Set<string>;
    onSelect: (id: string) => void;
    onToggleExpand: (id: string) => void;
}> = ({ element, level, selectedId, expandedIds, onSelect, onToggleExpand }) => {
    const { state: { projectType }, dispatch } = useAppContext();
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: element.id });
    
    const style = { transform: CSS.Transform.toString(transform), transition };
    const isSelected = element.id === selectedId;
    const hasChildren = element.children && element.children.length > 0;
    const isExpanded = expandedIds.has(element.id);

    const toggleLocked = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({ type: 'UPDATE_ELEMENT', payload: { id: element.id, updates: { isLocked: !element.isLocked } } });
    };

    const toggleHidden = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({ type: 'UPDATE_ELEMENT', payload: { id: element.id, updates: { isHidden: !element.isHidden } } });
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <div
                onClick={() => onSelect(element.id)}
                className={`group flex items-center p-1 rounded-md cursor-pointer ${
                    isSelected ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-[var(--color-surface-light)]'
                } ${element.isHidden ? 'opacity-50' : ''}`}
                style={{ paddingLeft: `${level * 16 + 4}px` }}
            >
                <span {...listeners} className="cursor-grab touch-none p-1 mr-1"><ChevronDown size={12}/></span>
                {hasChildren ? (
                    <button onClick={(e) => { e.stopPropagation(); onToggleExpand(element.id); }} className="p-0.5 rounded hover:bg-white/10">
                        <ChevronDown size={12} className={`transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                    </button>
                ) : (
                    <span className="w-4"></span>
                )}
                <span className="w-5 h-5 flex items-center justify-center mr-2 text-[var(--color-text-secondary)]">{getElementIcon(element, projectType)}</span>
                <span className="text-sm truncate flex-1">{element.name}</span>
                <div className="hidden group-hover:flex items-center gap-1 pr-1">
                    <button onClick={toggleLocked} title={element.isLocked ? 'Unlock' : 'Lock'}>{element.isLocked ? <Lock size={14}/> : <Unlock size={14}/>}</button>
                    <button onClick={toggleHidden} title={element.isHidden ? 'Show' : 'Hide'}>{element.isHidden ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
                </div>
            </div>
            {hasChildren && isExpanded && (
                <SortableContext items={element.children.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    {element.children.map(child => (
                        <SortableTreeItem
                            key={child.id} element={child} level={level + 1} selectedId={selectedId}
                            expandedIds={expandedIds} onSelect={onSelect} onToggleExpand={onToggleExpand}
                        />
                    ))}
                </SortableContext>
            )}
        </div>
    );
};


const flattenTree = (elements: readonly Element[]): { element: DeepReadonly<Element>, parentId: string | null }[] => {
    let result: { element: DeepReadonly<Element>, parentId: string | null }[] = [];
    const recurse = (els: readonly Element[], parentId: string | null) => {
        for (const el of els) {
            result.push({ element: el, parentId });
            if (el.children) recurse(el.children, el.id);
        }
    };
    recurse(elements, null);
    return result;
};


export const LayersPanel: React.FC = () => {
    const { state, setSelectedElementId, dispatch } = useAppContext();
    const { pages, activePageId, selectedElementId, editingComponentId, customComponents } = state;

    const elementTree = useMemo(() => {
        const editingComponent = editingComponentId ? customComponents.find(c => c.id === editingComponentId) : null;
        if (editingComponent) return [editingComponent.mainElement];
        const activePage = pages.find(p => p.id === activePageId);
        return activePage?.elements || [];
    }, [pages, activePageId, editingComponentId, customComponents]);
    
    const flattenedElements = useMemo(() => flattenTree(elementTree).map(item => item.element), [elementTree]);

    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (selectedElementId) {
            const ancestors = findAncestors(elementTree, selectedElementId);
            setExpandedIds(prev => new Set([...prev, ...ancestors, selectedElementId]));
        }
    }, [selectedElementId, elementTree]);

    const handleToggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
            return newSet;
        });
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id && over) {
            const flatTreeWithParents = flattenTree(elementTree);
            const overItem = flatTreeWithParents.find(item => item.element.id === over.id);

            if (overItem) {
                const targetParentId = overItem.parentId;
                const siblings = targetParentId
                    ? flatTreeWithParents.find(item => item.element.id === targetParentId)!.element.children!
                    : elementTree;
                const targetIndex = siblings.findIndex(el => el.id === over.id);

                dispatch({
                    type: 'MOVE_ELEMENT',
                    payload: { activeId: active.id as string, targetParentId, targetIndex }
                });
            }
        }
    };

    return (
        <div className="p-2 space-y-1">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={flattenedElements.map(e => e.id)} strategy={verticalListSortingStrategy}>
                    {elementTree.map(element => (
                        <SortableTreeItem
                            key={element.id} element={element} level={0} selectedId={selectedElementId}
                            expandedIds={expandedIds} onSelect={setSelectedElementId} onToggleExpand={handleToggleExpand}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
};