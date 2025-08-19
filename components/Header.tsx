
import React from 'react';
import { Code, Bot, Zap, Command, Undo, Redo, Share } from 'lucide-react';
import { Tooltip } from './Tooltip';

export const Header: React.FC<{
  projectName: string;
  onExport: () => void;
  onAiGenerate: () => void;
  onCommandPalette: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}> = ({ projectName, onExport, onAiGenerate, onCommandPalette, undo, redo, canUndo, canRedo }) => {
  return (
    <header className="h-16 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center p-4 text-white justify-between flex-shrink-0">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-lg flex items-center justify-center font-bold text-xl">
          P
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">{projectName}</h1>
          <p className="text-xs text-[var(--color-text-tertiary)]">Main Workspace</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Tooltip content="Undo (Ctrl+Z)">
            <button onClick={undo} disabled={!canUndo} className="p-2 hover:bg-[var(--color-surface-light)] rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                <Undo size={18} />
            </button>
        </Tooltip>
        <Tooltip content="Redo (Ctrl+Y)">
            <button onClick={redo} disabled={!canRedo} className="p-2 hover:bg-[var(--color-surface-light)] rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                <Redo size={18} />
            </button>
        </Tooltip>
      </div>
      
      <div className="flex items-center gap-2">
        <Tooltip content="Generate with AI">
          <button onClick={onAiGenerate} className="p-2 hover:bg-[var(--color-surface-light)] rounded-md">
            <Bot size={18} />
          </button>
        </Tooltip>
        <Tooltip content="Command Palette (Ctrl+K)">
          <button onClick={onCommandPalette} className="p-2 hover:bg-[var(--color-surface-light)] rounded-md">
            <Command size={18} />
          </button>
        </Tooltip>
        <Tooltip content="Export Code">
          <button onClick={onExport} className="p-2 hover:bg-[var(--color-surface-light)] rounded-md">
            <Code size={18} />
          </button>
        </Tooltip>
        <button className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-md text-sm font-semibold flex items-center gap-2">
          <Share size={16} /> Share
        </button>
      </div>
    </header>
  );
};