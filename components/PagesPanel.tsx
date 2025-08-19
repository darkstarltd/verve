
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { PlusIcon, DuplicateIcon, TrashIcon } from './icons';

export const PagesPanel: React.FC = () => {
    const { state: { pages, activePageId, editingComponentId }, dispatch } = useAppContext();
    const [editingPageId, setEditingPageId] = useState<string | null>(null);
    const [pageName, setPageName] = useState('');

    const isEditingComponent = !!editingComponentId;

    const handleAddPage = () => {
        const newPageName = `Page ${pages.length + 1}`;
        dispatch({ type: 'ADD_PAGE', payload: { name: newPageName } });
    };

    const handleSelectPage = (id: string) => {
        if (!isEditingComponent) {
            dispatch({ type: 'SET_ACTIVE_PAGE', payload: id });
        }
    };
    
    const handleDeletePage = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (pages.length > 1 && window.confirm('Are you sure you want to delete this page?')) {
            dispatch({ type: 'DELETE_PAGE', payload: id });
        }
    };

    const handleDuplicatePage = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        dispatch({ type: 'DUPLICATE_PAGE', payload: id });
    };

    const handleStartEditing = (id: string, currentName: string) => {
        setEditingPageId(id);
        setPageName(currentName);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPageName(e.target.value);
    };

    const handleFinishEditing = () => {
        if (editingPageId && pageName.trim()) {
            dispatch({ type: 'UPDATE_PAGE_NAME', payload: { id: editingPageId, name: pageName.trim() } });
        }
        setEditingPageId(null);
        setPageName('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleFinishEditing();
        } else if (e.key === 'Escape') {
            setEditingPageId(null);
            setPageName('');
        }
    };

    if (isEditingComponent) {
        return (
            <div className="p-4 text-center text-sm text-[var(--color-text-tertiary)]">
                <p>Page management is disabled while editing a component.</p>
                <button
                    onClick={() => dispatch({ type: 'SET_EDITING_COMPONENT_ID', payload: null })}
                    className="mt-4 text-xs px-2 py-1 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] rounded-md"
                >
                    Return to Page View
                </button>
            </div>
        );
    }

    return (
        <div className="p-2 space-y-1">
            <button
                onClick={handleAddPage}
                className="w-full mb-2 px-2 py-1.5 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] text-sm font-medium rounded-md flex items-center justify-center gap-2"
            >
                <PlusIcon size={14} /> Add New Page
            </button>
            {pages.map(page => (
                <div
                    key={page.id}
                    onClick={() => handleSelectPage(page.id)}
                    onDoubleClick={() => handleStartEditing(page.id, page.name)}
                    className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                        activePageId === page.id
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'hover:bg-[var(--color-surface-light)]'
                    }`}
                >
                    {editingPageId === page.id ? (
                        <input
                            type="text"
                            value={pageName}
                            onChange={handleNameChange}
                            onBlur={handleFinishEditing}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-transparent border-b border-white/50 outline-none text-sm"
                            autoFocus
                        />
                    ) : (
                        <span className="text-sm truncate">{page.name}</span>
                    )}

                    {editingPageId !== page.id && (
                        <div className="hidden group-hover:flex items-center gap-1">
                            <button onClick={(e) => handleDuplicatePage(e, page.id)} title="Duplicate Page" className="p-1 hover:bg-white/10 rounded"><DuplicateIcon /></button>
                            <button onClick={(e) => handleDeletePage(e, page.id)} title="Delete Page" className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-red-400"><TrashIcon /></button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
