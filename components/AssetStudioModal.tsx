import React, { useState } from 'react';
import { ImageIcon as ImageIconLucide, Star, Droplets, Download } from 'lucide-react';
import { generateImageFromPrompt, generateIconFromPrompt } from '../lib/ai';
import { Asset } from '../types';
import { toast } from 'react-hot-toast';
import { MagicIcon, PlusIcon } from './icons';
import { useIsMounted } from '../hooks/useIsMounted';

type Tab = 'image' | 'icon' | 'background';

export const AssetStudioModal: React.FC<{
  onClose: () => void;
  onAddAsset: (asset: Omit<Asset, 'id'>) => void;
}> = ({ onClose, onAddAsset }) => {
  const [activeTab, setActiveTab] = useState<Tab>('image');
  const [prompts, setPrompts] = useState({ image: '', icon: '', background: '' });
  const [loading, setLoading] = useState(false);
  const [generatedAssets, setGeneratedAssets] = useState<{ url: string, prompt: string }[]>([]);
  const isMounted = useIsMounted();

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompts(prev => ({ ...prev, [activeTab]: e.target.value }));
  };

  const handleGenerate = async () => {
    const prompt = prompts[activeTab];
    if (!prompt.trim()) return;

    setLoading(true);
    try {
        let imageUrl: string;
        if (activeTab === 'image' || activeTab === 'background') {
            const fullPrompt = activeTab === 'background' ? `A beautiful, abstract, seamless background texture of ${prompt}` : prompt;
            imageUrl = await generateImageFromPrompt(fullPrompt);
        } else { // icon
            imageUrl = await generateIconFromPrompt(prompt);
        }
        if (isMounted.current) {
          setGeneratedAssets(prev => [{ url: imageUrl, prompt: prompt }, ...prev]);
        }
    } catch (error) {
        console.error("Asset generation failed:", error);
        toast.error('Asset generation failed.');
    } finally {
        if (isMounted.current) {
          setLoading(false);
        }
    }
  };
  
  const handleAdd = (asset: { url: string, prompt: string }) => {
    onAddAsset({ name: `${prompts[activeTab] || 'ai_asset'}.png`, url: asset.url });
    toast.success('Asset added to project!');
  }

  const tabs: { id: Tab, name: string, icon: React.ReactNode }[] = [
    { id: 'image', name: 'Image', icon: <ImageIconLucide size={16} /> },
    { id: 'icon', name: 'Icon', icon: <Star size={16} /> },
    { id: 'background', name: 'Background', icon: <Droplets size={16} /> },
  ];

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[var(--color-surface)] rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center flex-shrink-0">
            <h2 className="text-lg font-bold flex items-center gap-2"><MagicIcon className="text-[var(--color-primary)]"/> AI Asset Studio</h2>
            <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-white">&times;</button>
        </div>
        <div className="flex-1 flex overflow-hidden">
            <div className="w-1/3 border-r border-[var(--color-border)] p-6 flex flex-col">
                <div className="bg-[var(--color-background)] rounded-lg p-1 flex mb-6">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-md ${activeTab === tab.id ? 'bg-[var(--color-primary)]' : 'hover:bg-[var(--color-border)]'}`}>
                            {tab.icon} {tab.name}
                        </button>
                    ))}
                </div>
                <div className="flex-1 flex flex-col">
                    <label className="font-semibold mb-2">Describe the {activeTab} you want to create:</label>
                    <textarea value={prompts[activeTab]} onChange={handlePromptChange} rows={5} className="w-full bg-[var(--color-background)] p-2 rounded border border-[var(--color-border)] focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"/>
                </div>
                <button onClick={handleGenerate} disabled={loading} className="w-full mt-4 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg font-bold disabled:opacity-50">
                    {loading ? 'Generating...' : 'Generate'}
                </button>
            </div>
            <div className="w-2/3 p-6 overflow-y-auto">
                {generatedAssets.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-tertiary)]">
                        <ImageIconLucide size={64}/>
                        <p className="mt-4">Your generated assets will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {generatedAssets.map((asset, index) => (
                            <div key={index} className="group relative aspect-square bg-[var(--color-background)] rounded-lg overflow-hidden">
                                <img src={asset.url} alt={asset.prompt} className="w-full h-full object-cover"/>
                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col p-2 justify-between">
                                    <p className="text-xs text-white truncate">{asset.prompt}</p>
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleAdd(asset)} className="p-2 bg-[var(--color-primary)] rounded-full hover:bg-[var(--color-primary-hover)]" title="Add to project assets"><PlusIcon size={16}/></button>
                                        <a href={asset.url} download={`${asset.prompt.slice(0,20)}.png`} className="p-2 bg-[var(--color-surface-light)] rounded-full hover:bg-[var(--color-border)]" title="Download"><Download size={16}/></a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};