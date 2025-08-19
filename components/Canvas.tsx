

import React, { useRef, useCallback, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { RenderElement } from './RenderElement';
import { useAppContext } from '../context/AppContext';
import { Element } from '../types';
import { PointerIcon, CloseIcon } from './icons';

interface CanvasProps {
  elements: Element[];
  dropIndicator: { parentId: string | null; index: number } | null;
  onContextMenu: (e: React.MouseEvent, elementId: string) => void;
}

const findAllElementsOfType = (elements: Element[], type: string): Element[] => {
  let found: Element[] = [];
  for (const element of elements) {
    if (element.type === type) found.push(element);
    if (element.children) found = [...found, ...findAllElementsOfType(element.children, type)];
  }
  return found;
};
const filterOutElementsOfType = (elements: Element[], type: string): Element[] => {
  return elements.reduce((acc, element) => {
    if (element.type === type) return acc;
    if (element.children) {
      acc.push({ ...element, children: filterOutElementsOfType(element.children, type) });
    } else {
      acc.push(element);
    }
    return acc;
  }, [] as Element[]);
};

const DropIndicator = () => <div className="drop-indicator" />;

const CanvasContent: React.FC<CanvasProps> = ({ elements, dropIndicator, onContextMenu }) => {
    const { setNodeRef, isOver } = useDroppable({ id: 'canvas-droppable-area' });
    const { state: { selectedElementId } } = useAppContext();

    const modals = findAllElementsOfType(elements, 'modal');
    const regularElements = filterOutElementsOfType(elements, 'modal');
    const isRootDropTarget = dropIndicator?.parentId === null;

    return (
        <div ref={setNodeRef} className={`h-full w-full rounded-lg p-4 ${isOver ? 'bg-blue-50/10' : ''}`}>
          {regularElements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-700 rounded-lg">
               {isRootDropTarget && <DropIndicator />}
               <div className="text-center text-gray-500">
                <PointerIcon />
                <h3 className="font-bold text-lg mt-4">Your Canvas is Empty</h3>
                <p className="text-sm">Drag components from the left panel to start building.</p>
               </div>
            </div>
          ) : (
            <SortableContext items={regularElements.map(el => el.id)} strategy={verticalListSortingStrategy}>
              {regularElements.map((element, index) => (
                <React.Fragment key={element.id}>
                  {isRootDropTarget && dropIndicator.index === index && <DropIndicator />}
                  <RenderElement
                    element={element}
                    isSelected={selectedElementId === element.id}
                    dropIndicator={dropIndicator}
                    onContextMenu={onContextMenu}
                  />
                </React.Fragment>
              ))}
              {isRootDropTarget && dropIndicator.index === regularElements.length && <DropIndicator />}
            </SortableContext>
          )}
          {modals.map(modal => (
           <RenderElement
            key={modal.id}
            element={modal}
            isSelected={selectedElementId === modal.id}
            onContextMenu={onContextMenu}
          />
        ))}
        </div>
    );
};


export const Canvas: React.FC<CanvasProps> = ({ elements, dropIndicator, onContextMenu }) => {
  const { state, setSelectedElementId, dispatch } = useAppContext();
  const { viewport, projectType, editingComponentId, customComponents, canvasWidth } = state;
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const editingComponent = editingComponentId ? customComponents.find(c => c.id === editingComponentId) : null;
  const isResizable = projectType === 'web' && !editingComponent;

  const handleResize = useCallback((newWidth: number) => {
    dispatch({ type: 'SET_CANVAS_WIDTH', payload: newWidth });
    if (newWidth < 480) {
      if (viewport !== 'mobile') dispatch({ type: 'SET_VIEWPORT', payload: 'mobile' });
    } else if (newWidth < 768) {
      if (viewport !== 'tablet') dispatch({ type: 'SET_VIEWPORT', payload: 'tablet' });
    } else {
      if (viewport !== 'desktop') dispatch({ type: 'SET_VIEWPORT', payload: 'desktop' });
    }
  }, [dispatch, viewport]);

  useEffect(() => {
    const resizer = canvasContainerRef.current?.querySelector('.canvas-resizer');
    const container = canvasContainerRef.current?.parentElement; // We resize based on the main view, not the relative div
    if (!resizer || !container || !isResizable) return;
    
    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      if (newWidth > 320 && newWidth < 2560) { // Min/max resize bounds
        handleResize(newWidth);
      }
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    resizer.addEventListener('mousedown', onMouseDown);
    
    return () => {
      resizer.removeEventListener('mousedown', onMouseDown);
      // Clean up global listeners
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizable, handleResize]);


  const handleClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setSelectedElementId(null);
  };

  const isMobilePlatform = projectType === 'native' || projectType === 'flutter' || projectType === 'kotlin';
  const finalCanvasWidth = isResizable ? `${canvasWidth}px` : (isMobilePlatform ? '390px' : '100%');
  const canvasHeight = isMobilePlatform ? '844px' : '100%';

  return (
    <div className="flex-1 p-8 overflow-auto bg-gray-900 flex justify-center items-start" onClick={handleClick}>
      <div 
        ref={canvasContainerRef}
        className="relative"
      >
        <div style={{ width: finalCanvasWidth, height: canvasHeight }} className={`ease-in-out ${isResizable ? '' : 'transition-all duration-300'} ${isMobilePlatform ? '' : 'w-full'} flex flex-col`}>
            {editingComponent && (
              <div className="flex-shrink-0 bg-[var(--color-surface)] p-2 rounded-t-lg border-b-2 border-[var(--color-primary)] flex justify-between items-center text-sm">
                  <span className="font-semibold">Editing Component: <span className="text-[var(--color-primary)]">{editingComponent.name}</span></span>
                  <button 
                      onClick={() => dispatch({ type: 'SET_EDITING_COMPONENT_ID', payload: null })}
                      className="flex items-center gap-1 text-xs px-2 py-1 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] rounded-md"
                  >
                     <CloseIcon /> Return to Page
                  </button>
              </div>
            )}
            {isMobilePlatform ? (
                <div className={`device-frame flex-1 ${editingComponent ? 'rounded-t-none' : ''}`}>
                    <div className={`device-frame-inner bg-white ${editingComponent ? 'rounded-t-none' : ''} transition-width duration-300`}>
                        <CanvasContent elements={elements} dropIndicator={dropIndicator} onContextMenu={onContextMenu} />
                    </div>
                </div>
            ) : (
                <div className={`bg-white shadow-2xl flex-1 ${editingComponent ? 'rounded-b-lg' : 'rounded-lg'} transition-width duration-300`}>
                    <CanvasContent elements={elements} dropIndicator={dropIndicator} onContextMenu={onContextMenu} />
                </div>
            )}
        </div>
        {isResizable && (
          <div className="canvas-resizer" title="Resize Canvas" />
        )}
      </div>
    </div>
  );
};