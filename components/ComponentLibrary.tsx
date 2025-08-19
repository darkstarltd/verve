

import React from 'react';
import { useAppContext } from '../context/AppContext';
import { componentLibrary } from '../constants';
import { useDraggable } from '@dnd-kit/core';
import { ComponentDefinition, CustomComponent } from '../types';
import { CollapsibleSection } from './StylePropertyEditor';
import { ComponentIcon } from './icons';

const DraggableItem: React.FC<{
  id: string;
  data: { [key: string]: any };
  name: string;
  icon: React.ReactNode;
}> = ({ id, data, name, icon }) => {
    const { attributes, listeners, setNodeRef } = useDraggable({ id, data });

    return (
        <div 
            ref={setNodeRef} 
            {...listeners} 
            {...attributes}
            className="p-3 text-sm bg-[var(--color-surface-light)] rounded-md cursor-grab active:cursor-grabbing hover:bg-[var(--color-border)] flex items-center gap-3"
            title={`Drag to add ${name}`}
        >
            <div className="w-5 h-5 flex items-center justify-center text-[var(--color-primary)]">{icon}</div>
            <span className="truncate">{name}</span>
        </div>
    );
};

export const ComponentLibrary: React.FC = () => {
  const { state } = useAppContext();
  const { projectType, customComponents } = state;
  const currentLibrary = componentLibrary[projectType] || componentLibrary.web;

  const groupedComponents = currentLibrary.reduce((acc, item) => {
    const category = item.category || 'Misc';
    (acc[category] = acc[category] || []).push(item);
    return acc;
  }, {} as Record<string, ComponentDefinition[]>);

  return (
    <div className="p-2 space-y-4">
      {customComponents.length > 0 && (
        <CollapsibleSection title="Custom Components" defaultOpen>
          <div className="grid grid-cols-2 gap-2 p-2">
            {customComponents.map((comp) => (
              <DraggableItem
                key={comp.id}
                id={`custom-component-${comp.id}`}
                data={{ componentId: comp.id, isCustomComponent: true }}
                name={comp.name}
                icon={<ComponentIcon />}
              />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {Object.entries(groupedComponents).map(([category, items]) => (
        <CollapsibleSection title={category} key={category} defaultOpen>
          <div className="grid grid-cols-2 gap-2 p-2">
            {items.map((item) => (
              <DraggableItem
                key={item.type}
                id={`component-${item.type}`}
                data={{ type: item.type, isComponent: true }}
                name={item.name}
                icon={item.icon}
              />
            ))}
          </div>
        </CollapsibleSection>
      ))}
    </div>
  );
};