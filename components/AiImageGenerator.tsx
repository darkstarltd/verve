
import React, { useState } from 'react';
import { Element } from '../types';
import { generateImageFromPrompt } from '../lib/ai';

interface AiImageGeneratorProps {
  selectedElement: Element;
  onPropChange: (prop: string, value: any) => void;
}

type Tab = 'upload' | 'ai';

export const AiImageGenerator: React.FC<AiImageGeneratorProps> = ({ selectedElement, onPropChange }) => {
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const imageUrl = await generateImageFromPrompt(prompt);
      onPropChange('src', imageUrl);
      onPropChange('alt', prompt); // Use prompt as alt text
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[var(--color-surface-light)]/50 rounded-lg">
        <div className="flex border-b border-[var(--color-border)]">
            <button onClick={() => setActiveTab('upload')} className={`flex-1 text-sm py-2 rounded-tl-lg ${activeTab === 'upload' ? 'bg-[var(--color-surface-light)]' : 'hover:bg-[var(--color-border)]'}`}>URL</button>
            <button onClick={() => setActiveTab('ai')} className={`flex-1 text-sm py-2 rounded-tr-lg ${activeTab === 'ai' ? 'bg-[var(--color-surface-light)]' : 'hover:bg-[var(--color-border)]'}`}>AI Generate</button>
        </div>
        <div className="p-4">
            {activeTab === 'upload' && (
                 <>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Image URL</label>
                      <input
                        type="text"
                        value={selectedElement.props?.src || ''}
                        onChange={(e) => onPropChange('src', e.target.value)}
                        className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm text-white border border-[var(--color-border)] focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                      />
                    </div>
                     <div className="mt-2">
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Alt Text</label>
                      <input
                        type="text"
                        value={selectedElement.props?.alt || ''}
                        onChange={(e) => onPropChange('alt', e.target.value)}
                        className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm text-white border border-[var(--color-border)] focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                      />
                    </div>
                  </>
            )}
            {activeTab === 'ai' && (
                <div className="space-y-3">
                     <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Describe the image you want</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm text-white border border-[var(--color-border)] focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                            rows={3}
                            placeholder="e.g., A photorealistic cat wearing sunglasses"
                        />
                    </div>
                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading}
                        className="w-full px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-contrast)] font-bold rounded-md text-sm disabled:opacity-50 disabled:cursor-wait"
                    >
                        {isLoading ? 'Generating...' : 'Generate Image'}
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};