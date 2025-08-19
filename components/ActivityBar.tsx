import React from 'react';
import { ExplorerIcon, PlusIcon, DatabaseIcon, AssetsIcon, PaletteIcon, FileCodeIcon, MagicIcon, TerminalIcon, LayersIcon } from './icons';
import { Tooltip } from './Tooltip';

export type ActivityBarTab = 'explorer' | 'components' | 'layers' | 'data' | 'assets' | 'theme' | 'code' | 'devtools';

interface ActivityBarProps {
    activeTab: ActivityBarTab;
    onTabChange: (tab: ActivityBarTab) => void;
    onAssetStudioClick: () => void;
}

const ActivityBarButton: React.FC<{
    title: string;
    icon: React.ReactNode;
    isActive?: boolean;
    onClick: () => void;
}> = ({ title, icon, isActive, onClick }) => {
    return (
        <Tooltip content={title} placement="right">
            <button
                onClick={onClick}
                className={`w-full p-3 flex justify-center items-center transition-colors relative ${
                    isActive
                        ? 'text-white'
                        : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-surface-light)]'
                }`}
            >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-accent)] rounded-r-full"></div>}
                <div className="w-6 h-6">{icon}</div>
            </button>
        </Tooltip>
    );
};

export const ActivityBar: React.FC<ActivityBarProps> = ({ activeTab, onTabChange, onAssetStudioClick }) => {
    const tabs: { id: ActivityBarTab, title: string, icon: React.ReactNode }[] = [
        { id: 'explorer', title: 'Explorer', icon: <ExplorerIcon /> },
        { id: 'layers', title: 'Layers', icon: <LayersIcon /> },
        { id: 'components', title: 'Components', icon: <PlusIcon /> },
        { id: 'data', title: 'Data', icon: <DatabaseIcon /> },
        { id: 'assets', title: 'Assets', icon: <AssetsIcon /> },
        { id: 'code', title: 'Code Snippets', icon: <FileCodeIcon /> },
        { id: 'theme', title: 'Theme', icon: <PaletteIcon /> },
    ];
    
    return (
        <nav className="w-16 bg-[var(--color-background)] border-r border-[var(--color-border)] flex flex-col items-center py-2 gap-2">
            <div className="flex-1 space-y-2">
                {tabs.map(tab => (
                    <ActivityBarButton 
                        key={tab.id}
                        title={tab.title}
                        icon={tab.icon}
                        isActive={activeTab === tab.id}
                        onClick={() => onTabChange(tab.id)}
                    />
                ))}
                <div className="my-2 w-full flex justify-center">
                    <div className="w-8 h-px bg-[var(--color-border)]"></div>
                </div>
                 <ActivityBarButton 
                    title="Asset Studio"
                    icon={<MagicIcon />}
                    onClick={onAssetStudioClick}
                />
            </div>
             <div className="flex-shrink-0">
                 <ActivityBarButton 
                    title="Dev Tools"
                    icon={<TerminalIcon />}
                    isActive={activeTab === 'devtools'}
                    onClick={() => onTabChange('devtools')}
                />
            </div>
        </nav>
    );
};