import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { MockApiEndpoint } from '../types';
import { PlusIcon, TrashIcon, Save } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import MonacoEditor from 'react-monaco-editor';
import { toast } from 'react-hot-toast';

export const MockApiEditor: React.FC = () => {
    const { state: { mockApiEndpoints }, dispatch } = useAppContext();
    const [selectedEndpoint, setSelectedEndpoint] = useState<MockApiEndpoint | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const handleSelect = (endpoint: MockApiEndpoint) => {
        setSelectedEndpoint(JSON.parse(JSON.stringify(endpoint))); // Deep copy for editing
        setIsCreating(false);
    };

    const handleAddNew = () => {
        const newEndpoint: MockApiEndpoint = {
            id: uuidv4(),
            path: '/api/new-endpoint',
            method: 'GET',
            responseBody: '{\n  "message": "Hello, World!"\n}',
        };
        setSelectedEndpoint(newEndpoint);
        setIsCreating(true);
    };

    const handleUpdate = (updates: Partial<MockApiEndpoint>) => {
        if (selectedEndpoint) {
            setSelectedEndpoint({ ...selectedEndpoint, ...updates });
        }
    };

    const handleSave = () => {
        if (!selectedEndpoint) return;
        
        try {
            JSON.parse(selectedEndpoint.responseBody);
        } catch(e) {
            toast.error("Invalid JSON in response body.");
            return;
        }

        const actionType = isCreating ? 'ADD_MOCK_API_ENDPOINT' : 'UPDATE_MOCK_API_ENDPOINT';
        dispatch({ type: actionType, payload: selectedEndpoint });
        setIsCreating(false);
        toast.success(`Endpoint ${selectedEndpoint.path} saved!`);
    };

    const handleDelete = () => {
        if (selectedEndpoint && !isCreating) {
            if (window.confirm(`Are you sure you want to delete the endpoint "${selectedEndpoint.path}"?`)) {
                dispatch({ type: 'DELETE_MOCK_API_ENDPOINT', payload: selectedEndpoint.id });
                setSelectedEndpoint(null);
            }
        } else {
            setSelectedEndpoint(null);
            setIsCreating(false);
        }
    };

    return (
        <div className="h-full flex gap-4">
            <div className="w-1/3 bg-[var(--color-surface)] rounded-lg p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">Endpoints</h3>
                    <button onClick={handleAddNew} className="p-1 hover:bg-[var(--color-border)] rounded-md"><PlusIcon size={16}/></button>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto">
                    {mockApiEndpoints.map(endpoint => (
                        <div
                            key={endpoint.id}
                            onClick={() => handleSelect(endpoint)}
                            className={`p-2 rounded-md cursor-pointer ${selectedEndpoint?.id === endpoint.id ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-light)] hover:bg-[var(--color-border)]'}`}
                        >
                            <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{endpoint.method}</span>
                            <span className="ml-2 font-mono text-sm">{endpoint.path}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-2/3 bg-[var(--color-surface)] rounded-lg p-4 flex flex-col">
                {selectedEndpoint ? (
                    <>
                        <div className="flex-shrink-0 space-y-4 mb-4">
                             <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-semibold">Method</label>
                                    <select value={selectedEndpoint.method} onChange={e => handleUpdate({ method: e.target.value as MockApiEndpoint['method'] })} className="w-full bg-[var(--color-background)] p-2 rounded-md mt-1 border border-[var(--color-border)]">
                                        <option>GET</option>
                                        <option>POST</option>
                                        <option>PUT</option>
                                        <option>DELETE</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-semibold">Path</label>
                                    <input type="text" value={selectedEndpoint.path} onChange={e => handleUpdate({ path: e.target.value })} className="w-full bg-[var(--color-background)] p-2 rounded-md mt-1 border border-[var(--color-border)] font-mono" placeholder="/api/users" />
                                </div>
                             </div>
                             <div>
                                <label className="text-xs font-semibold">JSON Response Body</label>
                             </div>
                        </div>
                        <div className="flex-1 rounded-md overflow-hidden border border-[var(--color-border)]">
                            <MonacoEditor
                                height="100%"
                                language="json"
                                theme="vs-dark"
                                value={selectedEndpoint.responseBody}
                                onChange={value => handleUpdate({ responseBody: value })}
                                options={{ minimap: { enabled: false }, automaticLayout: true, scrollBeyondLastLine: false }}
                            />
                        </div>
                         <div className="flex-shrink-0 flex justify-end gap-3 mt-4">
                            <button onClick={handleDelete} className="px-4 py-2 bg-[var(--color-danger)] hover:bg-[var(--color-danger-hover)] rounded-md text-sm font-semibold flex items-center gap-2">
                                <TrashIcon size={16}/> {isCreating ? 'Cancel' : 'Delete'}
                            </button>
                            <button onClick={handleSave} className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-md text-sm font-semibold flex items-center gap-2">
                                <Save size={16}/> Save Endpoint
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex h-full items-center justify-center text-center text-[var(--color-text-tertiary)]">
                        <div>
                            <p>Select an endpoint to edit, or</p>
                            <button onClick={handleAddNew} className="text-[var(--color-primary)] hover:underline mt-1">add a new one</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
