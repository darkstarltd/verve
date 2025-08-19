import React from 'react';
import { Element, DataSource } from '../types';
import { useAppContext } from '../context/AppContext';
import { CollapsibleSection } from './StylePropertyEditor';

interface DataBindingEditorProps {
    element: Element;
}

export const DataBindingEditor: React.FC<DataBindingEditorProps> = ({ element }) => {
    const { updateElement, state: { pages, activePageId } } = useAppContext();
    const activePage = pages.find(p => p.id === activePageId);

    const isInput = ['input', 'textarea', 'TextInput'].includes(element.type);

    const allDataKeys: {group: string, keys: string[]}[] = [
      {
        group: 'Client State',
        keys: activePage?.stateDefinition.map(v => v.name) || []
      },
      ...Object.entries(activePage?.dataState || {}).map(([sourceName, data]) => ({
        group: `API: ${sourceName}`,
        keys: Object.keys(data || {}).map(key => `${sourceName}.${key}`)
      }))
    ];
    
    const allArrayKeys = allDataKeys.flatMap(group => 
        group.keys.filter(key => {
            const value = (activePage?.dataState as any)[key.split('.')[0]]?.[key.split('.')[1]];
            return Array.isArray(value);
        })
    );


    const handleDataSourceChange = (updates: Partial<DataSource>) => {
        const newDataSource = { ...element.dataSource, ...updates };
        if (Object.keys(newDataSource).length === 0) {
            updateElement(element.id, { dataSource: undefined });
        } else {
            updateElement(element.id, { dataSource: newDataSource });
        }
    };

    const handleRepeatChange = (key: keyof NonNullable<DataSource['repeat']>, value: string) => {
        const newRepeat = { ...element.dataSource?.repeat, [key]: value };
        handleDataSourceChange({ repeat: newRepeat });
    };
    
    return (
        <CollapsibleSection title="Data Binding" defaultOpen>
            <div className="space-y-3">
                {isInput ? (
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Bind Value (Two-Way)</label>
                        <select
                            value={element.dataSource?.bindValue || ''}
                            onChange={(e) => handleDataSourceChange({ bindValue: e.target.value })}
                            className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm text-white border border-[var(--color-border)]"
                        >
                            <option value="">-- Select State Variable --</option>
                            {(activePage?.stateDefinition || []).map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                        </select>
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Bind Content</label>
                        <input
                            type="text"
                            value={element.dataSource?.content || ''}
                            onChange={(e) => handleDataSourceChange({ content: e.target.value })}
                            placeholder="e.g., {{user.name}}"
                            className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm text-white border border-[var(--color-border)] font-mono"
                        />
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Repeat for each item in:</label>
                    <select
                        value={element.dataSource?.repeat?.dataKey || ''}
                        onChange={(e) => handleRepeatChange('dataKey', e.target.value)}
                        className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm text-white border border-[var(--color-border)]"
                    >
                        <option value="">None</option>
                         {allArrayKeys.map(key => <option key={key} value={key}>{key}</option>)}
                    </select>
                </div>
                {element.dataSource?.repeat?.dataKey && (
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">As (item name):</label>
                         <input
                            type="text"
                            value={element.dataSource?.repeat?.itemName || 'item'}
                            onChange={(e) => handleRepeatChange('itemName', e.target.value)}
                            placeholder="e.g., item"
                            className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm text-white border border-[var(--color-border)]"
                        />
                    </div>
                )}
            </div>
        </CollapsibleSection>
    );
};