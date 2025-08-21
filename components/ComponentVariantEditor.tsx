
import React, { useState, useMemo } from 'react';
import { CustomComponent, DeepReadonly, VariantPropertyGroup, VariantOption, Style, ResponsiveStyles } from '../types';
import { useAppContext } from '../context/AppContext';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { StylePropertyEditor } from './StylePropertyEditor';

const VariantPropertyManager: React.FC<{
    component: DeepReadonly<CustomComponent>;
}> = ({ component }) => {
    const { dispatch } = useAppContext();

    const handleAddProperty = () => {
        const newProp: VariantPropertyGroup = {
            id: uuidv4(),
            name: `Variant ${component.variantProperties.length + 1}`,
            options: [{ id: uuidv4(), name: 'Default' }]
        };
        dispatch({ type: 'ADD_VARIANT_PROPERTY', payload: { componentId: component.id, property: newProp } });
    };

    const handleUpdateProperty = (propId: string, name: string) => {
        dispatch({ type: 'UPDATE_VARIANT_PROPERTY', payload: { componentId: component.id, propertyId: propId, name } });
    };

    const handleDeleteProperty = (propId: string) => {
        dispatch({ type: 'DELETE_VARIANT_PROPERTY', payload: { componentId: component.id, propertyId: propId } });
    };

    const handleAddOption = (propId: string) => {
        const newOption: VariantOption = { id: uuidv4(), name: 'New Option' };
        dispatch({ type: 'ADD_VARIANT_OPTION', payload: { componentId: component.id, propertyId: propId, option: newOption } });
    };

    const handleUpdateOption = (propId: string, optionId: string, name: string) => {
        dispatch({ type: 'UPDATE_VARIANT_OPTION', payload: { componentId: component.id, propertyId: propId, optionId, name } });
    };

    const handleDeleteOption = (propId: string, optionId: string) => {
        dispatch({ type: 'DELETE_VARIANT_OPTION', payload: { componentId: component.id, propertyId: propId, optionId } });
    };

    return (
        <div className="space-y-4">
            {component.variantProperties.map(prop => (
                <div key={prop.id} className="bg-[var(--color-surface-light)] p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <input
                            type="text"
                            value={prop.name}
                            onChange={e => handleUpdateProperty(prop.id, e.target.value)}
                            className="flex-1 w-full bg-[var(--color-background)] p-2 rounded text-sm font-semibold"
                        />
                        <button onClick={() => handleDeleteProperty(prop.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                    <div className="space-y-1 pl-4">
                        {prop.options.map(opt => (
                            <div key={opt.id} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={opt.name}
                                    onChange={e => handleUpdateOption(prop.id, opt.id, e.target.value)}
                                    className="w-full bg-[var(--color-background)] p-1 rounded text-xs"
                                />
                                <button onClick={() => handleDeleteOption(prop.id, opt.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => handleAddOption(prop.id)} className="w-full text-xs text-center mt-2 p-1 bg-[var(--color-background)] hover:bg-[var(--color-border)] rounded-md flex items-center justify-center gap-1">
                        <Plus /> Add Option
                    </button>
                </div>
            ))}
            <button onClick={handleAddProperty} className="w-full text-sm text-center p-2 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] rounded-md flex items-center justify-center gap-2">
                <Plus /> Add Variant Property
            </button>
        </div>
    );
};

export const ComponentVariantEditor: React.FC<{
    component: DeepReadonly<CustomComponent>;
}> = ({ component }) => {
    const { dispatch } = useAppContext();
    const [selectedCombination, setSelectedCombination] = useState<{[key: string]: string}>({});

    const currentOverride = useMemo(() => {
        if (Object.keys(selectedCombination).length === 0) return undefined;
        return component.variantStyleOverrides.find(o => {
            return Object.entries(selectedCombination).every(([propId, optId]) => o.variantCombination[propId] === optId) &&
                   Object.keys(o.variantCombination).length === Object.keys(selectedCombination).length;
        });
    }, [selectedCombination, component.variantStyleOverrides]);

    const handleStyleChange = (style: string, value: any, viewport: any) => {
        if (Object.keys(selectedCombination).length === 0) return;
        const newStyles: ResponsiveStyles = JSON.parse(JSON.stringify(currentOverride?.styles || { desktop: {} }));
        if (!newStyles[viewport as keyof ResponsiveStyles]) {
            (newStyles as any)[viewport] = {};
        }
        (newStyles[viewport as keyof ResponsiveStyles] as any)[style] = value;
        dispatch({ type: 'UPDATE_VARIANT_STYLE_OVERRIDE', payload: { componentId: component.id, combination: selectedCombination, styles: newStyles } });
    };

    return (
        <div className="space-y-6">
            <div>
                <h4 className="font-semibold text-md mb-2">Variant Properties</h4>
                <p className="text-xs text-[var(--color-text-tertiary)]">Define properties and options to create different versions of your component.</p>
                <VariantPropertyManager component={component} />
            </div>
            
            {component.variantProperties.length > 0 && (
                <div className="pt-4 border-t border-[var(--color-border)]">
                    <h4 className="font-semibold text-md mb-2">Variant Style Overrides</h4>
                    <p className="text-xs text-[var(--color-text-tertiary)] mb-3">Select a combination of variants to apply specific style overrides.</p>
                    
                    <div className="space-y-3 bg-[var(--color-surface)] p-3 rounded-lg">
                        {component.variantProperties.map(prop => (
                            <div key={prop.id}>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{prop.name}</label>
                                <select 
                                    value={selectedCombination[prop.id] || ''}
                                    onChange={e => {
                                        const newCombination = {...selectedCombination, [prop.id]: e.target.value};
                                        // clean up empty selections
                                        if (e.target.value === '') {
                                            delete newCombination[prop.id];
                                        }
                                        setSelectedCombination(newCombination);
                                    }}
                                    className="w-full bg-[var(--color-background)] p-2 rounded text-sm border border-[var(--color-border)]"
                                >
                                    <option value="">(Not set)</option>
                                    {prop.options.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>

                    {Object.keys(selectedCombination).length > 0 && (
                        <div className="mt-4">
                            <StylePropertyEditor 
                                element={{
                                    id: component.id,
                                    type: component.mainElement.type,
                                    name: 'Variant Style',
                                    styles: currentOverride?.styles || { desktop: {} }
                                } as DeepReadonly<any>}
                                onStyleChange={handleStyleChange}
                                onAiResponsiveGenerated={() => {}}
                                parentElement={null}
                                mainComponentDef={null}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};