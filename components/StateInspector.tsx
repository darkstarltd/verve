import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ChevronDownIcon } from './icons';

const JsonViewer: React.FC<{ data: any; level?: number }> = ({ data, level = 0 }) => {
    if (typeof data !== 'object' || data === null) {
        let valueColor = 'text-green-400';
        if (typeof data === 'string') valueColor = 'text-orange-400';
        if (typeof data === 'boolean') valueColor = 'text-purple-400';
        return <span className={valueColor}>{JSON.stringify(data)}</span>;
    }

    const [isOpen, setIsOpen] = useState(level < 2);
    const entries = Object.entries(data);
    const isArray = Array.isArray(data);

    return (
        <div>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center">
                <ChevronDownIcon size={14} className={`mr-1 transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
                <span className="text-[var(--color-text-secondary)]">{isArray ? '[' : '{'}</span>
                {!isOpen && <span className="text-[var(--color-text-secondary)]">...{isArray ? ']' : '}'}</span>}
            </button>
            {isOpen && (
                <div className="pl-5 border-l border-[var(--color-border-subtle)]">
                    {entries.map(([key, value]) => (
                        <div key={key}>
                            <span className={isArray ? "text-gray-500" : "text-cyan-400"}>{key}:</span>
                            <span className="ml-2"><JsonViewer data={value} level={level + 1}/></span>
                        </div>
                    ))}
                    <span className="text-[var(--color-text-secondary)]">{isArray ? ']' : '}'}</span>
                </div>
            )}
        </div>
    );
};

export const StateInspector: React.FC = () => {
    const { state: { runtimeState, pages, activePageId } } = useAppContext();
    const activePage = pages.find(p => p.id === activePageId);

    return (
        <div className="h-full bg-[var(--color-surface)] rounded-lg p-4 text-sm font-mono text-white overflow-auto">
            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4 font-sans">Live State Inspector</h3>
            <div>
                <h4 className="text-md font-semibold text-[var(--color-text-secondary)] mb-2 font-sans">Client State (runtimeState)</h4>
                {Object.keys(runtimeState).length > 0 ? (
                    <JsonViewer data={runtimeState} />
                ) : (
                    <p className="text-xs text-[var(--color-text-tertiary)] font-sans">No client state variables defined for this page.</p>
                )}
            </div>
            <div className="mt-6">
                <h4 className="text-md font-semibold text-[var(--color-text-secondary)] mb-2 font-sans">API Data (page.dataState)</h4>
                {Object.keys(activePage?.dataState || {}).length > 0 ? (
                    <JsonViewer data={activePage?.dataState || {}} />
                ) : (
                     <p className="text-xs text-[var(--color-text-tertiary)] font-sans">No API data loaded.</p>
                )}
            </div>
        </div>
    );
};