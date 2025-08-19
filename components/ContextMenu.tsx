import React from 'react';
import { useAppContext } from '../context/AppContext';

export const ContextMenu: React.FC<{
  x: number;
  y: number;
  onClose: () => void;
  elementId: string;
  onCreateComponent: () => void;
}> = ({ x, y, onClose, elementId, onCreateComponent }) => {
  const { dispatch } = useAppContext();

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div 
      style={{ top: y, left: x }} 
      className="fixed bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg shadow-xl z-50 text-white text-sm"
      onMouseLeave={onClose}
    >
      <div className="p-1">
        <button onClick={() => handleAction(() => dispatch({ type: 'DUPLICATE_ELEMENT', payload: { elementId } }))} className="w-full text-left px-3 py-2 hover:bg-[var(--color-primary)] rounded">Duplicate</button>
        <button onClick={() => handleAction(onCreateComponent)} className="w-full text-left px-3 py-2 hover:bg-[var(--color-primary)] rounded">Create Component</button>
        <div className="h-px bg-[var(--color-border)] my-1"></div>
        <button onClick={() => handleAction(() => dispatch({ type: 'DELETE_ELEMENT', payload: { elementId } }))} className="w-full text-left px-3 py-2 hover:bg-[var(--color-danger)] text-[var(--color-danger)] hover:text-white rounded">Delete</button>
      </div>
    </div>
  );
};
