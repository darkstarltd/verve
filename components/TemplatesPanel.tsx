import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { TEMPLATES } from '../lib/templates';
import { Template } from '../types';
import { CollapsibleSection } from './StylePropertyEditor';
import { useAppContext } from '../context/AppContext';

const DraggableTemplate: React.FC<{
  id: string;
  data: { [key: string]: any };
  name: string;
  icon: React.ReactNode;
}> = ({ id, data, name, icon }) => {
    const { state: { previewMode } } = useAppContext();
    const { attributes, listeners, setNodeRef } = useDraggable({ id, data, disabled: previewMode });

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

export const TemplatesPanel: React.FC = () => {
  const groupedTemplates = TEMPLATES.reduce((acc, item) => {
    const category = item.category || 'Misc';
    (acc[category] = acc[category] || []).push(item);
    return acc;
  }, {} as Record<string, Template[]>);

  return (
    <div className="p-2 space-y-4">
      {Object.entries(groupedTemplates).map(([category, items]) => (
        <CollapsibleSection title={category} key={category} defaultOpen>
          <div className="grid grid-cols-1 gap-2 p-2">
            {items.map((template, index) => (
              <DraggableTemplate
                key={template.name}
                id={`template-${index}`}
                data={{ templateIndex: index, isTemplate: true }}
                name={template.name}
                icon={template.icon}
              />
            ))}
          </div>
        </CollapsibleSection>
      ))}
    </div>
  );
};