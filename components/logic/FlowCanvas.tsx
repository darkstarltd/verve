import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { FlowNode } from './FlowNode';

export const FlowCanvas: React.FC = () => {
    const { state } = useAppContext();
    const { pages, activePageId } = state;
    const activePage = pages.find(p => p.id === activePageId);
    
    // For now, let's assume one active flow per page for simplicity
    const activeFlow = activePage?.logicFlows?.[0];

    return (
        <div className="w-full h-full bg-gray-800 relative overflow-hidden">
            {/* Render Connections (SVG layer) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Connection rendering logic would go here */}
            </svg>

            {/* Render Nodes */}
            {activeFlow ? activeFlow.nodes.map(node => (
                <FlowNode key={node.id} node={node} />
            )) : (
                 <div className="flex h-full items-center justify-center text-center text-[var(--color-text-tertiary)]">
                    <div>
                        <p>No active logic flow.</p>
                        <p className="text-sm">Select a flow or create a new one from the panel on the left.</p>
                    </div>
                </div>
            )}
        </div>
    );
};
