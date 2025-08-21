
import React from 'react';
import { ActivityBarTab } from './ActivityBar';
import { CodeSnippet } from '../types';
import { ExplorerPanel } from './ExplorerPanel';
import { ComponentLibrary } from './ComponentLibrary';
import { DataPanel }  from './DataPanel';
import { AssetPanel } from './AssetPanel';
import { CodePanel } from './CodePanel';
import { ThemePanel } from './ThemePanel';
import { LayersPanel } from './LayersPanel';
import { TemplatesPanel } from './TemplatesPanel';
import { SourceControlPanel } from './SourceControlPanel';

export const Sidebar: React.FC<{
  activeTab: ActivityBarTab;
  onAddSnippet: () => void;
  onEditSnippet: (snippet: CodeSnippet) => void;
  onAiTheme: () => void;
}> = ({ activeTab, onAddSnippet, onEditSnippet, onAiTheme }) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'explorer':
        return <ExplorerPanel />;
      case 'source-control':
        return <SourceControlPanel />;
      case 'layers':
        return <LayersPanel />;
      case 'components':
        return <ComponentLibrary />;
      case 'templates':
        return <TemplatesPanel />;
      case 'data':
        return <DataPanel />;
      case 'assets':
        return <AssetPanel />;
      case 'code':
        return <CodePanel onAddSnippet={onAddSnippet} onEditSnippet={onEditSnippet} />;
      case 'theme':
        return <ThemePanel onAiTheme={onAiTheme} />;
      default:
        return null;
    }
  };

  return (
    <aside className="w-full h-full bg-[var(--color-surface)] flex flex-col relative">
      <div className="p-4 font-bold text-lg capitalize border-b border-[var(--color-border)] flex-shrink-0">{activeTab.replace('-', ' ')}</div>
      <div className="flex-1 overflow-y-auto">
        {renderTabContent()}
      </div>
    </aside>
  );
};