import React, { useState } from 'react';
import { CodeSnippet } from '../types';
import { Sparkles } from 'lucide-react';

export const ImportCodeModal: React.FC<{
  onClose: () => void;
  onSave: (snippet: Omit<CodeSnippet, 'id'> & { id?: string }) => void;
  editingSnippet: CodeSnippet | null;
  onAiGenerate: (prompt: string, language: string) => Promise<string>;
}> = ({ onClose, onSave, editingSnippet, onAiGenerate }) => {
    const [name, setName] = useState(editingSnippet?.name || '');
    const [language, setLanguage] = useState(editingSnippet?.language || 'javascript');
    const [content, setContent] = useState(editingSnippet?.content || '');
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleSave = () => {
        if(name.trim() && content.trim()) {
            onSave({ id: editingSnippet?.id, name, language, content });
        }
    }
    
    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);
        try {
            const generatedCode = await onAiGenerate(aiPrompt, language);
            setContent(generatedCode);
        } catch(e) {
            // Error is handled by caller
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-[var(--color-surface)] rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-[var(--color-border)]">
                    <h2 className="text-lg font-bold">{editingSnippet ? 'Edit' : 'Create'} Code Snippet</h2>
                </div>
                <div className="p-6 space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                         <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Snippet Name" className="w-full bg-[var(--color-background)] p-2 rounded border border-[var(--color-border)]" />
                         <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-[var(--color-background)] p-2 rounded border border-[var(--color-border)]">
                            <option value="html">HTML</option>
                            <option value="javascript">JavaScript</option>
                         </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-medium text-[var(--color-text-secondary)]">AI Code Generation</label>
                        <div className="flex gap-2">
                            <input type="text" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="Describe the code you need..." className="w-full bg-[var(--color-background)] p-2 rounded border border-[var(--color-border)]" />
                            <button onClick={handleAiGenerate} disabled={isGenerating} className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-md text-sm font-bold flex items-center gap-2 disabled:opacity-50">
                                <Sparkles size={16}/> {isGenerating ? '...' : 'Generate'}
                            </button>
                        </div>
                     </div>
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