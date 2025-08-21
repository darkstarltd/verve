import React from 'react';
import { useAppContext } from '../context/AppContext';
import { CollapsibleSection } from './StylePropertyEditor';
import { PagesPanel } from './PagesPanel';
import { Code } from 'lucide-react';

export const ExplorerPanel: React.FC = () => {
    const { state: { projectName } } = useAppContext();

    return (
        <div>
            <CollapsibleSection title="Project" defaultOpen>
                 <div className="p-2">
                    <div className="flex items-center gap-2 p-2">
                        <Code size={16} className="text-[var(--color-accent)]" />
                        <span className="font-semibold text-sm">{projectName}</span>
                    </div>
                    <div className="pl-4 border-l-2 border-[var(--color-border-subtle)]">
                        <PagesPanel />
                    </div>
                </div>
            </CollapsibleSection>
        </div>
    );
};