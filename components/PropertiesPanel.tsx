
import React from 'react';
import { Element, Style, PropDefinition, ConditionalDisplay, CustomComponent, StateVariable, DeepReadonly, Viewport, ActionStep } from '../types';
import { StylePropertyEditor, CollapsibleSection } from './StylePropertyEditor';
import { useAppContext } from '../context/AppContext';
import { AiContentGenerator } from './AiContentGenerator';
import { AiStyleAssistant } from './AiStyleAssistant';
import { toast } from 'react-hot-toast';
import { AnimationPropertyEditor } from './AnimationPropertyEditor';
import { InteractionsPropertyEditor } from './InteractionsPropertyEditor';
import { ImagePropertyEditor } from './ImagePropertyEditor';
import { DataBindingEditor } from './DataBindingEditor';
import { SlidersHorizontal, Trash2, Palette, Droplets, Zap, Sparkles, PanelRightClose, PanelLeftOpen } from 'lucide-react';
import { findElementDeep } from '../lib/treeUtils';
import { IconPicker } from './IconPicker';
import { GlobalClassSelector } from './GlobalClassSelector';
import { ComponentEditorPanel } from './ComponentEditorPanel';

const TailwindPropertyEditor: React.FC<{element: DeepReadonly<Element>}> = ({ element }) => {
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

const VariantSelector: React.FC<{ element: DeepReadonly<Element>, componentDef: CustomComponent }> = ({ element, componentDef }) => {
    const { updateElement } = useAppContext();
    
    const handleVariantChange = (propertyId: string, optionId: string) => {
        const currentVariants = (element.props as any)?.variants || {};
        const newVariants = { ...currentVariants, [propertyId]: optionId };
        updateElement(element.id, { props: { ...element.props, variants: newVariants } });
    };

    if (!componentDef.variantProperties || componentDef.variantProperties.length === 0) return null;
    
    return (
        <CollapsibleSection title="Variants" defaultOpen>
            <div className="space-y-3">
                {componentDef.variantProperties.map(prop => (
                    <div key={prop.id}>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{prop.name}</label>
                        <select
                            value={(element.props as any)?.variants?.[prop.id] || ''}
                            onChange={e => handleVariantChange(prop.id, e.target.value)}
                            className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm text-white border border-[var(--color-border)]"
                        >
                            <option value="">Default</option>
                            {prop.options.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
        </CollapsibleSection>
    );
};

const ConditionalDisplayEditor: React.FC<{element: DeepReadonly<Element>}> = ({ element }) => {
    const { updateElement, state: { pages, activePageId } } = useAppContext();
    const activePage = pages.find(p => p.id === activePageId);
    const stateVariables = activePage?.stateDefinition || [];
    const conditional = element.conditionalDisplay;

    const handleUpdate = (updates: Partial<ConditionalDisplay> | null) => {
        if (updates === null) {
             const { conditionalDisplay, ...rest } = element;
             updateElement(element.id, rest as any);
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

const SlotTargetEditor: React.FC<{ element: DeepReadonly<Element>, parentComponentDef: CustomComponent }> = ({ element, parentComponentDef }) => {
    const { updateElement } = useAppContext();
    const slots = parentComponentDef.slots || [];
    if (slots.length === 0) return null;

    return (
        <CollapsibleSection title="Slot Target" defaultOpen>
            <select
                value={element.slotTargetId || ''}
                onChange={e => updateElement(element.id, { slotTargetId: e.target.value || undefined })}
                className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm"
            >
                <option value="">Default Slot</option>
                {slots.map(slot => (
                    <option key={slot.id} value={slot.id}>{slot.name}</option>
                ))}
            </select>
        </CollapsibleSection>
    );
};


type PropertiesTab = 'style' | 'interactions' | 'animations';

export const PropertiesPanel: React.FC<{ 
    onAiRefine: () => void;
    onAiInteraction: () => void;
    parentElement: Element | null;
}> = ({ onAiRefine, onAiInteraction, parentElement }) => {
  const { state, updateElement, dispatch } = useAppContext();
  const { pages, activePageId, selectedElementId, projectType, customComponents, editingComponentId, codeSnippets, panels } = state;
  const [activeTab, setActiveTab] = React.useState<PropertiesTab>('style');
  
  const editingComponent = editingComponentId ? customComponents.find(c => c.id === editingComponentId) : null;
  const activePage = pages.find(p => p.id === activePageId) || pages[0];
  const elementTree = editingComponent ? [editingComponent.mainElement] : (activePage?.elements || []);
  const { element: selectedElement } = findElementDeep(elementTree, selectedElementId || '');
  
  const mainComponentDef = selectedElement?.componentId ? customComponents.find(c => c.id === selectedElement.componentId) : null;
  const parentComponentDef = parentElement?.componentId ? customComponents.find(c => c.id === parentElement.componentId) : null;

  if (editingComponent) {
    return (
      <aside className="w-full h-full bg-[var(--color-surface)] flex flex-col">
        <ComponentEditorPanel component={editingComponent} />
      </aside>
    );
  }

  if (!selectedElement) {
    return (
      <aside className="w-full h-full bg-[var(--color-surface)] flex flex-col relative">
        <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center">
            <h3 className="font-bold text-lg">Properties</h3>
            <button
                onClick={() => dispatch({ type: 'SET_PANELS_STATE', payload: { rightCollapsed: !panels.rightCollapsed }})}
                title="Toggle Panel"
                className="p-2 text-[var(--color-text-secondary)] hover:text-white rounded-md"
            >
                {panels.rightCollapsed ? <PanelLeftOpen /> : <PanelRightClose />}
            </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="text-5xl text-[var(--color-text-tertiary)] mb-4"><SlidersHorizontal /></div>
            <p className="text-sm text-[var(--color-text-secondary)]">Select an element on the canvas to see its properties.</p>
        </div>
      </aside>
    );
  }
  
  const canHaveContent = selectedElement.hasOwnProperty('content') || ['Text', 'ElevatedButton'].includes(selectedElement.type);
  const isFormElement = ['input', 'textarea', 'TextInput'].includes(selectedElement.type);
  const isImage = ['image', 'Image'].includes(selectedElement.type);
  const isIcon = selectedElement.type === 'icon';
  const isVideo = selectedElement.type === 'video';
  const isCustomCode = selectedElement.type === 'custom-code';
  
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateElement(selectedElement.id, { content: e.target.value });
  
  const handleStyleChange = (style: string, value: string | number | undefined, viewport: Viewport) => {
    updateElement(selectedElement.id, { styles: { ...selectedElement.styles, [viewport]: { ...(selectedElement.styles[viewport] || {}), [style]: value } } });
  };

  const handleAiStylesGenerated = (newAiStyles: Style | string) => {
    if (typeof newAiStyles === 'string') {
      updateElement(selectedElement.id, { tailwindClasses: newAiStyles });
      toast.success('Tailwind classes applied!');
    } else {
      const targetViewport = projectType === 'web' ? state.viewport : 'desktop';
      const currentStyles = selectedElement.styles[targetViewport] || {};
      const mergedStyles = { ...currentStyles, ...newAiStyles };
      const newStyles = { ...selectedElement.styles, [targetViewport]: mergedStyles };
      updateElement(selectedElement.id, { styles: newStyles });
      toast.success('AI styles applied!');
    }
  };

  const handleAiResponsiveStylesGenerated = (styles: { tablet: Style, mobile: Style }) => {
    updateElement(selectedElement.id, { styles: { ...selectedElement.styles, tablet: { ...(selectedElement.styles.tablet || {}), ...styles.tablet }, mobile: { ...(selectedElement.styles.mobile || {}), ...styles.mobile } } });
  };
  
  const tabs = [
      { id: 'style', icon: <Palette size={16}/>, label: 'Style' },
      { id: 'interactions', icon: <Zap size={16}/>, label: 'Interactions' },
      ...(projectType === 'web' ? [{ id: 'animations', icon: <Droplets size={16}/>, label: 'Animations' }] : [])
  ];

  return (
    <aside className="w-full h-full bg-[var(--color-surface)] flex flex-col">
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="font-bold text-lg">{selectedElement.name}</h3>
                {mainComponentDef && <p className="text-xs text-[var(--color-primary)]">Instance of {mainComponentDef.name}</p>}
            </div>
            <div className="flex items-center">
                <button onClick={onAiRefine} title="Refine with AI" className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-surface-light)] rounded-md">
                    <Sparkles size={18} />
                </button>
                 <button
                    onClick={() => dispatch({ type: 'SET_PANELS_STATE', payload: { rightCollapsed: !panels.rightCollapsed }})}
                    title="Toggle Panel"
                    className="p-2 text-[var(--color-text-secondary)] hover:text-white rounded-md"
                >
                    {panels.rightCollapsed ? <PanelLeftOpen /> : <PanelRightClose />}
                </button>
            </div>
        </div>
      </div>
      
      <div className="flex border-b border-[var(--color-border)]">
        {tabs.map(tab => (
             <button key={tab.id} onClick={() => setActiveTab(tab.id as PropertiesTab)} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm ${activeTab === tab.id ? 'bg-[var(--color-surface-light)] text-white' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)]'}`}>
                {tab.icon} {tab.label}
            </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === 'style' && (
            <>
                {mainComponentDef && ( <CollapsibleSection title="Component" defaultOpen>
                  <button onClick={() => dispatch({type: 'SET_EDITING_COMPONENT_ID', payload: mainComponentDef.id })} className="w-full text-sm text-center p-2 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] rounded-md">Edit Main Component</button>
                </CollapsibleSection> )}
                {mainComponentDef && <VariantSelector element={selectedElement} componentDef={mainComponentDef} />}
                {parentComponentDef && <SlotTargetEditor element={selectedElement} parentComponentDef={parentComponentDef} />}
                {isCustomCode && (
                    <CollapsibleSection title="Code Snippet" defaultOpen>
                        <div className="bg-[var(--color-surface-light)] p-3 rounded-lg text-sm">
                            <p className="text-[var(--color-text-secondary)]">This element renders the following snippet:</p>
                            <p className="font-semibold font-mono mt-1">{codeSnippets.find(s => s.id === selectedElement.snippetId)?.name || 'Unknown Snippet'}</p>
                        </div>
                    </CollapsibleSection>
                )}
                {canHaveContent && ( <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--color-text-secondary)]">Content</label>
                  <div className="flex items-center gap-2">
                    <textarea value={selectedElement.content || ''} onChange={handleContentChange} rows={3} className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm text-white border border-[var(--color-border)]"/>
                    <AiContentGenerator onGenerated={(text) => updateElement(selectedElement.id, { content: text })} currentContent={selectedElement.content || ''} />
                  </div>
                </div> )}
                {isIcon && <IconPicker selectedElement={selectedElement} />}
                {isFormElement && ( <CollapsibleSection title="Input Properties" defaultOpen>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Placeholder</label>
                        <input type="text" value={selectedElement.props?.placeholder || ''} onChange={e => updateElement(selectedElement.id, { props: {...selectedElement.props, placeholder: e.target.value}})} className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm text-white border border-[var(--color-border)]"/>
                      </div>
                    </div>
                </CollapsibleSection> )}
                {isImage && <ImagePropertyEditor selectedElement={selectedElement} onPropChange={(prop, val) => updateElement(selectedElement.id, { props: {...selectedElement.props, [prop]: val}})} />}
                
                <DataBindingEditor element={selectedElement} />
                <ConditionalDisplayEditor element={selectedElement} />
                <AiStyleAssistant element={selectedElement} onStylesGenerated={handleAiStylesGenerated} stylingMode={projectType === 'web' ? 'tailwind' : 'css'} />
                {projectType === 'web' && ( <> <CollapsibleSection title="Global Classes" defaultOpen><GlobalClassSelector element={selectedElement} /></CollapsibleSection><TailwindPropertyEditor element={selectedElement} /></> )}
                <StylePropertyEditor 
                    element={selectedElement} 
                    onStyleChange={handleStyleChange} 
                    onAiResponsiveGenerated={handleAiResponsiveStylesGenerated}
                    parentElement={parentElement} 
                    mainComponentDef={mainComponentDef}
                />
            </>
        )}
        {activeTab === 'interactions' && <InteractionsPropertyEditor element={selectedElement} onUpdate={(interactions) => updateElement(selectedElement.id, { interactions })} onAiInteraction={onAiInteraction} />}
        {activeTab === 'animations' && projectType === 'web' && <AnimationPropertyEditor element={selectedElement} />}
      </div>
    </aside>
  );
};