import React, { useState, useRef } from 'react';
import { useIsMounted } from '../hooks/useIsMounted';
import { Link, PencilLine, Briefcase, Sparkles, ImageUp } from 'lucide-react';

interface AiGenerateModalProps {
  onClose: () => void;
  onGenerate: (prompt: string, image?: string, url?: string, businessBrief?: boolean) => Promise<void>;
}

type Tab = 'prompt' | 'image' | 'url' | 'brief';

export const AiGenerateModal: React.FC<AiGenerateModalProps> = ({ onClose, onGenerate }) => {
  const [activeTab, setActiveTab] = useState<Tab>('prompt');
  const [prompt, setPrompt] = useState('');
  const [url, setUrl] = useState('');
  const [brief, setBrief] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMounted = useIsMounted();
  
  const examplePrompts = [
    "A modern landing page for a new mobile app that sells coffee.",
    "A simple portfolio website for a photographer.",
    "A product page for a futuristic smart watch.",
  ];

  const handleGenerate = async () => {
    const isBrief = activeTab === 'brief';
    if (isBrief && !brief.trim()) {
        setError('Please enter a business brief to generate a multi-page site.');
        return;
    }
    if (activeTab === 'url' && !url.trim()) {
        setError('Please enter a valid URL to import.');
        return;
    }
    if ((activeTab === 'prompt' || activeTab === 'image') && !prompt.trim() && !image) {
      setError('Please describe what you want to create or upload an image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await onGenerate(isBrief ? brief : (url || prompt), image || undefined, url || undefined, isBrief);
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

  const tabs: {id: Tab, label: string, icon: React.ReactNode}[] = [
      { id: 'prompt', label: 'From Prompt', icon: <PencilLine size={16} /> },
      { id: 'image', label: 'From Image', icon: <ImageUp size={16}/> },
      { id: 'url', label: 'From URL', icon: <Link size={16}/> },
      { id: 'brief', label: 'From Brief', icon: <Briefcase size={16}/> },
  ];

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[var(--color-surface)] rounded-lg shadow-xl w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2"><span className="text-[var(--color-primary)]"><Sparkles /></span> Generate with AI</h2>
          <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-white">&times;</button>
        </div>
        
        <div className="p-4 border-b border-[var(--color-border)]">
             <div className="bg-[var(--color-background)] rounded-lg p-1 flex">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-md ${activeTab === tab.id ? 'bg-[var(--color-primary)]' : 'hover:bg-[var(--color-border)]'}`}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>
        </div>

        <div className="p-6">
            {activeTab === 'url' && (
                 <div>
                    <label htmlFor="ai-url" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Enter a URL to import</label>
                    <input
                      id="ai-url" value={url} onChange={(e) => setUrl(e.target.value)}
                      className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-md p-3 text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                      placeholder="https://example.com"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-2">The AI will analyze the structure and style of the page to generate a new layout. Content will not be copied directly.</p>
                  </div>
            )}
            {activeTab === 'brief' && (
                 <div>
                    <label htmlFor="ai-brief" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Describe your business or project</label>
                    <textarea
                      id="ai-brief" value={brief} onChange={(e) => setBrief(e.target.value)}
                      className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-md p-3 text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                      rows={8}
                      placeholder="e.g., An online store that sells custom-printed t-shirts. I need a home page, a product gallery, and a contact page."
                      disabled={isLoading}
                    />
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-2">The AI will generate a multi-page site structure based on your brief.</p>
                  </div>
            )}
            {(activeTab === 'prompt' || activeTab === 'image') && (
                 <div className="space-y-4">
                    <div>
                      <label htmlFor="ai-prompt" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Describe what you want to create:</label>
                      <textarea
                        id="ai-prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-md p-3 text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                        rows={5}
                        placeholder={examplePrompts[0]}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {examplePrompts.map((p, i) => (
                          <button key={i} onClick={() => setPrompt(p)} disabled={isLoading} className="text-xs bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] text-[var(--color-text-secondary)] px-3 py-1 rounded-full">
                            {p}
                          </button>
                        ))}
                    </div>
                    
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer p-6 border-2 border-dashed border-[var(--color-border)] rounded-lg text-center hover:border-[var(--color-primary)]"
                    >
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" className="hidden" />
                        {image ? (
                             <img src={image} alt="upload preview" className="max-h-32 mx-auto rounded-md" />
                        ) : (
                            <div className="text-[var(--color-text-secondary)]">
                                <ImageUp className="mx-auto mb-2" />
                                <p>Upload an image (optional)</p>
                                <p className="text-xs">A wireframe or screenshot can help guide the AI.</p>
                            </div>
                        )}
                    </div>
                  </div>
            )}
             {error && <p className="text-[var(--color-danger)] text-sm mt-4">{error}</p>}
        </div>
        <div className="p-4 border-t border-[var(--color-border)] flex justify-end">
          <button 
            onClick={handleGenerate} 
            disabled={isLoading}
            className="px-6 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-contrast)] font-bold rounded-md text-sm transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
          >
            <Sparkles size={16}/> {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  );
};