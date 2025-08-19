import React from 'react';
import { Element, ActionStep, ActionType } from '../types';
import { CollapsibleSection } from './StylePropertyEditor';
import { useAppContext } from '../context/AppContext';
import { PlusIcon, TrashIcon } from './icons';

interface InteractionsPropertyEditorProps {
  element: Element;
  onUpdate: (interactions: ActionStep[]) => void;
}

const findModalsRecursive = (elements: Element[]): Element[] => {
    let modals: Element[] = [];
    for (const el of elements) {
        if (el.type === 'modal') {
            modals.push(el);
        }
        if (el.children) {
            modals = modals.concat(findModalsRecursive(el.children));
        }
    }
    return modals;
};

export const InteractionsPropertyEditor: React.FC<InteractionsPropertyEditorProps> = ({ element, onUpdate }) => {
    const { state: { pages, activePageId } } = useAppContext();
    const activePage = pages.find(p => p.id === activePageId);
    const stateVariables = activePage?.stateDefinition || [];
    const modals = activePage ? findModalsRecursive(activePage.elements) : [];
    const interactions = element.interactions || [];

    const handleAddAction = () => {
        const newAction: ActionStep = { type: 'navigate_to_page', payload: {} };
        onUpdate([...interactions, newAction]);
    };
    
    const handleUpdateAction = (index: number, updates: Partial<ActionStep>) => {
        const newInteractions = [...interactions];
        newInteractions[index] = { ...newInteractions[index], ...updates };
        onUpdate(newInteractions);
    };

    const handleUpdatePayload = (index: number, payloadUpdates: Partial<ActionStep['payload']>) => {
        const newInteractions = [...interactions];
        newInteractions[index].payload = { ...newInteractions[index].payload, ...payloadUpdates };
        onUpdate(newInteractions);
    };
    
    const handleDeleteAction = (index: number) => {
        const newInteractions = interactions.filter((_, i) => i !== index);
        onUpdate(newInteractions);
    };

    const renderPayloadEditor = (action: ActionStep, index: number) => {
        switch (action.type) {
            case 'set_state':
            case 'increment_state':
            case 'decrement_state':
            case 'toggle_state':
                return (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <select
                            value={action.payload.stateKey || ''}
                            onChange={(e) => handleUpdatePayload(index, { stateKey: e.target.value })}
                            className="bg-[var(--color-background)] p-1 rounded text-xs"
                        >
                            <option value="">Select State</option>
                            {stateVariables.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                        </select>
                        {action.type === 'set_state' && (
                             <input
                                type="text"
                                value={action.payload.value as string ?? ''}
                                onChange={(e) => handleUpdatePayload(index, { value: e.target.value })}
                                placeholder="Value"
                                className="bg-[var(--color-background)] p-1 rounded text-xs"
                            />
                        )}
                    </div>
                );
            case 'navigate_to_page':
                 return (
                    <select
                        value={action.payload.pageId || ''}
                        onChange={(e) => handleUpdatePayload(index, { pageId: e.target.value })}
                        className="bg-[var(--color-background)] p-1 rounded text-xs mt-2 w-full"
                    >
                        <option value="">Select Page</option>
                        {pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                );
            case 'open_url':
                 return <input type="text" value={action.payload.url || ''} onChange={(e) => handleUpdatePayload(index, { url: e.target.value })} placeholder="https://example.com" className="bg-[var(--color-background)] p-1 rounded text-xs mt-2 w-full" />;
            case 'show_modal':
            case 'hide_modal':
            case 'toggle_modal':
                return (
                    <select
                        value={action.payload.modalId || ''}
                        onChange={(e) => handleUpdatePayload(index, { modalId: e.target.value })}
                        className="bg-[var(--color-background)] p-1 rounded text-xs mt-2 w-full"
                    >
                        <option value="">Select Modal</option>
                        {modals.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                );
            default:
                return null;
        }
    };

    return (
        <CollapsibleSection title="Interactions (On Click)">
            <div className="space-y-2">
                {interactions.map((action, index) => (
                    <div key={index} className="bg-[var(--color-surface-light)] p-2 rounded-md">
                        <div className="flex items-center gap-2">
                            <select
                                value={action.type}
                                onChange={(e) => handleUpdateAction(index, { type: e.target.value as ActionType, payload: {} })}
                                className="flex-1 bg-[var(--color-background)] p-1 rounded text-sm"
                            >
                                <optgroup label="Navigation">
                                    <option value="navigate_to_page">Navigate to Page</option>
                                    <option value="open_url">Open URL</option>
                                </optgroup>
                                <optgroup label="State Management">
                                    <option value="set_state">Set State</option>
                                    <option value="increment_state">Increment State</option>
                                    <option value="decrement_state">Decrement State</option>
                                    <option value="toggle_state">Toggle State</option>
                                </optgroup>
                                <optgroup label="Modals">
                                    <option value="show_modal">Show Modal</option>
                                    <option value="hide_modal">Hide Modal</option>
                                    <option value="toggle_modal">Toggle Modal</option>
                                </optgroup>
                            </select>
                            <button onClick={() => handleDeleteAction(index)} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
                        </div>
                        {renderPayloadEditor(action, index)}
                    </div>
                ))}
                <button onClick={handleAddAction} className="w-full text-xs text-center p-1 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] rounded-md flex items-center justify-center gap-1">
                    <PlusIcon /> Add Action
                </button>
            </div>
        </CollapsibleSection>
    );
};
