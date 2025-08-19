import React, { useState, useMemo } from 'react';
import * as MdIcons from 'react-icons/md';
import * as FaIcons from 'react-icons/fa';
import { Element } from '../types';
import { useAppContext } from '../context/AppContext';
import { CollapsibleSection } from './StylePropertyEditor';
import { SearchIcon } from './icons';

interface IconPickerProps {
    selectedElement: Element;
}

const ICON_LIBRARIES = {
    md: { name: 'Material Design', icons: MdIcons },
    fa: { name: 'Font Awesome', icons: FaIcons }
};

export const IconPicker: React.FC<IconPickerProps> = ({ selectedElement }) => {
    const { updateElement } = useAppContext();
    const { props } = selectedElement;

    const [search, setSearch] = useState('');
    const [activeSet, setActiveSet] = useState<'md' | 'fa'>(props?.iconSet || 'md');

    const filteredIcons = useMemo(() => {
        const iconList = Object.keys(ICON_LIBRARIES[activeSet].icons);
        if (!search) return iconList.slice(0, 100); // Limit initial display
        return iconList.filter(name => name.toLowerCase().includes(search.toLowerCase())).slice(0, 100);
    }, [search, activeSet]);

    const handleSelectIcon = (iconName: string) => {
        updateElement(selectedElement.id, { props: { ...props, iconSet: activeSet, iconName } });
    };

    const handlePropChange = (prop: string, value: any) => {
        updateElement(selectedElement.id, { props: { ...selectedElement.props, [prop]: value } });
    }

    return (
        <CollapsibleSection title="Icon Properties" defaultOpen>
            <div className="space-y-4">
                <div className="flex bg-[var(--color-background)] rounded-lg p-1">
                    {Object.entries(ICON_LIBRARIES).map(([id, lib]) => (
                        <button key={id} onClick={() => setActiveSet(id as 'md' | 'fa')} className={`flex-1 py-1 text-sm rounded-md ${activeSet === id ? 'bg-[var(--color-primary)]' : ''}`}>
                            {lib.name}
                        </button>
                    ))}
                </div>
                 <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-text-tertiary)]"><SearchIcon /></span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={`Search ${ICON_LIBRARIES[activeSet].name} icons...`}
                        className="w-full bg-[var(--color-surface-light)] rounded-md py-2 pl-10 pr-4 text-sm text-white border border-[var(--color-border)]"
                    />
                </div>
                <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto bg-[var(--color-background)] p-2 rounded-md">
                    {filteredIcons.map(iconName => {
                        const IconComponent = ICON_LIBRARIES[activeSet].icons[iconName];
                        const isSelected = props?.iconSet === activeSet && props?.iconName === iconName;
                        return (
                            <button
                                key={iconName}
                                onClick={() => handleSelectIcon(iconName)}
                                title={iconName}
                                className={`aspect-square flex items-center justify-center text-2xl rounded-md ${isSelected ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] text-[var(--color-text-secondary)]'}`}
                            >
                                <IconComponent />
                            </button>
                        );
                    })}
                </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Size (px)</label>
                        <input
                            type="number"
                            value={props?.size || 24}
                            onChange={(e) => handlePropChange('size', parseInt(e.target.value, 10))}
                            className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm text-white border border-[var(--color-border)]"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Color</label>
                        <input
                            type="color"
                            value={props?.color || '#FFFFFF'}
                            onChange={(e) => handlePropChange('color', e.target.value)}
                            className="w-full h-10 p-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-md"
                        />
                    </div>
                 </div>
            </div>
        </CollapsibleSection>
    );
};
