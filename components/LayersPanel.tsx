
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Element, ProjectType } from '../types';
import { findElementDeep } from '../lib/treeUtils';
import { componentLibrary } from '../constants';
import { ChevronDownIcon } from './icons';

const getElementIcon = (element: Element, projectType: ProjectType) => {
    const lib = componentLibrary[projectType] || componentLibrary.web;
    const componentDef = lib.find(c => c.type === element.type);
    if (componentDef) return componentDef.icon;
    return '📄';
};

const findAncestors = (elements: Element[], elementId: string): string[] => {
    const path: string[] = [];
    const search = (els: Element[], targetId: string): boolean => {
        for (const el of els) {
            if (el.id === targetId) {
                return true;
            }
            if (el.children && el.children.length > 0) {
                path.push(el.id);
                if (search(el.children, targetId)) {
                    return true;
                }
                path.pop();
            }
        }
        return false;
    };
    search(elements, elementId);
    return path;
};

const TreeItem: React.FC<{
    element: Element;
    level: number;
    selectedId: string | null;
    expandedIds: Set<string>;
    onSelect: (id: string) => void;
    onToggleExpand: (id: string) => void;
}> = ({ element, level, selectedId, expandedIds, onSelect, onToggleExpand }) => {
    const { state: { projectType } } = useAppContext();
    const isSelected = element.id === selectedId;
    const hasChildren = element.children && element.children.length > 0;
    const isExpanded = expandedIds.has(element.id);
    const itemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isSelected) {
            itemRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [isSelected]);

    return (
        <div>
            <div
                ref={itemRef}
                onClick={() => onSelect(element.id)}
                className={`flex items-center p-1 rounded-md cursor-pointer ${
                    isSelected ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-[var(--color-surface-light)]'
                }`}
                style={{ paddingLeft: `${level * 16 + 4}px` }}
            >
                {hasChildren ? (
                    <button onClick={(e) => { e.stopPropagation(); onToggleExpand(element.id); }} className="mr-1 p-0.5 rounded hover:bg-white/10">
                        <ChevronDownIcon />
                    </button>
                ) : (
                    <span className="w-5 mr-1"></span>
                )}
                <span className="w-5 h-5 flex items-center justify-center mr-2 text-[var(--color-text-secondary)]">{getElementIcon(element, projectType)}</span>
                <span className="text-sm truncate">{element.name}</span>
            </div>
            {hasChildren && isExpanded && (
                <div>
                    {element.children.map(child => (
                        <TreeItem
                            key={child.id}
                            element={child}
                            level={level + 1}
                            selectedId={selectedId}
                            expandedIds={expandedIds}
                            onSelect={onSelect}
                            onToggleExpand={onToggleExpand}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const LayersPanel: React.FC = () => {
    const { state, setSelectedElementId } = useAppContext();
    const { pages, activePageId, selectedElementId, editingComponentId, customComponents } = state;

    const elementTree = useMemo(() => {
        const editingComponent = editingComponentId ? customComponents.find(c => c.id === editingComponentId) : null;
        if (editingComponent) return [editingComponent.mainElement];
        const activePage = pages.find(p => p.id === activePageId);
        return activePage?.elements || [];
    }, [pages, activePageId, editingComponentId, customComponents]);

    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (selectedElementId) {
            const ancestors = findAncestors(elementTree, selectedElementId);
            setExpandedIds(prev => new Set([...prev, ...ancestors]));
        }
    }, [selectedElementId, elementTree]);

    const handleToggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    return (
        <div className="p-2 space-y-1">
            {elementTree.map(element => (
                <TreeItem
                    key={element.id}
                    element={element}
                    level={0}
                    selectedId={selectedElementId}
                    expandedIds={expandedIds}
                    onSelect={setSelectedElementId}
                    onToggleExpand={handleToggleExpand}
                />
            ))}
        </div>
    );
};