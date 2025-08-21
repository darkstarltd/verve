import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ThemeToken, ThemeState } from '../types';
import { CollapsibleSection } from './StylePropertyEditor';
import { PlusIcon, TrashIcon, MagicIcon } from './icons';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import { useIsMounted } from '../hooks/useIsMounted';

const TokenManager: React.FC<{
    title: string;
    tokenType: keyof Pick<ThemeState, 'colors' | 'fontSizes' | 'spacing' | 'radii'>;
    tokens: readonly ThemeToken[];
}> = ({ title, tokenType, tokens }) => {
    const { dispatch } = useAppContext();
    const isColor = tokenType === 'colors';

    const handleAdd = () => {
        const newToken: ThemeToken = {
            id: uuidv4(),
            name: `New ${title.slice(0, -1)}`,
            value: isColor ? '#ffffff' : '1rem',
            description: '',
        };
        dispatch({ type: 'ADD_THEME_TOKEN', payload: { tokenType, token: newToken } });
    };

    const handleUpdate = (token: ThemeToken) => {
        dispatch({ type: 'UPDATE_THEME_TOKEN', payload: { tokenType, token } });
    };

    const handleDelete = (id: string) => {
        dispatch({ type: 'DELETE_THEME_TOKEN', payload: { tokenType, tokenId: id } });
    };

    return (
        <CollapsibleSection title={title} defaultOpen>
            <div className="space-y-2 p-2">
                {tokens.map(token => (
                    <div key={token.id} className="flex items-center gap-2">
                        {isColor && (
                            <input
                                type="color"
                                value={token.value}
                                onChange={(e) => handleUpdate({ ...token, value: e.target.value })}
                                className="w-8 h-8 p-0 border-none rounded cursor-pointer bg-transparent flex-shrink-0"
                            />
                        )}
                        <input
                            type="text"
                            value={token.name}
                            onChange={e => handleUpdate({ ...token, name: e.target.value })}
                            className="w-full bg-[var(--color-background)] p-1 rounded text-sm"
                            placeholder="Token Name"
                        />
                        <input
                            type="text"
                            value={token.value}
                            onChange={e => handleUpdate({ ...token, value: e.target.value })}
                            className="w-full bg-[var(--color-background)] p-1 rounded text-sm"
                            placeholder="Value"
                        />
                        <button onClick={() => handleDelete(token.id)} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
                    </div>
                ))}
                <button onClick={handleAdd} className="w-full text-xs text-center p-1 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] rounded-md flex items-center justify-center gap-1">
                    <PlusIcon /> Add {title.slice(0, -1)}
                </button>
            </div>
        </CollapsibleSection>
    );
};

const TypographyManager: React.FC = () => {
    const { state: { theme }, dispatch } = useAppContext();
    const [fonts, setFonts] = useState(theme.fonts);

    const handleBlur = () => {
        dispatch({ type: 'UPDATE_THEME_FONTS', payload: fonts });
    };

    return (
        <CollapsibleSection title="Typography" defaultOpen>
            <div className="space-y-3 p-2">
                <div>
                    <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1 block">Primary Font (Headings)</label>
                    <input
                        type="text"
                        value={fonts.primary}
                        onChange={e => setFonts(f => ({ ...f, primary: e.target.value }))}
                        onBlur={handleBlur}
                        placeholder="e.g., Roboto"
                        className="w-full bg-[var(--color-background)] p-2 rounded text-sm"
                    />
                </div>
                 <div>
                    <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1 block">Body Font</label>
                    <input
                        type="text"
                        value={fonts.body}
                        onChange={e => setFonts(f => ({ ...f, body: e.target.value }))}
                        onBlur={handleBlur}
                        placeholder="e.g., Inter"
                        className="w-full bg-[var(--color-background)] p-2 rounded text-sm"
                    />
                </div>
                <p className="text-xs text-[var(--color-text-tertiary)]">Enter the name of any font from Google Fonts.</p>
            </div>
        </CollapsibleSection>
    )
}

export const DesignSystemPanel: React.FC<{
    onClose: () => void;
    onGenerate: (prompt: string) => Promise<void>;
}> = ({ onClose, onGenerate }) => {
    const { state: { theme } } = useAppContext();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const isMounted = useIsMounted();

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error('Please enter a description for your design system.');
            return;
        }
        setIsLoading(true);
        try {
            await onGenerate(prompt);
        } catch (e) {
            // Error is handled in App.tsx
        } finally {
            if(isMounted.current) setIsLoading(false);
        }
    };

    return (
        <div className="p-2">
            <div className="bg-[var(--color-surface-light)] p-3 rounded-lg mb-4">
                <label className="text-sm font-semibold mb-2 block text-center">AI Design System Generator</label>
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="e.g., A modern, minimalist design for a tech startup..."
                    rows={3}
                    className="w-full bg-[var(--color-background)] p-2 rounded text-sm border border-[var(--color-border)]"
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full mt-2 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-md text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <MagicIcon size={16} /> {isLoading ? 'Generating...' : 'Generate System'}
                </button>
            </div>
            <TypographyManager />
            <TokenManager title="Colors" tokenType="colors" tokens={theme.colors} />
            <TokenManager title="Font Sizes" tokenType="fontSizes" tokens={theme.fontSizes} />
            <TokenManager title="Spacing" tokenType="spacing" tokens={theme.spacing} />
            <TokenManager title="Radii" tokenType="radii" tokens={theme.radii} />
        </div>
    );
};