
import React, { useState } from 'react';
import { generateStylesFromPrompt } from '../lib/ai';
import { Element, Style } from '../types';
import { MagicIcon } from './icons';
import { useAppContext } from '../context/AppContext';
import { useIsMounted } from '../hooks/useIsMounted';

interface AiStyleAssistantProps {
  element: Element;
  onStylesGenerated: (styles: Style | string) => void;
  stylingMode?: 'css' | 'tailwind';
}

export const AiStyleAssistant: React.FC<AiStyleAssistantProps> = ({ element, onStylesGenerated, stylingMode }) => {
  const { state: { projectType } } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isMounted = useIsMounted();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const generatedStyles = await generateStylesFromPrompt(prompt, element.type, projectType, stylingMode);
      if (isMounted.current) {
        onStylesGenerated(generatedStyles);
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
        <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] text-sm font-medium rounded-md"
        >
            <span className="text-[var(--color-primary)]"><MagicIcon /></span> AI Style Assistant
        </button>
      
      {isOpen && (
        <div className="absolute bottom-full mb-2 w-full bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg shadow-xl z-20 p-4 space-y-2">
          <label className="text-xs font-medium text-[var(--color-text-secondary)]">Styling Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-[var(--color-surface)] rounded p-2 text-sm border border-[var(--color-border)] focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
            rows={3}
            placeholder="e.g., a modern, glassy button"
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-contrast)] text-sm font-bold py-1 rounded disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Apply Styles'}
          </button>
        </div>
      )}
    </div>
  );
};