import React, { useState } from 'react';
import { FileNode } from '../types';
import { ChevronDown, FileText, Folder } from 'lucide-react';
import { getIconForFile } from '../lib/file-icons';

interface FileTreeViewProps {
    nodes: readonly FileNode[];
    onSelect: (file: FileNode | null) => void;
    selectedFile: FileNode | null;
}

const TreeNode: React.FC<{
    node: FileNode;
    level: number;
    onSelect: (file: FileNode) => void;
    selectedFile: FileNode | null;
}> = ({ node, level, onSelect, selectedFile }) => {
    const [isOpen, setIsOpen] = useState(true);
    const isFolder = node.type === 'folder';
    const isSelected = selectedFile?.name === node.name && selectedFile?.content === node.content;

    const handleToggle = () => {
        if (isFolder) setIsOpen(!isOpen);
        else onSelect(node);
    };

    const icon = isFolder ? <Folder size={16} className="text-yellow-500" /> : getIconForFile(node.name);

    return (
        <div>
            <div
                onClick={handleToggle}
                className={`flex items-center gap-2 p-1 rounded-md cursor-pointer ${isSelected ? 'bg-[var(--color-primary)]' : 'hover:bg-[var(--color-surface-light)]'}`}
                style={{ paddingLeft: `${level * 16 + (isFolder ? 0 : 20)}px` }}
            >
                {isFolder && <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`} />}
                <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
                <span className="truncate">{node.name}</span>
            </div>
            {isFolder && isOpen && node.children && (
                <div>
                    {node.children.map(child => (
                        <TreeNode key={child.name} node={child} level={level + 1} onSelect={onSelect} selectedFile={selectedFile} />
                    ))}
                </div>
            )}
        </div>
    );
};


export const FileTreeView: React.FC<FileTreeViewProps> = ({ nodes, onSelect, selectedFile }) => {
    return (
        <div className="text-sm">
            {nodes.map(node => (
                <TreeNode key={node.name} node={node} level={0} onSelect={onSelect} selectedFile={selectedFile} />
            ))}
        </div>
    );
};