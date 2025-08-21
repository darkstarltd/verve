import React from 'react';
import { FlowNode as FlowNodeType } from '../../types';

export const FlowNode: React.FC<{ node: FlowNodeType }> = ({ node }) => {
    // Dnd-kit's useDraggable would be used here
    const style = {
        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
    };

    return (
        <div
            className="absolute bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg shadow-lg cursor-move"
            style={style}
        >
            <div className="font-bold bg-[var(--color-surface)] px-3 py-2 rounded-t-lg">
                {node.name}
            </div>
            <div className="p-3 text-sm flex gap-4">
                {/* Inputs */}
                <div className="space-y-2">
                    {node.inputs.map(input => (
                        <div key={input.id} className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-500 rounded-full ring-2 ring-gray-700" />
                            <span>{input.name}</span>
                        </div>
                    ))}
                </div>
                {/* Outputs */}
                <div className="space-y-2">
                     {node.outputs.map(output => (
                        <div key={output.id} className="flex items-center gap-2 justify-end">
                            <span>{output.name}</span>
                            <div className="w-3 h-3 bg-gray-500 rounded-full ring-2 ring-gray-700" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
