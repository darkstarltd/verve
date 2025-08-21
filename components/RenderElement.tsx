
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Element, Style, NativeStyle, FlutterStyle, KotlinStyle, ElementAnimation, DeepReadonly, WebStyle } from '../types';
import { useAppContext } from '../context/AppContext';
import { GripVertical, Copy, Trash2, Lock, EyeOff } from 'lucide-react';
import { mergeElements } from '../lib/treeUtils';
import { Icon } from './Icon';
import { toast } from 'react-hot-toast';

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

const ElementChrome: React.FC<{ element: DeepReadonly<Element>; listeners: any; }> = ({ element, listeners }) => {
  const { dispatch } = useAppContext();
  return (
    <div className="element-chrome">
      <div className="element-chrome-toolbar">
        <span {...listeners} className="element-chrome-drag-handle flex items-center gap-1"><GripVertical />{element.name}</span>
        <div className="element-chrome-actions">
          <button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DUPLICATE_ELEMENT', payload: { elementId: element.id } }) }} title="Duplicate"><Copy size={14} /></button>
          <button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_ELEMENT', payload: { elementId: element.id } }) }} className="hover:text-[var(--color-danger-hover)]" title="Delete"><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
};

const playAnimation = (element: HTMLElement, animation: DeepReadonly<ElementAnimation>) => {
    if (!element || !animation || !animation.keyframes || animation.keyframes.length === 0) return;
    const totalDuration = animation.keyframes.reduce((acc, kf) => acc + kf.duration + kf.delay, 0);
    if (totalDuration <= 0) return;

    let accumulatedTime = 0;
    const webKeyframes: Keyframe[] = [];
    
    if (animation.keyframes[0].delay > 0) webKeyframes.push({ offset: 0 });

    animation.keyframes.forEach((kf, index) => {
        const previousKfProps = index > 0 ? animation.keyframes[index - 1].properties : {};
        accumulatedTime += kf.delay;
        const animationStartOffset = accumulatedTime / totalDuration;

        if (kf.delay > 0) webKeyframes.push({ ...(previousKfProps as Keyframe), offset: animationStartOffset });
        
        accumulatedTime += kf.duration;
        const animationEndOffset = accumulatedTime / totalDuration;
        
        webKeyframes.push({ ...(kf.properties as Keyframe), offset: animationEndOffset, easing: kf.easing });
    });
    
    element.animate(webKeyframes, { duration: totalDuration, iterations: 1, fill: 'forwards' });
};

type RenderElementProps = {
  element: DeepReadonly<Element>; isSelected: boolean;
  onContextMenu: (e: React.MouseEvent, elementId: string) => void;
  isDragOverlay?: boolean;
  dropIndicator?: { parentId: string | null; index: number } | null;
  dataScope?: { [key: string]: any };
  mode: 'edit' | 'preview';
};

const RenderElementComponent: React.FC<RenderElementProps> = ({ element: instanceElement, isSelected, onContextMenu, isDragOverlay = false, dropIndicator, dataScope = {}, mode }) => {
  
  const { state, dispatch, setSelectedElementId, updateElement } = useAppContext();
  const { pages, activePageId, selectedElementId, visibleModalIds, projectType, customComponents, viewport, runtimeState, codeSnippets, altKeyPressed, editingComponentId } = state;
  const [isEditing, setIsEditing] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const mainComponent = useMemo(() => instanceElement.componentId ? customComponents.find(c => c.id === instanceElement.componentId) : null, [instanceElement.componentId, customComponents]);
  const element = useMemo(() => mainComponent ? mergeElements(mainComponent.mainElement, instanceElement, mainComponent) : instanceElement, [instanceElement, mainComponent]);

  const { id, type, content, props, styles, children, animations, interactions, tailwindClasses, dataSource, conditionalDisplay, snippetId, isLocked, isHidden } = element;
  
  useEffect(() => {
    if (isDragOverlay || !elementRef.current) return;
    const el = elementRef.current;
    
    const animationMap = animations?.reduce((acc, anim) => ({...acc, [anim.trigger]: anim}), {} as Record<string, DeepReadonly<ElementAnimation>>) || {};

    const handleHover = () => animationMap.onHover && playAnimation(el, animationMap.onHover);
    const handleClick = () => animationMap.onClick && playAnimation(el, animationMap.onClick);

    if (animationMap.onHover) el.addEventListener('mouseenter', handleHover);
    if (animationMap.onClick) el.addEventListener('click', handleClick);

    let observer: IntersectionObserver;
    if (animationMap.onScrollView) {
        observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                playAnimation(el, animationMap.onScrollView);
                observer.unobserve(el);
            }
        }, { threshold: 0.5 });
        observer.observe(el);
    }
    
    if (animationMap.onPageLoad) playAnimation(el, animationMap.onPageLoad);

    return () => {
        if (animationMap.onHover) el.removeEventListener('mouseenter', handleHover);
        if (animationMap.onClick) el.removeEventListener('click', handleClick);
        if (observer) observer.disconnect();
    };
  }, [animations, isDragOverlay]);
  
  const activePage = pages.find(p => p.id === activePageId);
  
  const currentScope = useMemo(() => {
    const scope: { [key: string]: any } = { ...runtimeState, ...activePage?.dataState, ...dataScope };
    if (mainComponent) {
      scope.component = { ...mainComponent.defaultData };
      scope.props = {};
      mainComponent.propsDefinition.forEach(prop => { scope.props[prop.name] = (instanceElement.props as any)?.[prop.name] ?? prop.defaultValue; });
    }
    return scope;
  }, [runtimeState, activePage?.dataState, dataScope, mainComponent, instanceElement.props]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: instanceElement.id, data: { type: 'element', element: instanceElement }, disabled: isDragOverlay || isEditing || mode === 'preview' || isLocked });
  const isContainer = children !== undefined || type === 'slot';
  const { setNodeRef: droppableNodeRef, isOver } = useDroppable({ id: instanceElement.id, disabled: !isContainer || isDragOverlay || isLocked });

  const computedStyle = useMemo((): React.CSSProperties => {
    let finalStyle: React.CSSProperties = {};
    if (projectType === 'web') {
        const desktopStyle = styles.desktop as WebStyle;
        const tabletStyle = (viewport !== 'desktop' ? styles.tablet : undefined) as WebStyle | undefined;
        const mobileStyle = (viewport === 'mobile' ? styles.mobile : undefined) as WebStyle | undefined;
        const combinedStyle = { ...desktopStyle, ...tabletStyle, ...mobileStyle };

        const { transformTranslateX, transformTranslateY, transformScale, transformRotate, ...restStyle } = combinedStyle;
        const transformParts = [];
        if (transformTranslateX) transformParts.push(`translateX(${transformTranslateX})`);
        if (transformTranslateY) transformParts.push(`translateY(${transformTranslateY})`);
        if (transformScale) transformParts.push(`scale(${transformScale})`);
        if (transformRotate) transformParts.push(`rotate(${transformRotate})`);
        
        if (transformParts.length > 0) (restStyle as any).transform = transformParts.join(' ');
        
        finalStyle = restStyle;
    } else {
        if (projectType === 'native') finalStyle = nativeStyleToCss(styles.desktop as NativeStyle);
    }
    if (type === 'modal') finalStyle.display = visibleModalIds.includes(id) ? 'flex' : 'none';
    return finalStyle;
  }, [styles, viewport, type, id, visibleModalIds, projectType]);

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging && !isDragOverlay ? 0.4 : 1, };
  
  const handleInteraction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLocked && mode === 'edit') { toast('Element is locked'); return; }
    
    if (interactions?.length && !isEditing && !isDragOverlay) {
      e.preventDefault();
      for (const action of interactions) {
        if (action.type === 'call_api') {
          const apiSource = activePage?.apiDataSources.find(ds => ds.id === action.payload.apiSourceId);
          if (apiSource) {
            const toastId = toast.loading(`Calling API: ${apiSource.name}...`);
            try {
              const headers = apiSource.headers.reduce((acc, h) => ({...acc, [h.key]: h.value }), {});
              const response = await fetch(apiSource.url, { method: apiSource.method, headers });
              if (!response.ok) throw new Error(`API call failed with status ${response.status}`);
              const data = await response.json();
              dispatch({ type: 'SET_PAGE_DATA_STATE', payload: { sourceName: apiSource.name, data } });
              toast.success(`API call to ${apiSource.name} successful!`, { id: toastId });
            } catch (error) {
              console.error(error);
              toast.error(error instanceof Error ? error.message : `API call to ${apiSource.name} failed.`, { id: toastId });
            }
          }
        } else dispatch({ type: 'EXECUTE_ACTIONS', payload: { actions: [action] } });
      }
    } else if (mode === 'edit' && !isEditing) setSelectedElementId(instanceElement.id);
  };
  
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isLocked) return;
    const editableTypes = ['text', 'heading', 'button', 'label', 'link', 'Text'];
    if (mode === 'edit' && editableTypes.includes(type) && !isDragOverlay) {
      e.stopPropagation(); setSelectedElementId(null); setIsEditing(true);
    }
  }
  
  const handleContentBlur = (e: React.FocusEvent<HTMLElement>) => {
    setIsEditing(false); setSelectedElementId(instanceElement.id);
    updateElement(instanceElement.id, { content: e.currentTarget.innerText });
  }

  const handleResize = (direction: string, startEvent: React.MouseEvent) => {
      startEvent.preventDefault(); startEvent.stopPropagation();
      if (isLocked || !elementRef.current) return;
      const startRect = elementRef.current.getBoundingClientRect();
      const startX = startEvent.clientX, startY = startEvent.clientY;
      const currentStyles = computedStyle;
      const startWidth = parseFloat(currentStyles.width as string) || startRect.width;
      const startHeight = parseFloat(currentStyles.height as string) || startRect.height;
      
      const onMouseMove = (moveEvent: MouseEvent) => {
          const dx = moveEvent.clientX - startX, dy = moveEvent.clientY - startY;
          let newWidth = startWidth, newHeight = startHeight;
          if (direction.includes('right')) newWidth = startWidth + dx;
          if (direction.includes('left')) newWidth = startWidth - dx;
          if (direction.includes('bottom')) newHeight = startHeight + dy;
          if (direction.includes('top')) newHeight = startHeight - dy;
          const targetViewport = projectType === 'web' ? viewport : 'desktop';
          const currentViewportStyles = element.styles[targetViewport] || {};
          updateElement(element.id, { styles: { ...element.styles, [targetViewport]: { ...currentViewportStyles, width: `${Math.round(Math.max(20, newWidth))}px`, height: `${Math.round(Math.max(20, newHeight))}px` } } });
      };
      const onMouseUp = () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
  };

  const tagMap: { [key: string]: any } = { heading: 'h1', text: 'p', button: 'button', image: 'img', container: 'div', flex: 'div', 'component-instance': 'div', modal: 'div', form: 'form', input: 'input', textarea: 'textarea', label: 'label', 'hero-section': 'div', 'stats-section': 'div', 'testimonial': 'div', 'pricing-table': 'div', 'footer': 'footer', View: 'div', Text: 'p', Button: 'button', Image: 'img', TextInput: 'input', Container: 'div', Column: 'div', Row: 'div', ElevatedButton: 'button', icon: 'div', card: 'div', navbar: 'nav', video: 'iframe', scrollView: 'div', ARView: 'div', 'custom-code': 'div', link: 'a', divider: 'hr', spacer: 'div', 'progress-bar': 'div', accordion: 'div', slot: 'div' };
  const Tag = tagMap[type] || 'div';
  const isSelfClosing = ['image', 'input', 'Image', 'TextInput', 'divider'].includes(type);
  const finalClassName = [props?.className, tailwindClasses].filter(Boolean).join(' ');

  const elementProps: any = { ...props, className: projectType === 'web' ? finalClassName : '', style: computedStyle, onClick: isDragOverlay ? undefined : handleInteraction, onDoubleClick: isDragOverlay ? undefined : handleDoubleClick, onContextMenu: isDragOverlay || mode === 'preview' || isLocked ? undefined : (e: React.MouseEvent) => onContextMenu(e, instanceElement.id), 'data-element-id': instanceElement.id, 'data-element-type': type, };
  
  if (isEditing) { elementProps.onBlur = handleContentBlur; elementProps.contentEditable = true; elementProps.suppressContentEditableWarning = true; elementProps.autoFocus = true; }
  
  const isVisible = useMemo(() => {
      if (!conditionalDisplay?.stateKey) return true;
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
  if (isHidden && mode === 'edit' && !isDragOverlay) {
    return ( <div onClick={handleInteraction} className="hidden-element-placeholder"> <EyeOff size={16}/> <span>{element.name} (Hidden)</span> </div> );
  }
  if (type === 'slot' && editingComponentId && !isDragOverlay) {
    return (
        <div ref={droppableNodeRef} style={computedStyle} className="slot-placeholder">
            <span>{element.name}</span>
        </div>
    );
  }

  const isMyContainerTarget = dropIndicator && dropIndicator.parentId === instanceElement.id;
  const boundContent = resolveContent(dataSource?.content || content || '', currentScope);
  if (props?.src) elementProps.src = resolveContent(props.src, currentScope);
  if (props?.alt) elementProps.alt = resolveContent(props.alt, currentScope);
  if (props?.href) elementProps.href = resolveContent(props.href, currentScope);
  if (dataSource?.bindValue) {
      elementProps.value = currentScope[dataSource.bindValue] ?? '';
      elementProps['data-bind-value'] = dataSource.bindValue;
  }

  const renderRepeatedChildren = () => {
    if (!dataSource?.repeat?.dataKey) return null;
    const dataArray = getNestedValue(currentScope, dataSource.repeat.dataKey);
    if (!Array.isArray(dataArray)) return <p className="text-xs text-red-500 p-2">Data for repeater is not an array.</p>;
    const itemName = dataSource.repeat.itemName || 'item';

    return dataArray.map((item, index) => {
        const itemScope = { ...currentScope, [itemName]: item, index };
        return children?.map(child => (
            <RenderElement key={`${child.id}-${index}`} element={{...child, id: `${child.id}-${index}`}} isSelected={false} onContextMenu={onContextMenu} isDragOverlay={isDragOverlay} dropIndicator={dropIndicator} dataScope={itemScope} mode={mode}/>
        ));
    });
  };
  
  const resizeHandles = ['top-left', 'top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left'];

  const renderSpecialContent = () => {
    if (type === 'icon' && props?.iconSet && props?.iconName) return <Icon set={props.iconSet} name={props.iconName} size={props.size} color={props.color} />;
    if (type === 'ARView') return <div className="w-full h-full bg-gray-900 text-white flex flex-col items-center justify-center"><span className="text-3xl">📷</span> AR View</div>;
    if (type === 'custom-code') {
        const snippet = codeSnippets.find(s => s.id === snippetId);
        if (!snippet) return <div className="text-red-500 text-xs p-2">Snippet not found.</div>;
        if (projectType === 'web') return <iframe srcDoc={snippet.content} title={snippet.name} sandbox="allow-scripts" className="w-full h-full border-0" style={{ pointerEvents: isDragOverlay ? 'none' : 'auto' }}/>;
        return <div className="text-xs text-gray-500 p-2">Custom Code Snippet: {snippet.name}</div>;
    }
    if (isSelfClosing) return null;
    if (isContainer && children && !dataSource?.repeat) return (
        <SortableContext items={children.map(c => c.id)} strategy={verticalListSortingStrategy} disabled={isDragOverlay || isLocked}>
          {children.map((child, index) => (
             <React.Fragment key={child.id}>
              {isMyContainerTarget && dropIndicator?.index === index && <DropIndicator />}
              <RenderElement element={child} isSelected={selectedElementId === child.id} dropIndicator={dropIndicator} isDragOverlay={isDragOverlay} onContextMenu={onContextMenu} dataScope={currentScope} mode={mode} />
            </React.Fragment>
          ))}
          {isMyContainerTarget && dropIndicator?.index === children.length && <DropIndicator />}
        </SortableContext>
    );
    if(dataSource?.repeat) return renderRepeatedChildren();
    return boundContent;
  }

  return (
    <div ref={setNodeRef} style={style} className="relative" onMouseEnter={() => { if (mode === 'edit' && altKeyPressed) dispatch({ type: 'SET_HOVERED_ELEMENT_ID', payload: instanceElement.id }); }} onMouseLeave={() => { if (mode === 'edit' && altKeyPressed) dispatch({ type: 'SET_HOVERED_ELEMENT_ID', payload: null }); }} >
      {mode === 'edit' && isSelected && !isDragOverlay && <ElementChrome element={element} listeners={listeners}/>}
      {mode === 'edit' && !isSelected && !isDragOverlay && <div className="element-hover-outline" />}
      {mode === 'edit' && isLocked && !isDragOverlay && ( <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-20 flex items-center justify-center text-white rounded-[inherit]"> <Lock size={24} /> </div> )}
      <div ref={isContainer ? droppableNodeRef : null} className={`outline-none transition-all duration-200 ${mode === 'edit' && isContainer && isOver && !isDragOverlay ? 'bg-black/10' : ''}`} style={{ borderRadius: computedStyle.borderRadius }}>
        <div ref={elementRef}>
            <Tag {...elementProps}>{renderSpecialContent()}</Tag>
        </div>
      </div>
      {mode === 'edit' && isSelected && !isDragOverlay && !isLocked && projectType === 'web' && (
        <>
          {resizeHandles.map(dir => (
            <div key={dir} className={`resize-handle handle-${dir}`} onMouseDown={e => handleResize(dir, e)} />
          ))}
        </>
      )}
    </div>
  );
};

export const RenderElement = React.memo(RenderElementComponent);