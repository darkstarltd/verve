import React, { useState } from 'react';
import { Element } from '../types';
import { generateImageFromPrompt } from '../lib/ai';
import { useAppContext } from '../context/AppContext';
import { UploadIcon, ImageIcon, MagicIcon } from './icons';
import { useIsMounted } from '../hooks/useIsMounted';

interface ImagePropertyEditorProps {
  selectedElement: Element;
  onPropChange: (prop: string, value: any) => void;
}

type Tab = 'assets' | 'url' | 'ai';

export const ImagePropertyEditor: React.FC<ImagePropertyEditorProps> = ({ selectedElement, onPropChange }) => {
  const { state: { assets } } = useAppContext();
  const [activeTab, setActiveTab] = useState<Tab>('assets');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isMounted = useIsMounted();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const imageUrl = await generateImageFromPrompt(prompt);
      if (isMounted.current) {
        onPropChange('src', imageUrl);
        onPropChange('alt', prompt);
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
    <div className="bg-[var(--color-surface-light)]/50 rounded-lg">
        <div className="flex border-b border-[var(--color-border)]">
            <button onClick={() => setActiveTab('assets')} className={`flex-1 text-sm py-2 rounded-tl-lg flex items-center justify-center gap-2 ${activeTab === 'assets' ? 'bg-[var(--color-surface-light)]' : 'hover:bg-[var(--color-border)]'}`}><ImageIcon/> Assets</button>
            <button onClick={() => setActiveTab('url')} className={`flex-1 text-sm py-2 flex items-center justify-center gap-2 ${activeTab === 'url' ? 'bg-[var(--color-surface-light)]' : 'hover:bg-[var(--color-border)]'}`}>URL</button>
            <button onClick={() => setActiveTab('ai')} className={`flex-1 text-sm py-2 rounded-tr-lg flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'bg-[var(--color-surface-light)]' : 'hover:bg-[var(--color-border)]'}`}><MagicIcon/> AI</button>
        </div>
        <div className="p-4">
            {activeTab === 'assets' && (
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Project Assets</h4>
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                        {assets.map(asset => (
                            <div key={asset.id} onClick={() => onPropChange('src', asset.url)} className="cursor-pointer aspect-square rounded-md overflow-hidden ring-2 ring-transparent hover:ring-[var(--color-primary)]">
                                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover"/>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {activeTab === 'url' && (
                 <>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Image URL</label>
                      <input
                        type="text"
                        value={selectedElement.props?.src || ''}
                        onChange={(e) => onPropChange('src', e.target.value)}
                        className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm text-white border border-[var(--color-border)]"
                      />
                    </div>
                     <div className="mt-2">
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Alt Text</label>
                      <input
                        type="text"
                        value={selectedElement.props?.alt || ''}
                        onChange={(e) => onPropChange('alt', e.target.value)}
                        className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm text-white border border-[var(--color-border)]"
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
                            className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm text-white border border-[var(--color-border)]"
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