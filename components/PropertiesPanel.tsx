
import React from 'react';
import { Element, Style, AnimationProperties, PropDefinition, ConditionalDisplay, CustomComponent } from '../types';
import { StylePropertyEditor, CollapsibleSection } from './StylePropertyEditor';
import { useAppContext } from '../context/AppContext';
import { AiContentGenerator } from './AiContentGenerator';
import { AiStyleAssistant } from './AiStyleAssistant';
import { toast } from 'react-hot-toast';
import { AnimationPropertyEditor } from './AnimationPropertyEditor';
import { InteractionsPropertyEditor } from './InteractionsPropertyEditor';
import { ImagePropertyEditor } from './ImagePropertyEditor';
import { DataBindingEditor } from './DataBindingEditor';
import { SlidersIcon, PlusIcon, TrashIcon } from './icons';
import { findElementDeep } from '../lib/treeUtils';
import { IconPicker } from './IconPicker';
import { GlobalClassSelector } from './GlobalClassSelector';

const TailwindPropertyEditor: React.FC<{element: Element}> = ({ element }) => {
    const { updateElement } = useAppContext();
    const handleTailwindChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateElement(element.id, { tailwindClasses: e.target.value });
    };

    return (
        <CollapsibleSection title="Tailwind Classes">
            <textarea
                value={element.tailwindClasses || ''}
                onChange={handleTailwindChange}
                className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm text-white border border-[var(--color-border)] font-mono"
                rows={3}
                placeholder="e.g., bg-blue-500 text-white p-4"
            />
        </CollapsibleSection>
    );
};
const PropInput: React.FC<{ propDef: PropDefinition, value: any, onChange: (value: any) => void }> = ({ propDef, value, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        switch (propDef.type) {
            case 'number':
                onChange(parseFloat(e.target.value));
                break;
            case 'boolean':
                onChange(e.target.checked);
                break;
            default:
                onChange(e.target.value);
        }
    };

    if (propDef.type === 'boolean') {
        return (
            <div className="flex items-center justify-between">
                <label className="text-sm text-[var(--color-text-secondary)]">{propDef.name}</label>
                <input type="checkbox" checked={!!value} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-[var(--color-surface-light)]" />
            </div>
        );
    }
    
    return (
        <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{propDef.name}</label>
            <input
                type={propDef.type === 'number' ? 'number' : 'text'}
                value={value ?? ''}
                onChange={handleChange}
                className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm text-white border border-[var(--color-border)]"
            />
        </div>
    );
};

const ConditionalDisplayEditor: React.FC<{element: Element}> = ({ element }) => {
    const { updateElement, state: { pages, activePageId } } = useAppContext();
    const activePage = pages.find(p => p.id === activePageId);
    const stateVariables = activePage?.stateDefinition || [];
    const conditional = element.conditionalDisplay;

    const handleUpdate = (updates: Partial<ConditionalDisplay> | null) => {
        if (updates === null) {
             const { conditionalDisplay, ...rest } = element;
             updateElement(element.id, rest as any); // a bit hacky but removes the property
        } else {
            updateElement(element.id, { conditionalDisplay: { ...conditional, ...updates }});
        }
    };
    
    if (stateVariables.length === 0) return null;

    return (
        <CollapsibleSection title="Conditional Display">
            <div className="space-y-2">
                <select value={conditional?.stateKey || ''} onChange={e => handleUpdate({ stateKey: e.target.value, operator: '===' })} className="w-full bg-[var(--color-surface-light)] rounded p-1 text-xs">
                    <option value="">Always show</option>
                    {stateVariables.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                </select>
                {conditional?.stateKey && (
                    <div className="grid grid-cols-2 gap-2">
                        <select value={conditional.operator || '==='} onChange={e => handleUpdate({ operator: e.target.value as ConditionalDisplay['operator'] })} className="w-full bg-[var(--color-surface-light)] rounded p-1 text-xs">
                            <option value="===">is equal to</option>
                            <option value="!==">is not equal to</option>
                            <option value=">">is greater than</option>
                            <option value="<">is less than</option>
                        </select>
                        <input type="text" value={String(conditional.value || '')} onChange={e => handleUpdate({ value: e.target.value })} placeholder="Value" className="w-full bg-[var(--color-surface-light)] rounded p-1 text-xs" />
                    </div>
                )}
            </div>
        </CollapsibleSection>
    )
}

const ComponentPropsEditor: React.FC<{ component: CustomComponent }> = ({ component }) => {
    const { dispatch } = useAppContext();
    
    const handleUpdate = (propsDefinition: PropDefinition[]) => {
        dispatch({ type: 'UPDATE_COMPONENT_DEFINITION', payload: { componentId: component.id, updates: { propsDefinition } } });
    };

    const addProp = () => {
        const newProp: PropDefinition = { name: `prop${component.propsDefinition.length + 1}`, type: 'string', defaultValue: '' };
        handleUpdate([...component.propsDefinition, newProp]);
    };

    const updateProp = (index: number, updates: Partial<PropDefinition>) => {
        const newProps = [...component.propsDefinition];
        newProps[index] = { ...newProps[index], ...updates };
        handleUpdate(newProps);
    };

    const deleteProp = (index: number) => {
        const newProps = component.propsDefinition.filter((_, i) => i !== index);
        handleUpdate(newProps);
    };

    return (
        <div className="p-4 space-y-4">
             <div className="border-b border-[var(--color-border)] pb-4">
                <h3 className="font-bold text-lg">{component.name}</h3>
                <p className="text-xs text-[var(--color-text-tertiary)]">Editing Main Component</p>
            </div>
            <CollapsibleSection title="Component Props" defaultOpen>
                <div className="space-y-3">
                    {component.propsDefinition.map((prop, index) => (
                        <div key={index} className="bg-[var(--color-surface-light)] p-3 rounded-lg space-y-2">
                            <div className="flex items-center gap-2">
                                <input type="text" value={prop.name} onChange={e => updateProp(index, { name: e.target.value })} placeholder="Prop Name" className="w-full bg-[var(--color-background)] p-1 rounded text-sm"/>
                                <button onClick={() => deleteProp(index)} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
                            </div>
                             <div className="grid grid-cols-2 gap-2">
                                <select value={prop.type} onChange={e => updateProp(index, { type: e.target.value as PropDefinition['type'] })} className="w-full bg-[var(--color-background)] p-1 rounded text-sm">
                                    <option value="string">String</option>
                                    <option value="number">Number</option>
                                    <option value="boolean">Boolean</option>
                                </select>
                                <input type="text" value={String(prop.defaultValue)} onChange={e => updateProp(index, { defaultValue: e.target.value })} placeholder="Default Value" className="w-full bg-[var(--color-background)] p-1 rounded text-sm"/>
                            </div>
                        </div>
                    ))}
                    <button onClick={addProp} className="w-full text-sm text-center p-2 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] rounded-md flex items-center justify-center gap-2"><PlusIcon /> Add Prop</button>
                </div>
            </CollapsibleSection>
        </div>
    );
};

export const PropertiesPanel: React.FC = () => {
  const { state, updateElement, dispatch } = useAppContext();
  const { pages, activePageId, selectedElementId, projectType, customComponents, viewport, editingComponentId } = state;
  
  const editingComponent = editingComponentId ? customComponents.find(c => c.id === editingComponentId) : null;
  const activePage = pages.find(p => p.id === activePageId) || pages[0];
  const elementTree = editingComponent ? [editingComponent.mainElement] : (activePage?.elements || []);
  const { element: selectedElement } = findElementDeep(elementTree, selectedElementId || '');
  
  const isInstance = selectedElement?.componentId && !editingComponentId;
  const mainComponent = isInstance ? customComponents.find(c => c.id === selectedElement.componentId) : null;

  if (editingComponent && !selectedElement) {
    return (
      <aside className="w-80 bg-[var(--color-surface)] border-l border-[var(--color-border)] overflow-y-auto">
        <ComponentPropsEditor component={editingComponent} />
      </aside>
    );
  }

  if (!selectedElement) {
    return (
      <aside className="w-80 bg-[var(--color-surface)] border-l border-[var(--color-border)] flex flex-col items-center justify-center text-center p-4">
        <div className="text-5xl text-[var(--color-text-tertiary)] mb-4">
            <SlidersIcon />
        </div>
        <h3 className="font-bold text-lg">Properties</h3>
        <p className="text-sm text-[var(--color-text-secondary)]">Select an element on the canvas to see its properties.</p>
      </aside>
    );
  }
  
  const canHaveContent = selectedElement.hasOwnProperty('content') || ['Text', 'ElevatedButton'].includes(selectedElement.type);
  const isFormElement = ['input', 'textarea', 'TextInput'].includes(selectedElement.type);
  const isImage = ['image', 'Image'].includes(selectedElement.type);
  const isIcon = selectedElement.type === 'icon';
  const isVideo = selectedElement.type === 'video';
  
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateElement(selectedElement.id, { content: e.target.value });
  const handleStyleChange = (style: string, value: string | number) => {
    const targetViewport = projectType === 'web' ? viewport : 'desktop';
    const currentStyles = selectedElement.styles[targetViewport] || {};
    const newStyles = { ...selectedElement.styles, [targetViewport]: { ...currentStyles, [style]: value } };
    updateElement(selectedElement.id, { styles: newStyles });
  }
  const handleAnimationChange = (updates: Partial<AnimationProperties>) => updateElement(selectedElement.id, { animation: { ...selectedElement.animation, ...updates } });
  const handleAiStylesGenerated = (newAiStyles: Style | string) => {
    if (typeof newAiStyles === 'string') { // Tailwind classes
      updateElement(selectedElement.id, { tailwindClasses: newAiStyles });
      toast.success('Tailwind classes applied!');
    } else { // Style object
      const targetViewport = projectType === 'web' ? viewport : 'desktop';
      const currentStyles = selectedElement.styles[targetViewport] || {};
      const mergedStyles = { ...currentStyles, ...newAiStyles };
      const newStyles = { ...selectedElement.styles, [targetViewport]: mergedStyles };
      updateElement(selectedElement.id, { styles: newStyles });
      toast.success('AI styles applied!');
    }
  };
  const handlePropChange = (prop: string, value: any) => updateElement(selectedElement.id, { props: { ...selectedElement.props, [prop]: value } });
  
  return (
    <aside className="w-80 bg-[var(--color-surface)] border-l border-[var(--color-border)] overflow-y-auto">
      <div className="p-4 border-b border-[var(--color-border)]">
        <h3 className="font-bold text-lg">{selectedElement.name}</h3>
        {mainComponent && <p className="text-xs text-[var(--color-primary)]">Instance of {mainComponent.name}</p>}
      </div>
      
      <div className="p-4 space-y-6">
        {mainComponent && ( <CollapsibleSection title="Component" defaultOpen>
          <button onClick={() => dispatch({type: 'SET_EDITING_COMPONENT_ID', payload: mainComponent.id })} className="w-full text-sm text-center p-2 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] rounded-md">Edit Main Component</button>
        </CollapsibleSection> )}
        {mainComponent?.propsDefinition && mainComponent.propsDefinition.length > 0 && ( <CollapsibleSection title="Props" defaultOpen>
          <div className="space-y-3">
            {mainComponent.propsDefinition.map(propDef => (
              <PropInput key={propDef.name} propDef={propDef} value={selectedElement.props?.[propDef.name] ?? propDef.defaultValue} onChange={(value) => handlePropChange(propDef.name, value)} />
            ))}
          </div>
        </CollapsibleSection> )}
        {canHaveContent && ( <div>
          <label className="block text-sm font-medium mb-1 text-[var(--color-text-secondary)]">Content</label>
          <div className="flex items-center gap-2">
            <textarea value={selectedElement.content || ''} onChange={handleContentChange} rows={3} className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm text-white border border-[var(--color-border)]"/>
            <AiContentGenerator onGenerated={(text) => updateElement(selectedElement.id, { content: text })} currentContent={selectedElement.content || ''} />
          </div>
        </div> )}
        {isIcon && <IconPicker selectedElement={selectedElement} />}
        {isVideo && ( <CollapsibleSection title="Video Properties" defaultOpen>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">YouTube URL</label>
              <input type="text" value={selectedElement.props?.src || ''} onChange={e => handlePropChange('src', e.target.value)} className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm text-white border border-[var(--color-border)]" placeholder="https://www.youtube.com/embed/..."/>
            </div>
        </CollapsibleSection> )}
        {isFormElement && ( <CollapsibleSection title="Input Properties" defaultOpen>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Placeholder</label>
                <input type="text" value={selectedElement.props?.placeholder || ''} onChange={e => handlePropChange('placeholder', e.target.value)} className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm text-white border border-[var(--color-border)]"/>
              </div>
            </div>
        </CollapsibleSection> )}
        {isImage && <ImagePropertyEditor selectedElement={selectedElement} onPropChange={handlePropChange} />}
        
        <DataBindingEditor element={selectedElement} />
        <ConditionalDisplayEditor element={selectedElement} />
        <InteractionsPropertyEditor element={selectedElement} onUpdate={(interactions) => updateElement(selectedElement.id, { interactions })} />
        <AiStyleAssistant element={selectedElement} onStylesGenerated={handleAiStylesGenerated} stylingMode={'tailwind'} />
        {projectType === 'web' && <AnimationPropertyEditor element={selectedElement} onAnimationChange={handleAnimationChange} />}
        {projectType === 'web' && ( <> <CollapsibleSection title="Global Classes" defaultOpen><GlobalClassSelector element={selectedElement} /></CollapsibleSection><TailwindPropertyEditor element={selectedElement} /></> )}
        <StylePropertyEditor element={selectedElement} onStyleChange={handleStyleChange} />
      </div>
    </aside>
  );
};