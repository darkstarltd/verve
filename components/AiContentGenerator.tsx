

import React, { useState } from 'react';
import { generateTextFromPrompt } from '../lib/ai';
import { MagicIcon } from './icons';
import { useIsMounted } from '../hooks/useIsMounted';

interface AiContentGeneratorProps {
  onGenerated: (text: string) => void;
  currentContent: string;
}

export const AiContentGenerator: React.FC<AiContentGeneratorProps> = ({ onGenerated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isMounted = useIsMounted();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const generatedText = await generateTextFromPrompt(prompt);
      if (isMounted.current) {
        onGenerated(generatedText);
        setIsOpen(false);
        setPrompt('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} title="Generate with AI" className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
        <MagicIcon />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg shadow-xl z-20 p-4 space-y-2">
          <label className="text-xs font-medium text-[var(--color-text-secondary)]">AI Content Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-[var(--color-surface)] rounded p-2 text-sm border border-[var(--color-border)] focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
            rows={3}
            placeholder="e.g., a catchy marketing slogan"
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-contrast)] text-sm font-bold py-1 rounded disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      )}
    </div>
  );
};