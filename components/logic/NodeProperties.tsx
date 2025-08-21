import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { SlidersIcon } from '../icons';

export const NodeProperties: React.FC = () => {
    // In a real implementation, this would get the currently selected node
    const selectedNode = null;

    if (!selectedNode) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="text-5xl text-[var(--color-text-tertiary)] mb-4"><SlidersIcon /></div>
                <h3 className="font-bold text-lg">Node Properties</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">Select a node on the canvas to see its properties.</p>
            </div>
        );
    }
    
    return (
        <div className="p-4">
            <h3 className="font-bold text-lg">{(selectedNode as any).name}</h3>
            {/* Dynamic property fields based on node type would be rendered here */}
        </div>
    );
};
