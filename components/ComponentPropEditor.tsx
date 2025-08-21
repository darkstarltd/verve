import React from 'react';
import { CustomComponent, DeepReadonly, PropDefinition } from '../types';
import { useAppContext } from '../context/AppContext';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { generatePropDescription } from '../lib/ai';
import { toast } from 'react-hot-toast';

export const ComponentPropEditor: React.FC<{
    component: DeepReadonly<CustomComponent>;
}> = ({ component }) => {
    const { dispatch } = useAppContext();

    const handleUpdateComponent = (updates: Partial<CustomComponent>) => {
        dispatch({ type: 'UPDATE_COMPONENT_DEFINITION', payload: { componentId: component.id, updates } });
    };

    const handleAddProp = () => {
        const newProp: PropDefinition = { name: `prop${component.propsDefinition.length + 1}`, type: 'string', defaultValue: '' };
        handleUpdateComponent({ propsDefinition: [...component.propsDefinition, newProp] });
    };

    const handleUpdateProp = (index: number, updates: Partial<PropDefinition>) => {
        const newProps = [...component.propsDefinition];
        newProps[index] = { ...newProps[index], ...updates };
        handleUpdateComponent({ propsDefinition: newProps });
    };


    const handleDeleteProp = (index: number) => {
        const newProps = component.propsDefinition.filter((_, i) => i !== index);
        handleUpdateComponent({ propsDefinition: newProps });
    };

    const handleAiDescription = async (index: number) => {
        const prop = component.propsDefinition[index];
        const toastId = toast.loading("Generating description...");
        try {
            const description = await generatePropDescription(prop.name, prop.type, component.name);
            handleUpdateProp(index, { description });
            toast.success("Description generated!", { id: toastId });
        } catch (e) {
            toast.error("Failed to generate description.", { id: toastId });
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold text-md mb-2">Component Props</h4>
                <p className="text-xs text-[var(--color-text-tertiary)]">Define properties that can be configured on instances of this component.</p>
            </div>
            <div className="space-y-3">
                {component.propsDefinition.map((prop, index) => (
                    <div key={index} className="bg-[var(--color-surface-light)] p-3 rounded-lg space-y-2">
                        <div className="grid grid-cols-12 gap-2 items-center">
                            <input
                                type="text"
                                value={prop.name}
                                onChange={e => handleUpdateProp(index, { name: e.target.value })}
                                className="col-span-5 w-full bg-[var(--color-background)] p-2 rounded text-sm"
                                placeholder="Prop Name"
                            />
                            <select
                                value={prop.type}
                                onChange={e => handleUpdateProp(index, { type: e.target.value as PropDefinition['type'] })}
                                className="col-span-3 w-full bg-[var(--color-background)] p-2 rounded text-sm"
                            >
                                <option value="string">String</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                                <option value="image">Image URL</option>
                            </select>
                             <input
                                type="text"
                                value={String(prop.defaultValue)}
                                onChange={e => handleUpdateProp(index, { defaultValue: e.target.value })}
                                className="col-span-3 w-full bg-[var(--color-background)] p-2 rounded text-sm"
                                placeholder="Default"
                            />
                            <button onClick={() => handleDeleteProp(index)} className="col-span-1 p-2 text-gray-400 hover:text-red-500 flex justify-center">
                                <Trash2 size={14} />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                             <input
                                type="text"
                                value={prop.description || ''}
                                onChange={e => handleUpdateProp(index, { description: e.target.value })}
                                className="flex-1 w-full bg-[var(--color-background)] p-2 rounded text-sm text-[var(--color-text-secondary)]"
                                placeholder="Prop description..."
                            />
                            <button onClick={() => handleAiDescription(index)} title="Generate Description with AI" className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-background)] rounded-md">
                                <Sparkles size={16}/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={handleAddProp}
                className="w-full text-sm text-center p-2 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] rounded-md flex items-center justify-center gap-2"
            >
                <Plus /> Add Prop
            </button>
        </div>
    );
};
