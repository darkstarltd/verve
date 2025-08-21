import React from 'react';
import { Tooltip } from './Tooltip';
import { LayoutTemplate, GitCommit, PanelLeftClose, PanelRightOpen, Files, Layers, PlusSquare, Database, Library, FileCode, Palette, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export type ActivityBarTab = 'explorer' | 'components' | 'layers' | 'data' | 'assets' | 'theme' | 'code' | 'templates' | 'source-control';

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
    badge?: number;
}> = ({ title, icon, isActive, onClick, badge }) => {
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
                <div className="w-6 h-6 relative">
                    {icon}
                    {badge > 0 && (
                        <div className="absolute -top-1 -right-2 bg-[var(--color-primary)] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                            {badge}
                        </div>
                    )}
                </div>
            </button>
        </Tooltip>
    );
};

export const ActivityBar: React.FC<ActivityBarProps> = ({ activeTab, onTabChange, onAssetStudioClick }) => {
    const { state: { unsavedChanges, panels }, dispatch } = useAppContext();

    const tabs: { id: ActivityBarTab, title: string, icon: React.ReactNode, badge?: number }[] = [
        { id: 'explorer', title: 'Explorer', icon: <Files size={24} /> },
        { id: 'source-control', title: 'Source Control', icon: <GitCommit size={24}/>, badge: unsavedChanges },
        { id: 'layers', title: 'Layers', icon: <Layers size={24}/> },
        { id: 'components', title: 'Components', icon: <PlusSquare size={24}/> },
        { id: 'templates', title: 'Templates', icon: <LayoutTemplate size={24}/> },
        { id: 'data', title: 'Data', icon: <Database size={24}/> },
        { id: 'assets', title: 'Assets', icon: <Library size={24}/> },
        { id: 'code', title: 'Code Snippets', icon: <FileCode size={24}/> },
        { id: 'theme', title: 'Theme', icon: <Palette size={24}/> },
    ];
    
    return (
        <nav className="w-16 bg-[var(--color-background)] border-r border-[var(--color-border)] flex flex-col items-center py-2 gap-2 z-50">
            <div className="flex-1 space-y-2 w-full">
                <ActivityBarButton 
                    title={panels.leftCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    icon={panels.leftCollapsed ? <PanelRightOpen size={24} /> : <PanelLeftClose size={24} />}
                    onClick={() => dispatch({ type: 'SET_PANELS_STATE', payload: { leftCollapsed: !panels.leftCollapsed }})}
                />
                 <div className="my-2 w-full flex justify-center">
                    <div className="w-8 h-px bg-[var(--color-border)]"></div>
                </div>
                {tabs.map(tab => (
                    <ActivityBarButton 
                        key={tab.id}
                        title={tab.title}
                        icon={tab.icon}
                        isActive={activeTab === tab.id}
                        onClick={() => onTabChange(tab.id)}
                        badge={tab.badge}
                    />
                ))}
                <div className="my-2 w-full flex justify-center">
                    <div className="w-8 h-px bg-[var(--color-border)]"></div>
                </div>
                 <ActivityBarButton 
                    title="Asset Studio"
                    icon={<Sparkles size={24} />}
                    onClick={onAssetStudioClick}
                />
            </div>
        </nav>
    );
};
