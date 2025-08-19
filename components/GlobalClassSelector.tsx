import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Element } from '../types';

interface GlobalClassSelectorProps {
    element: Element;
}

export const GlobalClassSelector: React.FC<GlobalClassSelectorProps> = ({ element }) => {
    const { state: { theme }, updateElement } = useAppContext();
    const globalClasses = Object.keys(theme.globalClasses);
    const appliedClasses = element.props?.className?.split(' ').filter(Boolean) || [];

    const handleClassToggle = (className: string) => {
        const newClasses = appliedClasses.includes(className)
            ? appliedClasses.filter(c => c !== className)
            : [...appliedClasses, className];
        
        updateElement(element.id, { props: { ...element.props, className: newClasses.join(' ') } });
    };

    if (globalClasses.length === 0) {
        return <p className="text-xs text-[var(--color-text-tertiary)] text-center p-2">No global classes defined in Theme panel.</p>;
    }

    return (
        <div className="space-y-2 max-h-48 overflow-y-auto bg-[var(--color-background)] p-2 rounded-md">
            {globalClasses.map(className => (
                <div key={className} className="flex items-center">
                    <input
                        type="checkbox"
                        id={`class-toggle-${className}`}
                        checked={appliedClasses.includes(className)}
                        onChange={() => handleClassToggle(className)}
                        className="h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-[var(--color-surface-light)]"
                    />
                    <label htmlFor={`class-toggle-${className}`} className="ml-2 block text-sm text-[var(--color-text-secondary)] font-mono">
                        .{className}
                    </label>
                </div>
            ))}
        </div>
    );
};
