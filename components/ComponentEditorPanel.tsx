import React, { useState } from 'react';
import { CustomComponent, DeepReadonly } from '../types';
import { ComponentSlotEditor } from './ComponentSlotEditor';
import { ComponentPropEditor } from './ComponentPropEditor';
import { ComponentVariantEditor } from './ComponentVariantEditor';
import { FileJson, SlidersHorizontal, BoxSelect } from 'lucide-react';

type EditorTab = 'props' | 'slots' | 'variants' | 'state';

export const ComponentEditorPanel: React.FC<{
    component: DeepReadonly<CustomComponent>;
}> = ({ component }) => {
    const [activeTab, setActiveTab] = useState<EditorTab>('variants');
    
    const tabs: {id: EditorTab, label: string, icon: React.ReactNode}[] = [
        { id: 'props', label: 'Props', icon: <FileJson size={16}/> },
        { id: 'variants', label: 'Variants', icon: <SlidersHorizontal size={16}/> },
        { id: 'slots', label: 'Slots', icon: <BoxSelect size={16}/> },
        // { id: 'state', label: 'State' },
    ];
    
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-[var(--color-border)]">
                <h3 className="font-bold text-lg">{component.name}</h3>
                <p className="text-xs text-[var(--color-text-tertiary)]">Editing Main Component</p>
            </div>
             <div className="flex border-b border-[var(--color-border)]">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm ${activeTab === tab.id ? 'bg-[var(--color-surface-light)] text-white' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)]'}`}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'slots' && <ComponentSlotEditor component={component} />}
                {activeTab === 'props' && <ComponentPropEditor component={component} />}
                {activeTab === 'variants' && <ComponentVariantEditor component={component} />}
                {activeTab === 'state' && <div className="text-center p-4 text-sm text-[var(--color-text-tertiary)]">State editor coming soon.</div>}
            </div>
        </div>
    );
};