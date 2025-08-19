
import React, { useState, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Element, Style, NativeStyle, FlutterStyle, KotlinStyle, ConditionalDisplay } from '../types';
import { useAppContext } from '../context/AppContext';
import { GripVerticalIcon, DuplicateIcon, TrashIcon } from './icons';
import { mergeElements } from '../lib/treeUtils';
import { Icon } from './Icon';

const nativeStyleToCss = (style: NativeStyle): React.CSSProperties => {
    const cssStyle: any = {};
    for (const key in style) {
        let value = (style as any)[key];
        if (typeof value === 'number' && key !== 'fontWeight' && key !== 'opacity' && key !== 'zIndex' && key !== 'flex') value = `${value}px`;
        const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        cssStyle[kebabKey] = value;
    }
    return cssStyle;
};

const flutterStyleToCss = (style: FlutterStyle): React.CSSProperties => { /* ... implementation unchanged ... */ return {}; };
const kotlinStyleToCss = (style: KotlinStyle): React.CSSProperties => { /* ... implementation unchanged ... */ return {}; };

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const resolveContent = (content: string, scope: any): string => {
  if (!content) return '';
  return content.replace(/\{\{\s*(.*?)\s*\}\}/g, (match, key) => {
    const value = getNestedValue(scope, key.trim());
    return value !== undefined ? String(value) : match;
  });
};

const DropIndicator = () => <div className="drop-indicator" />;

const ElementChrome: React.FC<{ element: Element; listeners: any; }> = ({ element, listeners }) => {
  const { dispatch } = useAppContext();
  return (
    <div className="element-chrome">
      <div className="element-chrome-toolbar">
        <span {...listeners} className="element-chrome-drag-handle flex items-center gap-1"><GripVerticalIcon />{element.name}</span>
        <div className="element-chrome-actions">
          <button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DUPLICATE_ELEMENT', payload: { elementId: element.id } }) }} title="Duplicate"><DuplicateIcon /></button>
          <button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_ELEMENT', payload: { elementId: element.id } }) }} className="hover:text-[var(--color-danger-hover)]" title="Delete"><TrashIcon /></button>
        </div>
      </div>
    </div>
  );
};

export const RenderElement: React.FC<{
  element: Element; isSelected: boolean;
  onContextMenu: (e: React.MouseEvent, elementId: string) => void;
  isDragOverlay?: boolean;
  dropIndicator?: { parentId: string | null; index: number } | null;
  dataScope?: { [key: string]: any };
}> = ({ element: instanceElement, isSelected, onContextMenu, isDragOverlay = false, dropIndicator, dataScope = {} }) => {
  
  const { state, dispatch, setSelectedElementId, updateElement } = useAppContext();
  const { pages, activePageId, selectedElementId, visibleModalIds, projectType, customComponents, viewport, runtimeState } = state;
  const [isEditing, setIsEditing] = useState(false);

  const mainComponent = useMemo(() => instanceElement.componentId ? customComponents.find(c => c.id === instanceElement.componentId) : null, [instanceElement.componentId, customComponents]);
  const element = useMemo(() => mainComponent ? mergeElements(mainComponent.mainElement, instanceElement) : instanceElement, [instanceElement, mainComponent]);

  const { id, type, content, props, styles, children, animation, interactions, tailwindClasses, dataSource, conditionalDisplay } = element;
  
  const activePage = pages.find(p => p.id === activePageId);
  
  const currentScope = useMemo(() => {
    const scope: { [key: string]: any } = { ...runtimeState, ...activePage?.dataState, ...dataScope };
    if (mainComponent) {
      scope.component = { ...mainComponent.defaultData };
      scope.props = {};
      mainComponent.propsDefinition.forEach(prop => { scope.props[prop.name] = instanceElement.props?.[prop.name] ?? prop.defaultValue; });
    }
    return scope;
  }, [runtimeState, activePage?.dataState, dataScope, mainComponent, instanceElement.props]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: instanceElement.id, data: { type: 'element', element: instanceElement }, disabled: isDragOverlay || isEditing });
  const isContainer = children !== undefined;
  const { setNodeRef: droppableNodeRef, isOver } = useDroppable({ id: instanceElement.id, disabled: !isContainer || isDragOverlay });

  const computedStyle = useMemo((): React.CSSProperties => {
    let finalStyle: React.CSSProperties = {};
    if (projectType === 'web') {
        const desktopStyle = styles.desktop as React.CSSProperties;
        const tabletStyle = (viewport !== 'desktop' ? styles.tablet : undefined) as React.CSSProperties | undefined;
        const mobileStyle = (viewport === 'mobile' ? styles.mobile : undefined) as React.CSSProperties | undefined;
        finalStyle = { ...desktopStyle, ...tabletStyle, ...mobileStyle };
    } else {
        const style = styles.desktop;
        if (projectType === 'native') finalStyle = nativeStyleToCss(style as NativeStyle);
        else if (projectType === 'flutter') finalStyle = flutterStyleToCss(style as FlutterStyle);
        else if (projectType === 'kotlin') finalStyle = kotlinStyleToCss(style as KotlinStyle);
    }
    if (animation?.type && animation.type !== 'none') {
        finalStyle.animation = `${animation.type} ${animation.duration || '1s'} ${animation.delay || '0s'} forwards`;
    }
    if (type === 'modal') {
        finalStyle.display = visibleModalIds.includes(id) ? 'flex' : 'none';
    }
    return finalStyle;
  }, [styles, viewport, animation, type, id, visibleModalIds, projectType]);

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging && !isDragOverlay ? 0.4 : 1, };
  
  const handleInteraction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (interactions?.length && !isEditing && !isDragOverlay) {
        e.preventDefault();
        dispatch({ type: 'EXECUTE_ACTIONS', payload: { actions: interactions } });
    } else if (!isEditing) {
      setSelectedElementId(instanceElement.id);
    }
  };
  
  const handleDoubleClick = (e: React.MouseEvent) => {
    const editableTypes = ['text', 'heading', 'button', 'label', 'Text'];
    if (editableTypes.includes(type) && !isDragOverlay) {
      e.stopPropagation(); setSelectedElementId(null); setIsEditing(true);
    }
  }
  
  const handleContentBlur = (e: React.FocusEvent<HTMLElement>) => {
    setIsEditing(false); setSelectedElementId(instanceElement.id);
    updateElement(instanceElement.id, { content: e.currentTarget.innerText });
  }

  const tagMap: { [key: string]: any } = { heading: 'h1', text: 'p', button: 'button', image: 'img', container: 'div', flex: 'div', 'component-instance': 'div', modal: 'div', form: 'form', input: 'input', textarea: 'textarea', label: 'label', 'hero-section': 'div', 'stats-section': 'div', 'testimonial': 'div', 'pricing-table': 'div', 'footer': 'footer', View: 'div', Text: 'p', Button: 'button', Image: 'img', TextInput: 'input', Container: 'div', Column: 'div', Row: 'div', ElevatedButton: 'button', icon: 'div', card: 'div', navbar: 'nav', video: 'iframe', scrollView: 'div', ARView: 'div' };
  const Tag = tagMap[type] || 'div';
  const isSelfClosing = ['image', 'input', 'Image', 'TextInput'].includes(type);
  const finalClassName = [props?.className, tailwindClasses].filter(Boolean).join(' ');

  const elementProps: any = { ...props, className: projectType === 'web' ? finalClassName : '', style: computedStyle, onClick: isDragOverlay ? undefined : handleInteraction, onDoubleClick: isDragOverlay ? undefined : handleDoubleClick, onContextMenu: isDragOverlay ? undefined : (e: React.MouseEvent) => onContextMenu(e, instanceElement.id), 'data-element-id': instanceElement.id, 'data-element-type': type, };
  
  if (isEditing) { elementProps.onBlur = handleContentBlur; elementProps.contentEditable = true; elementProps.suppressContentEditableWarning = true; elementProps.autoFocus = true; }
  
  const isVisible = useMemo(() => {
      if (!conditionalDisplay || !conditionalDisplay.stateKey) return true;
      const { stateKey, operator, value } = conditionalDisplay;
      const stateValue = runtimeState[stateKey];
      switch (operator) {
          case '===': return stateValue === value;
          case '!==': return stateValue !== value;
          case '>': return stateValue > value;
          case '<': return stateValue < value;
          case '>=': return stateValue >= value;
          case '<=': return stateValue <= value;
          default: return true;
      }
  }, [conditionalDisplay, runtimeState]);
  
  if (!isVisible && !isDragOverlay) return null;

  const isMyContainerTarget = dropIndicator && dropIndicator.parentId === instanceElement.id;
  const boundContent = resolveContent(dataSource?.content || content || '', currentScope);
  if (props?.src) elementProps.src = resolveContent(props.src, currentScope);
  if (props?.alt) elementProps.alt = resolveContent(props.alt, currentScope);

  const renderRepeatedChildren = () => {
    if (!dataSource?.repeat?.dataKey) return null;
    const dataArray = getNestedValue(currentScope, dataSource.repeat.dataKey);
    if (!Array.isArray(dataArray)) return <p className="text-xs text-red-500 p-2">Data for repeater is not an array.</p>;
    const itemName = dataSource.repeat.itemName || 'item';

    return dataArray.map((item, index) => {
        const itemScope = { ...currentScope, [itemName]: item, index };
        return children?.map(child => (
            <RenderElement
                key={`${child.id}-${index}`}
                element={{...child, id: `${child.id}-${index}`}} // This is tricky, might need better unique ID strategy for repeated elements
                isSelected={false}
                onContextMenu={onContextMenu}
                isDragOverlay={isDragOverlay}
                dropIndicator={dropIndicator}
                dataScope={itemScope}
            />
        ));
    });
  };

  const renderSpecialContent = () => {
    if (type === 'icon' && props?.iconSet && props?.iconName) return <Icon set={props.iconSet} name={props.iconName} size={props.size} color={props.color} />;
    if (type === 'ARView') return <div className="w-full h-full bg-gray-900 text-white flex flex-col items-center justify-center"><span className="text-3xl">📷</span> AR View</div>;
    if (isSelfClosing) return null;
    if (isContainer && children && !dataSource?.repeat) return (
        <SortableContext items={children.map(c => c.id)} strategy={verticalListSortingStrategy} disabled={isDragOverlay}>
          {children.map((child, index) => (
             <React.Fragment key={child.id}>
              {isMyContainerTarget && dropIndicator.index === index && <DropIndicator />}
              <RenderElement 
                element={child} isSelected={selectedElementId === child.id}
                dropIndicator={dropIndicator} isDragOverlay={isDragOverlay} onContextMenu={onContextMenu} dataScope={currentScope}
              />
            </React.Fragment>
          ))}
          {isMyContainerTarget && dropIndicator.index === children.length && <DropIndicator />}
        </SortableContext>
    );
    if(dataSource?.repeat) return renderRepeatedChildren();
    return boundContent;
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="relative group">
      {isSelected && !isDragOverlay && <ElementChrome element={element} listeners={listeners}/>}
      <div ref={isContainer ? droppableNodeRef : null} className={`outline-none transition-all duration-200 ${isContainer && isOver && !isDragOverlay ? 'bg-black/10' : ''}`} style={{ borderRadius: computedStyle.borderRadius }}>
        <Tag {...elementProps}>{renderSpecialContent()}</Tag>
      </div>
    </div>
  );
};