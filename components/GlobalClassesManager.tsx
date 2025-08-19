import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { StylePropertyEditor } from './StylePropertyEditor';
import { Style } from '../types';
import { PlusIcon, TrashIcon } from './icons';

export const GlobalClassesManager: React.FC = () => {
    const { state: { theme }, dispatch } = useAppContext();
    const [selectedClass, setSelectedClass] = useState<string | null>(null);

    const handleAddClass = () => {
        const newClassName = `new-class-${Object.keys(theme.globalClasses).length + 1}`;
        dispatch({ type: 'ADD_GLOBAL_CLASS', payload: { className: newClassName, styles: {} } });
        setSelectedClass(newClassName);
    };

    const handleDeleteClass = (e: React.MouseEvent, className: string) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete the class "${className}"?`)) {
            dispatch({ type: 'DELETE_GLOBAL_CLASS', payload: { className } });
            if (selectedClass === className) {
                setSelectedClass(null);
            }
        }
    };

    const handleStyleChange = (style: string, value: any) => {
        if (!selectedClass) return;
        const currentStyles = theme.globalClasses[selectedClass] || {};
        const newStyles: Style = { ...currentStyles, [style]: value };
        dispatch({ type: 'UPDATE_GLOBAL_CLASS', payload: { className: selectedClass, styles: newStyles } });
    };

    const selectedElementMock = selectedClass ? {
        id: selectedClass,
        type: 'container',
        name: selectedClass,
        styles: { desktop: theme.globalClasses[selectedClass] || {} }
    } : null;

    return (
        <div className="space-y-4">
            <button
                onClick={handleAddClass}
                className="w-full px-4 py-2 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] text-sm font-medium rounded-md flex items-center justify-center gap-2"
            >
                <PlusIcon /> Add New Class
            </button>
            <div className="space-y-1">
                {Object.keys(theme.globalClasses).length === 0 ? (
                     <p className="text-center text-xs text-[var(--color-text-tertiary)] py-2">No global classes defined.</p>
                ) : (
                    Object.keys(theme.globalClasses).map(className => (
                        <div
                            key={className}
                            onClick={() => setSelectedClass(className)}
                            className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${selectedClass === className ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-[var(--color-surface-light)]'}`}
                        >
                            <span className="text-sm font-mono truncate">.{className}</span>
                            <div className="hidden group-hover:flex">
                                <button onClick={(e) => handleDeleteClass(e, className)} className="text-gray-400 hover:text-[var(--color-danger)] text-xs"><TrashIcon /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {selectedElementMock && (
                <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                    <StylePropertyEditor 
                        element={selectedElementMock as any} 
                        onStyleChange={handleStyleChange}
                    />
                </div>
            )}
        </div>
    );
};
