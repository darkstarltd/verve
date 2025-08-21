import React from 'react';
import { CodeSnippet } from '../types';
import { useAppContext } from '../context/AppContext';
import { Plus, FileCode } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';

const DraggableSnippet: React.FC<{
    snippet: CodeSnippet;
    children: React.ReactNode;
}> = ({ snippet, children }) => {
    const { state: { previewMode } } = useAppContext();
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: `code-snippet-${snippet.id}`,
        data: {
            snippetId: snippet.id,
            isSnippet: true,
        },
        disabled: previewMode,
    });

    return (
        <div ref={setNodeRef} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
            {children}
        </div>
    );
};


export const CodePanel: React.FC<{
  onAddSnippet: () => void;
  onEditSnippet: (snippet: CodeSnippet) => void;
}> = ({ onAddSnippet, onEditSnippet }) => {
    const { state: { codeSnippets } } = useAppContext();
    return (
        <div className="p-2">
            <button onClick={onAddSnippet} className="w-full mb-2 px-4 py-2 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] text-sm font-medium rounded-md flex items-center justify-center gap-2">
                <Plus /> Add Snippet
            </button>
            <div className="space-y-2">
            {codeSnippets.map(snippet => (
                <DraggableSnippet key={snippet.id} snippet={snippet}>
                    <div onClick={() => onEditSnippet(snippet)} className="p-3 bg-[var(--color-surface-light)] rounded-md cursor-pointer hover:bg-[var(--color-border)] flex items-center gap-3">
                        <div className="w-5 h-5 flex items-center justify-center text-[var(--color-primary)]"><FileCode size={20}/></div>
                        <div>
                            <p className="font-semibold text-sm">{snippet.name}</p>
                            <p className="text-xs text-[var(--color-text-secondary)]">{snippet.language}</p>
                        </div>
                    </div>
                </DraggableSnippet>
            ))}
            </div>
        </div>
    );
};
