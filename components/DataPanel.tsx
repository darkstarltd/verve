import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { CollapsibleSection } from './StylePropertyEditor';
import { Plus, Trash2, Database, Network, FolderTree } from 'lucide-react';
import { AnyDataSource, RestApiDataSource, PostgresDataSource, FirestoreDataSource } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';

const DataSourceEditor: React.FC<{
    source: AnyDataSource,
    onUpdate: (source: AnyDataSource) => void,
    onDelete: (id: string) => void,
}> = ({ source, onUpdate, onDelete }) => {
    
    const renderFields = () => {
        switch(source.type) {
            case 'rest':
                return (
                    <>
                        <input type="text" value={source.url} onChange={e => onUpdate({ ...source, url: e.target.value })} placeholder="API URL" className="w-full bg-[var(--color-background)] p-1 rounded" />
                        <select value={source.method} onChange={e => onUpdate({ ...source, method: e.target.value as RestApiDataSource['method']})} className="w-full bg-[var(--color-background)] p-1 rounded">
                            <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
                        </select>
                        <select value={source.authType} onChange={e => onUpdate({ ...source, authType: e.target.value as RestApiDataSource['authType']})} className="w-full bg-[var(--color-background)] p-1 rounded">
                            <option value="none">No Auth</option><option value="bearer">Bearer Token</option><option value="basic">Basic Auth</option>
                        </select>
                         {source.authType === 'bearer' && <input type="text" value={source.bearerToken} onChange={e => onUpdate({...source, bearerToken: e.target.value})} placeholder="Bearer Token" className="w-full bg-[var(--color-background)] p-1 rounded"/>}
                    </>
                )
            case 'postgres':
                return (
                     <>
                        <input type="text" value={source.host} onChange={e => onUpdate({ ...source, host: e.target.value })} placeholder="Host" className="w-full bg-[var(--color-background)] p-1 rounded" />
                        <input type="number" value={source.port} onChange={e => onUpdate({ ...source, port: parseInt(e.target.value, 10) })} placeholder="Port" className="w-full bg-[var(--color-background)] p-1 rounded" />
                        <input type="text" value={source.database} onChange={e => onUpdate({ ...source, database: e.target.value })} placeholder="Database" className="w-full bg-[var(--color-background)] p-1 rounded" />
                        <input type="text" value={source.user} onChange={e => onUpdate({ ...source, user: e.target.value })} placeholder="User" className="w-full bg-[var(--color-background)] p-1 rounded" />
                     </>
                )
            case 'firestore':
                 return (
                     <input type="text" value={source.projectId} onChange={e => onUpdate({ ...source, projectId: e.target.value })} placeholder="Project ID" className="w-full bg-[var(--color-background)] p-1 rounded" />
                 )
        }
    }
    
    return (
        <div className="bg-[var(--color-surface-light)] p-3 rounded-b-md space-y-2 text-sm">
            <input type="text" value={source.name} onChange={e => onUpdate({ ...source, name: e.target.value })} placeholder="Source Name" className="w-full bg-[var(--color-background)] p-1 rounded font-semibold" />
            {renderFields()}
            <button className="w-full text-xs text-center p-1 bg-[var(--color-primary)]/80 hover:bg-[var(--color-primary)] rounded-md">Test Connection</button>
        </div>
    )
}

export const DataPanel: React.FC = () => {
    const { state: { dataSources, editingComponentId }, dispatch } = useAppContext();
    const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const handleAddSource = (type: AnyDataSource['type']) => {
        let newSource: AnyDataSource;
        const base = { id: uuidv4(), name: `New ${type} Source` };
        switch(type) {
            case 'postgres': newSource = { ...base, type, host: '', port: 5432, database: '', user: '' }; break;
            case 'firestore': newSource = { ...base, type, projectId: '' }; break;
            case 'rest': default: newSource = { ...base, type: 'rest', url: '', method: 'GET', headers: [], authType: 'none' };
        }
        dispatch({ type: 'ADD_DATA_SOURCE', payload: newSource });
        setEditingSourceId(newSource.id);
        setIsAdding(false);
    };

    const handleUpdate = (source: AnyDataSource) => {
        dispatch({ type: 'UPDATE_DATA_SOURCE', payload: source });
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure? This action cannot be undone.")) {
            dispatch({ type: 'DELETE_DATA_SOURCE', payload: id });
            if (editingSourceId === id) setEditingSourceId(null);
        }
    };
    
    const ICONS: Record<AnyDataSource['type'], React.ReactNode> = {
        rest: <Network size={16}/>,
        postgres: <Database size={16}/>,
        firestore: <FolderTree size={16}/>
    }

    if (editingComponentId) {
        return <div className="p-4 text-center text-sm text-[var(--color-text-tertiary)]"><p>Data management is disabled while editing a component.</p></div>
    }

    return (
        <CollapsibleSection title="Data Sources" defaultOpen>
            <div className="space-y-3 p-2">
                {dataSources.map(source => (
                    <div key={source.id}>
                        <div className="flex justify-between items-center bg-[var(--color-surface-light)] p-2 rounded-t-md cursor-pointer" onClick={() => setEditingSourceId(editingSourceId === source.id ? null : source.id)}>
                           <div className="flex items-center gap-2">
                            <span className="text-[var(--color-primary)]">{ICONS[source.type]}</span>
                            <span className="font-semibold text-sm">{source.name}</span>
                           </div>
                           <button onClick={(e) => { e.stopPropagation(); handleDelete(source.id); }} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                        </div>
                        {editingSourceId === source.id && <DataSourceEditor source={source} onUpdate={handleUpdate} onDelete={handleDelete} />}
                    </div>
                ))}
                {isAdding ? (
                    <div className="bg-[var(--color-surface-light)] p-3 rounded-md space-y-2 text-center">
                        <p className="text-sm font-semibold mb-3">Choose data source type:</p>
                        <button onClick={() => handleAddSource('rest')} className="w-full p-2 bg-[var(--color-background)] hover:bg-[var(--color-border)] rounded-md">REST API</button>
                        <button onClick={() => handleAddSource('postgres')} className="w-full p-2 bg-[var(--color-background)] hover:bg-[var(--color-border)] rounded-md">PostgreSQL</button>
                        <button onClick={() => handleAddSource('firestore')} className="w-full p-2 bg-[var(--color-background)] hover:bg-[var(--color-border)] rounded-md">Firestore</button>
                        <button onClick={() => setIsAdding(false)} className="w-full text-xs text-center p-1 mt-2 hover:underline text-[var(--color-text-tertiary)]">Cancel</button>
                    </div>
                ) : (
                    <button onClick={() => setIsAdding(true)} className="w-full text-xs text-center p-1 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] rounded-md flex items-center justify-center gap-1">
                        <Plus /> Add Data Source
                    </button>
                )}
            </div>
        </CollapsibleSection>
    );
};
