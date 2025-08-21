import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ThemeToken, ThemeState } from '../types';
import { CollapsibleSection } from './StylePropertyEditor';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { GlobalClassesManager } from './GlobalClassesManager';

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
                        <button onClick={() => handleDelete(token.id)} className="text-gray-400 hover:text-red-500"><Trash2/></button>
                    </div>
                ))}
                <button onClick={handleAdd} className="w-full text-xs text-center p-1 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] rounded-md flex items-center justify-center gap-1">
                    <Plus /> Add {title.slice(0, -1)}
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

export const ThemePanel: React.FC<{ onAiTheme: () => void }> = ({ onAiTheme }) => {
    const { state: { theme } } = useAppContext();

    return (
        <div className="p-2">
             <button
                onClick={onAiTheme}
                className="w-full mb-4 px-4 py-2 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] text-sm font-medium rounded-md flex items-center justify-center gap-2"
            >
                <Sparkles /> AI Theme Assistant
            </button>
            <TypographyManager />
            <TokenManager title="Colors" tokenType="colors" tokens={theme.colors} />
            <TokenManager title="Font Sizes" tokenType="fontSizes" tokens={theme.fontSizes} />
            <TokenManager title="Spacing" tokenType="spacing" tokens={theme.spacing} />
            <TokenManager title="Radii" tokenType="radii" tokens={theme.radii} />
            <div className="mt-4">
                <GlobalClassesManager />
            </div>
        </div>
    );
};
