
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { CollapsibleSection } from './StylePropertyEditor';
import { PlusIcon, TrashIcon } from './icons';
import { StateVariable, ApiDataSource, ApiHeader } from '../types';
import { v4 as uuidv4 } from 'uuid';

const ClientStateEditor = () => {
    const { state: { pages, activePageId }, dispatch } = useAppContext();
    const activePage = pages.find(p => p.id === activePageId);
    const stateVars = activePage?.stateDefinition || [];

    const handleAddVariable = () => {
        const newVar: StateVariable = {
            name: `var${stateVars.length + 1}`,
            type: 'string',
            initialValue: ''
        };
        dispatch({ type: 'DEFINE_STATE_VARIABLE', payload: { variable: newVar } });
    };

    const handleUpdateVariable = (index: number, updates: Partial<StateVariable>) => {
        const updatedVar = { ...stateVars[index], ...updates };
        dispatch({ type: 'DEFINE_STATE_VARIABLE', payload: { variable: updatedVar, index } });
    };

    const handleDeleteVariable = (name: string) => {
        if (window.confirm(`Are you sure you want to delete the state variable "${name}"?`)) {
            dispatch({ type: 'DELETE_STATE_VARIABLE', payload: { name } });
        }
    };

    return (
        <CollapsibleSection title="Client State" defaultOpen>
            <div className="space-y-3 p-2">
                {stateVars.length > 0 && (
                     <div className="grid grid-cols-12 gap-2 items-center text-xs text-[var(--color-text-secondary)] px-1">
                        <label className="col-span-4">Name</label>
                        <label className="col-span-3">Type</label>
                        <label className="col-span-4">Initial Value</label>
                    </div>
                )}
                {stateVars.map((v, index) => (
                    <div key={v.name} className="grid grid-cols-12 gap-2 items-center text-sm">
                        <input type="text" value={v.name} onChange={e => handleUpdateVariable(index, { name: e.target.value })} placeholder="Name" className="col-span-4 bg-[var(--color-background)] p-1 rounded" />
                        <select value={v.type} onChange={e => handleUpdateVariable(index, { type: e.target.value as StateVariable['type'] })} className="col-span-3 bg-[var(--color-background)] p-1 rounded">
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="boolean">Boolean</option>
                        </select>
                        <input type="text" value={String(v.initialValue)} onChange={e => handleUpdateVariable(index, { initialValue: e.target.value })} placeholder="Initial Value" className="col-span-4 bg-[var(--color-background)] p-1 rounded" />
                        <button onClick={() => handleDeleteVariable(v.name)} className="col-span-1 text-gray-400 hover:text-red-500 flex justify-center"><TrashIcon /></button>
                    </div>
                ))}
                <button onClick={handleAddVariable} className="w-full text-xs text-center p-1 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] rounded-md flex items-center justify-center gap-1">
                    <PlusIcon /> Add Variable
                </button>
            </div>
        </CollapsibleSection>
    );
};

const ApiDataSourceEditor = () => {
    const { state: { pages, activePageId }, dispatch } = useAppContext();
    const activePage = pages.find(p => p.id === activePageId);
    const dataSources = activePage?.apiDataSources || [];
    const [editingSourceId, setEditingSourceId] = useState<string | null>(null);

    const handleAddSource = () => {
        const newSource: ApiDataSource = { id: uuidv4(), name: `API ${dataSources.length + 1}`, url: '', method: 'GET', headers: [] };
        dispatch({ type: 'ADD_API_DATA_SOURCE', payload: newSource });
        setEditingSourceId(newSource.id);
    };
    
    const handleUpdateSource = (id: string, updates: Partial<ApiDataSource>) => {
        const source = dataSources.find(ds => ds.id === id);
        if (source) {
            dispatch({ type: 'UPDATE_API_DATA_SOURCE', payload: { ...source, ...updates } });
        }
    };
    
    const handleDeleteSource = (id: string) => {
        if (window.confirm(`Are you sure you want to delete this API source?`)) {
            dispatch({ type: 'DELETE_API_DATA_SOURCE', payload: id });
            if (editingSourceId === id) setEditingSourceId(null);
        }
    };

    const handleHeaderChange = (sourceId: string, headerId: string, key: 'key' | 'value', value: string) => {
        const source = dataSources.find(ds => ds.id === sourceId);
        if (source) {
            const newHeaders = source.headers.map(h => h.id === headerId ? {...h, [key]: value} : h);
            handleUpdateSource(sourceId, { headers: newHeaders });
        }
    };

    const addHeader = (sourceId: string) => {
        const source = dataSources.find(ds => ds.id === sourceId);
        if (source) {
            const newHeaders = [...source.headers, {id: uuidv4(), key: '', value: ''}];
            handleUpdateSource(sourceId, { headers: newHeaders });
        }
    }
    const removeHeader = (sourceId: string, headerId: string) => {
        const source = dataSources.find(ds => ds.id === sourceId);
        if(source) {
             handleUpdateSource(sourceId, { headers: source.headers.filter(h => h.id !== headerId) });
        }
    }

    return (
        <CollapsibleSection title="API Data Sources" defaultOpen>
            <div className="space-y-3 p-2">
                {dataSources.map(source => (
                    <div key={source.id}>
                        <div className="flex justify-between items-center bg-[var(--color-surface-light)] p-2 rounded-t-md cursor-pointer" onClick={() => setEditingSourceId(editingSourceId === source.id ? null : source.id)}>
                           <span className="font-semibold text-sm">{source.name}</span>
                           <button onClick={(e) => { e.stopPropagation(); handleDeleteSource(source.id); }} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
                        </div>
                        {editingSourceId === source.id && (
                            <div className="bg-[var(--color-surface-light)] p-3 rounded-b-md space-y-2 text-sm">
                                <input type="text" value={source.name} onChange={e => handleUpdateSource(source.id, {name: e.target.value})} placeholder="Name" className="w-full bg-[var(--color-background)] p-1 rounded" />
                                <input type="text" value={source.url} onChange={e => handleUpdateSource(source.id, {url: e.target.value})} placeholder="URL" className="w-full bg-[var(--color-background)] p-1 rounded" />
                                <select value={source.method} onChange={e => handleUpdateSource(source.id, {method: e.target.value as 'GET' | 'POST'})} className="w-full bg-[var(--color-background)] p-1 rounded">
                                    <option value="GET">GET</option><option value="POST">POST</option>
                                </select>
                                <h4 className="text-xs font-bold pt-2">Headers</h4>
                                {source.headers.map(h => (
                                    <div key={h.id} className="grid grid-cols-12 gap-1 items-center">
                                        <input type="text" value={h.key} onChange={e => handleHeaderChange(source.id, h.id, 'key', e.target.value)} placeholder="Key" className="col-span-5 bg-[var(--color-background)] p-1 rounded"/>
                                        <input type="text" value={h.value} onChange={e => handleHeaderChange(source.id, h.id, 'value', e.target.value)} placeholder="Value" className="col-span-6 bg-[var(--color-background)] p-1 rounded"/>
                                        <button onClick={() => removeHeader(source.id, h.id)} className="col-span-1 text-gray-400 hover:text-red-500 flex justify-center"><TrashIcon /></button>
                                    </div>
                                ))}
                                <button onClick={() => addHeader(source.id)} className="w-full text-xs text-center p-1 bg-[var(--color-background)] hover:bg-[var(--color-border)] rounded-md flex items-center justify-center gap-1"><PlusIcon /> Add Header</button>
                            </div>
                        )}
                    </div>
                ))}
                <button onClick={handleAddSource} className="w-full text-xs text-center p-1 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] rounded-md flex items-center justify-center gap-1">
                    <PlusIcon /> Add API Source
                </button>
            </div>
        </CollapsibleSection>
    );
};

export const DataPanel: React.FC = () => {
    const { state: { editingComponentId } } = useAppContext();
    if (editingComponentId) {
        return (
            <div className="p-4 text-center text-sm text-[var(--color-text-tertiary)]">
                <p>Data management is disabled while editing a component.</p>
            </div>
        )
    }
    return (
        <div className="p-2">
            <ClientStateEditor />
            <ApiDataSourceEditor />
        </div>
    );
};
