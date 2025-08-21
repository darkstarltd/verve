
import React from 'react';
import { Code, Bot, Zap, Command, Undo, Redo, Share, Settings, Eye, EyeOff, UploadCloud, LayoutDashboard, Workflow, Code2, Hammer } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { AppMode } from '../types';

export const Header: React.FC<{
  projectName: string;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  appMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onShareClick: () => void;
  onSettingsClick: () => void;
}> = ({ projectName, undo, redo, canUndo, canRedo, appMode, onModeChange, onShareClick, onSettingsClick }) => {
  return (
    <header className="h-16 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center p-4 text-white justify-between flex-shrink-0 z-40">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-lg flex items-center justify-center font-bold text-xl">
          P
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">{projectName}</h1>
          <p className="text-xs text-[var(--color-text-tertiary)]">Main Workspace</p>
        </div>
        <Tooltip content="Project Settings">
            <button onClick={onSettingsClick} className="p-2 hover:bg-[var(--color-surface-light)] rounded-md text-[var(--color-text-secondary)] hover:text-white">
                <Settings size={18} />
            </button>
        </Tooltip>
      </div>

      <div className="flex items-center gap-4">
          <div className="bg-[var(--color-background)] rounded-lg p-1 flex">
            {(['design', 'logic', 'code', 'devtools'] as AppMode[]).map(mode => (
              <Tooltip key={mode} content={`${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`}>
                <button 
                  onClick={() => onModeChange(mode)} 
                  className={`flex items-center gap-2 px-4 py-1.5 text-sm rounded-md transition-colors ${appMode === mode ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'}`}
                >
                  {mode === 'design' && <LayoutDashboard size={16} />}
                  {mode === 'logic' && <Workflow size={16} />}
                  {mode === 'code' && <Code2 size={16} />}
                  {mode === 'devtools' && <Hammer size={16} />}
                  <span className="capitalize">{mode}</span>
                </button>
              </Tooltip>
            ))}
          </div>
      </div>
      
      <div className="flex items-center gap-4">
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
        <div className="flex -space-x-3 items-center">
            <img className="inline-block h-8 w-8 rounded-full ring-2 ring-[var(--color-surface)]" src="https://i.pravatar.cc/32?img=1" alt="User 1"/>
            <img className="inline-block h-8 w-8 rounded-full ring-2 ring-[var(--color-surface)]" src="https://i.pravatar.cc/32?img=2" alt="User 2"/>
            <div className="h-8 w-8 rounded-full ring-2 ring-[var(--color-surface)] bg-[var(--color-surface-light)] flex items-center justify-center text-xs font-bold">+3</div>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={onShareClick} className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-md text-sm font-semibold flex items-center gap-2">
              <Share size={16} /> Share
            </button>
        </div>
      </div>
    </header>
  );
};