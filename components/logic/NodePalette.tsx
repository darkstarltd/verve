import React from 'react';
import { Zap, LogIn, Edit, AlertTriangle, Send } from 'lucide-react';

const PALETTE_NODES = [
    { type: 'on-trigger', name: 'On Trigger', icon: <Zap size={16}/>, category: 'Events' },
    { type: 'set-state', name: 'Set State', icon: <Edit size={16}/>, category: 'Actions' },
    { type: 'api-request', name: 'API Request', icon: <Send size={16}/>, category: 'Actions' },
    { type: 'condition', name: 'If/Else', icon: <AlertTriangle size={16}/>, category: 'Logic' },
    { type: 'log-message', name: 'Log Message', icon: <LogIn size={16}/>, category: 'Debugging' },
];

const DraggableNode: React.FC<{ node: typeof PALETTE_NODES[0] }> = ({ node }) => {
    // Dnd-kit's useDraggable would be used here in a real implementation
    return (
        <div 
            className="p-2 text-sm bg-[var(--color-surface-light)] rounded-md cursor-grab active:cursor-grabbing hover:bg-[var(--color-border)] flex items-center gap-2"
            title={`Drag to add ${node.name}`}
        >
            <span className="text-[var(--color-primary)]">{node.icon}</span>
            <span className="truncate">{node.name}</span>
        </div>
    );
};

export const NodePalette: React.FC = () => {
    return (
        <div className="p-2">
            <div className="p-2 font-bold text-lg border-b border-[var(--color-border)] mb-2">
                Nodes
            </div>
            <div className="space-y-2">
                {PALETTE_NODES.map(node => (
                    <DraggableNode key={node.type} node={node} />
                ))}
            </div>
        </div>
    );
};
