
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { componentLibrary, createDefaultElement } from '../constants';
import { ComponentDefinition } from '../types';

interface CommandPaletteProps {
  onClose: () => void;
  onExport: () => void;
  onAiGenerate: () => void;
  onImportCode: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose, onExport, onAiGenerate, onImportCode }) => {
  const { state: { pages, projectType }, dispatch } = useAppContext();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentLibrary: ComponentDefinition[] = componentLibrary[projectType] || componentLibrary.web;

  const allActions = [
    ...pages.map(page => ({
      type: 'page',
      label: `Go to page: ${page.name}`,
      action: () => dispatch({ type: 'SET_ACTIVE_PAGE', payload: page.id }),
    })),
    ...currentLibrary.map(comp => ({
        type: 'element',
        label: `Add: ${comp.name}`,
        action: () => {
            const newElement = createDefaultElement(comp.defaultElement);
            dispatch({ type: 'ADD_ELEMENT', payload: { parentId: null, index: 999, element: newElement } });
        }
    })),
     { type: 'action', label: 'Export Project', action: onExport },
     { type: 'action', label: 'AI Generate Layout', action: onAiGenerate },
     { type: 'action', label: 'Add Code Snippet', action: onImportCode },
  ];

  const filteredActions = allActions.filter(action =>
    action.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredActions.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + (filteredActions.length || 1)) % (filteredActions.length || 1));
      } else if (e.key === 'Enter' && filteredActions[selectedIndex]) {
        e.preventDefault();
        filteredActions[selectedIndex].action();
        onClose();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [search, selectedIndex, filteredActions, onClose]);

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex justify-center pt-20 z-50" onClick={onClose}>
      <div className="bg-[var(--color-surface)] rounded-lg shadow-xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setSelectedIndex(0); }}
          placeholder="Type a command or search..."
          className="w-full bg-transparent p-4 text-white placeholder-[var(--color-text-tertiary)] outline-none border-b border-[var(--color-border)]"
        />
        <div className="p-2 max-h-96 overflow-y-auto">
          {filteredActions.map((action, index) => (
            <div
              key={action.label}
              onClick={() => { action.action(); onClose(); }}
              className={`p-2 rounded-md cursor-pointer text-sm ${selectedIndex === index ? 'bg-[var(--color-primary)]' : 'hover:bg-[var(--color-surface-light)]'}`}
            >
              {action.label}
            </div>
          ))}
          {filteredActions.length === 0 && <p className="text-center p-4 text-sm text-[var(--color-text-tertiary)]">No results found.</p>}
        </div>
      </div>
    </div>
  );
};
