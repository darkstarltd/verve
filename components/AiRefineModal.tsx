import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useIsMounted } from '../hooks/useIsMounted';

interface AiRefineModalProps {
  onClose: () => void;
  onGenerate: (prompt: string) => Promise<void>;
}

export const AiRefineModal: React.FC<AiRefineModalProps> = ({ onClose, onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useIsMounted();
  
  const examplePrompts = [
    "Make the button blue with rounded corners.",
    "Change the text to be more professional.",
    "Add a subtle shadow and increase padding.",
    "Make it look like a modern startup's hero section.",
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please describe the changes you want to make.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await onGenerate(prompt);
    } catch (e: any) {
      if (isMounted.current) {
        setError(e.message || 'Failed to refine element. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[var(--color-surface)] rounded-lg shadow-xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2"><Sparkles className="text-[var(--color-primary)]" size={20} /> AI Element Refinement</h2>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-white">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="ai-refine-prompt" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Describe the changes:</label>
            <textarea
              id="ai-refine-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-md p-3 text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              rows={4}
              placeholder="e.g., 'Make this text larger and bold'"
              disabled={isLoading}
              autoFocus
            />
          </div>
          <div>
            <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">Examples:</h4>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((p, i) => (
                <button key={i} onClick={() => setPrompt(p)} disabled={isLoading} className="text-xs bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] text-[var(--color-text-secondary)] px-3 py-1 rounded-full transition-colors">
                  {p}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-[var(--color-danger)] text-sm">{error}</p>}
        </div>
        <div className="p-4 border-t border-[var(--color-border)] flex justify-end">
          <button 
            onClick={handleGenerate} 
            disabled={isLoading || !prompt.trim()}
            className="px-6 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-contrast)] font-bold rounded-md text-sm transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
          >
            {isLoading ? 'Applying...' : 'Apply Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
