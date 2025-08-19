import React from 'react';
import { GlobalClassesManager } from './GlobalClassesManager';

export const ThemePanel: React.FC = () => {
    return (
        <div className="p-4 text-white">
            <h3 className="font-bold mb-4">Theme & Styling</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">Manage global styles and CSS variables.</p>
            <GlobalClassesManager />
        </div>
    );
};
