
import React from 'react';
import { ActivityBarTab } from './ActivityBar';
import { CodeSnippet } from '../types';
import { PagesPanel } from './PagesPanel';
import { ComponentLibrary } from './ComponentLibrary';
import { DataPanel }  from './DataPanel';
import { AssetPanel } from './AssetPanel';
import { CodePanel } from './CodePanel';
import { ThemePanel } from './ThemePanel';
import { LayersPanel } from './LayersPanel';

export const Sidebar: React.FC<{
  activeTab: ActivityBarTab;
  onAddSnippet: () => void;
  onEditSnippet: (snippet: CodeSnippet) => void;
}> = ({ activeTab, onAddSnippet, onEditSnippet }) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'explorer':
        return <PagesPanel />;
      case 'layers':
        return <LayersPanel />;
      case 'components':
        return <ComponentLibrary />;
      case 'data':
        return <DataPanel />;
      case 'assets':
        return <AssetPanel />;
      case 'code':
        return <CodePanel onAddSnippet={onAddSnippet} onEditSnippet={onEditSnippet} />;
      case 'theme':
        return <ThemePanel />;
      default:
        return null;
    }
  };

  return (
    <aside className="w-72 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col">
      <div className="p-4 font-bold text-lg capitalize border-b border-[var(--color-border)]">{activeTab}</div>
      <div className="flex-1 overflow-y-auto">
        {renderTabContent()}
      </div>
    </aside>
  );
};