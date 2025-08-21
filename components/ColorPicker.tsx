import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';

interface ColorPickerProps {
    value: string;
    onChange: (value: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
    const { state: { theme } } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const handleColorChange = (color: string) => {
        onChange(color);
    };
    
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const themeColors = Object.entries(theme.variables)
        .filter(([key]) => key.includes('--color'))
        .map(([name, value]) => ({ name, value }));

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div className="flex items-center w-full bg-[var(--color-surface-light)] rounded-md border border-[var(--color-border)]">
                <div 
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-8 h-8 flex-shrink-0 cursor-pointer rounded-l-md border-r border-[var(--color-border)]"
                    style={{ backgroundColor: value }}
                />
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => handleColorChange(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    className="w-full bg-transparent p-2 text-sm text-white outline-none"
                    placeholder="e.g., #FFFFFF or var(--color-primary)"
                />
            </div>

            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl z-20 p-4">
                    <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2">Theme Colors</p>
                    <div className="grid grid-cols-5 gap-2">
                        {themeColors.map(({ name, value: colorValue }) => (
                            <button
                                key={name}
                                onClick={() => { handleColorChange(`var(${name})`); setIsOpen(false); }}
                                title={`${name}: ${colorValue}`}
                                className="w-full aspect-square rounded-md border border-white/10"
                                style={{ backgroundColor: colorValue }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};