
import React, { useState, useRef } from 'react';
import { MagicIcon, ImageUpIcon } from './icons';
import { useIsMounted } from '../hooks/useIsMounted';

interface AiGenerateModalProps {
  onClose: () => void;
  onGenerate: (prompt: string, image?: string) => Promise<void>;
}

export const AiGenerateModal: React.FC<AiGenerateModalProps> = ({ onClose, onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMounted = useIsMounted();
  
  const examplePrompts = [
    "A modern landing page for a new mobile app that sells coffee.",
    "A simple portfolio website for a photographer.",
    "A product page for a futuristic smart watch.",
    "A 'coming soon' page for a tech startup.",
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() && !image) {
      setError('Please describe what you want to create or upload an image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await onGenerate(prompt, image || undefined);
    } catch (e: any) {
      if (isMounted.current) {
        setError(e.message || 'Failed to generate layout. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            setImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[var(--color-surface)] rounded-lg shadow-xl w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2"><span className="text-[var(--color-primary)]"><MagicIcon /></span> Generate with AI</h2>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-white">&times;</button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-6">
            <div className="space-y-4">
                 <div>
                    <label htmlFor="ai-prompt" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">1. Describe your layout (optional)</label>
                    <textarea
                      id="ai-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)}
                      className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-md p-3 text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                      rows={6} placeholder="e.g., A clean and simple blog layout with a sidebar..."
                      disabled={isLoading}
                    />
                  </div>
                   <div>
                    <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">Or try an example:</h4>
                    <div className="flex flex-wrap gap-2">
                      {examplePrompts.slice(0,2).map((p, i) => (
                        <button key={i} onClick={() => setPrompt(p)} disabled={isLoading} className="text-xs bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] text-[var(--color-text-secondary)] px-3 py-1 rounded-full transition-colors">
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
            </div>
            <div className="space-y-4">
                 <label htmlFor="ai-image-upload" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">2. Upload a design or sketch</label>
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                 <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-48 border-2 border-dashed border-[var(--color-border)] rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-[var(--color-primary)]"
                 >
                    {image ? (
                        <img src={image} alt="Upload preview" className="max-h-full max-w-full object-contain rounded-md" />
                    ) : (
                        <div className="text-[var(--color-text-secondary)]">
                            <ImageUpIcon />
                            <p className="mt-2 text-sm">Click to upload an image</p>
                            <p className="text-xs">PNG, JPG, GIF</p>
                        </div>
                    )}
                 </div>
                 {image && <button onClick={()=>setImage(null)} className="text-xs text-center w-full text-[var(--color-danger)] hover:underline">Remove image</button>}
            </div>
        </div>
        {error && <p className="text-[var(--color-danger)] text-sm px-6 pb-4">{error}</p>}
        <div className="p-4 border-t border-[var(--color-border)] flex justify-end">
          <button 
            onClick={handleGenerate} 
            disabled={isLoading}
            className="px-6 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-contrast)] font-bold rounded-md text-sm transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
          >
            {isLoading ? 'Generating...' : 'Generate Layout'}
          </button>
        </div>
      </div>
    </div>
  );
};