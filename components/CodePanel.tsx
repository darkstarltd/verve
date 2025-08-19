import React from 'react';
import { CodeSnippet } from '../types';
import { useAppContext } from '../context/AppContext';
import { PlusIcon } from './icons';

export const CodePanel: React.FC<{
  onAddSnippet: () => void;
  onEditSnippet: (snippet: CodeSnippet) => void;
}> = ({ onAddSnippet, onEditSnippet }) => {
    const { state: { codeSnippets } } = useAppContext();
    return (
        <div className="p-2">
            <button onClick={onAddSnippet} className="w-full mb-2 px-4 py-2 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] text-sm font-medium rounded-md flex items-center justify-center gap-2">
                <PlusIcon /> Add Snippet
            </button>
            <div className="space-y-2">
            {codeSnippets.map(snippet => (
                <div key={snippet.id} onClick={() => onEditSnippet(snippet)} className="p-2 bg-[var(--color-surface-light)] rounded-md cursor-pointer hover:bg-[var(--color-border)]">
                    <p className="font-semibold text-sm">{snippet.name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{snippet.language}</p>
                </div>
            ))}
            </div>
        </div>
    );
};
