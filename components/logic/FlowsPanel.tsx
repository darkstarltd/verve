import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { LogicFlow } from '../../types';
import { PlusIcon } from '../icons';
import { v4 as uuidv4 } from 'uuid';

export const FlowsPanel: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { pages, activePageId } = state;
    const activePage = pages.find(p => p.id === activePageId);
    const flows = activePage?.logicFlows || [];

    const handleAddFlow = () => {
        const newFlow: LogicFlow = {
            id: uuidv4(),
            name: `New Flow ${flows.length + 1}`,
            nodes: [],
            connections: [],
        };
        dispatch({ type: 'ADD_LOGIC_FLOW', payload: { pageId: activePageId!, flow: newFlow } });
    };

    return (
        <div className="p-2">
            <div className="p-2 font-bold text-lg border-b border-[var(--color-border)] mb-2">
                Logic Flows
            </div>
            <button
                onClick={handleAddFlow}
                className="w-full mb-2 px-2 py-1.5 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] text-sm font-medium rounded-md flex items-center justify-center gap-2"
            >
                <PlusIcon size={14} /> Add New Flow
            </button>
            <div className="space-y-1">
                {flows.map(flow => (
                    <div
                        key={flow.id}
                        className="p-2 rounded-md cursor-pointer bg-[var(--color-surface-light)] hover:bg-[var(--color-border)]"
                    >
                        <span className="text-sm truncate">{flow.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};