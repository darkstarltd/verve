import React from 'react';
import { CustomComponent, ComponentSlot, DeepReadonly } from '../types';
import { useAppContext } from '../context/AppContext';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const ComponentSlotEditor: React.FC<{
    component: DeepReadonly<CustomComponent>;
}> = ({ component }) => {
    const { dispatch } = useAppContext();

    const handleAddSlot = () => {
        const newSlot: ComponentSlot = {
            id: uuidv4(),
            name: `Slot ${component.slots.length + 1}`
        };
        dispatch({
            type: 'ADD_COMPONENT_SLOT',
            payload: { componentId: component.id, slot: newSlot }
        });
    };

    const handleUpdateSlot = (slotId: string, name: string) => {
        dispatch({
            type: 'UPDATE_COMPONENT_SLOT',
            payload: { componentId: component.id, slotId, name }
        });
    };

    const handleDeleteSlot = (slotId: string) => {
        dispatch({
            type: 'DELETE_COMPONENT_SLOT',
            payload: { componentId: component.id, slotId }
        });
    };

    return (
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold text-md mb-2">Component Slots</h4>
                <p className="text-xs text-[var(--color-text-tertiary)]">Define areas where other elements can be placed inside your component.</p>
            </div>
            <div className="space-y-2">
                {component.slots.map(slot => (
                    <div key={slot.id} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={slot.name}
                            onChange={e => handleUpdateSlot(slot.id, e.target.value)}
                            className="w-full bg-[var(--color-surface-light)] p-2 rounded text-sm border border-[var(--color-border)]"
                        />
                        <button onClick={() => handleDeleteSlot(slot.id)} className="p-2 text-gray-400 hover:text-red-500">
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>
            <button
                onClick={handleAddSlot}
                className="w-full text-sm text-center p-2 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] rounded-md flex items-center justify-center gap-2"
            >
                <Plus /> Add Slot
            </button>
        </div>
    );
};
