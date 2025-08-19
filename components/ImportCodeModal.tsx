import React, { useState } from 'react';
import { CodeSnippet } from '../types';

export const ImportCodeModal: React.FC<{
  onClose: () => void;
  onSave: (snippet: Omit<CodeSnippet, 'id'> & { id?: string }) => void;
  editingSnippet: CodeSnippet | null;
}> = ({ onClose, onSave, editingSnippet }) => {
    const [name, setName] = useState(editingSnippet?.name || '');
    const [language, setLanguage] = useState(editingSnippet?.language || 'javascript');
    const [content, setContent] = useState(editingSnippet?.content || '');

    const handleSave = () => {
        if(name.trim() && content.trim()) {
            onSave({ id: editingSnippet?.id, name, language, content });
        }
    }

    return (
        <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-[var(--color-surface)] rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-[var(--color-border)]">
                    <h2 className="text-lg font-bold">{editingSnippet ? 'Edit' : 'Create'} Code Snippet</h2>
                </div>
                <div className="p-6 space-y-4">
                     <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Snippet Name" className="w-full bg-[var(--color-background)] p-2 rounded border border-[var(--color-border)]" />
                     <textarea value={content} onChange={e => setContent(e.target.value)} rows={10} placeholder="Paste your code here..." className="w-full bg-[var(--color-background)] p-2 rounded border border-[var(--color-border)] font-mono text-sm" />
                </div>
                <div className="p-4 bg-[var(--color-background)] rounded-b-lg flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-sm">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-md text-sm font-bold">Save Snippet</button>
                </div>
            </div>
        </div>
    );
};
