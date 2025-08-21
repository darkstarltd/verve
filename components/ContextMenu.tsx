import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const ContextMenu: React.FC<{
  x: number;
  y: number;
  onClose: () => void;
  elementId: string;
  onCreateComponent: () => void;
}> = ({ x, y, onClose, elementId, onCreateComponent }) => {
  const { dispatch, state: { copiedStyles } } = useAppContext();

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
      <div className="p-1 min-w-[180px]">
        <button onClick={() => handleAction(() => dispatch({ type: 'WRAP_ELEMENT', payload: { elementId, wrapperType: 'container' } }))} className="w-full text-left px-3 py-2 hover:bg-[var(--color-primary)] rounded">Wrap in Container</button>
        <div className="h-px bg-[var(--color-border)] my-1"></div>
        <button onClick={() => handleAction(() => dispatch({ type: 'ADJUST_Z_INDEX', payload: { elementId, direction: 'forward' } }))} className="w-full text-left px-3 py-2 hover:bg-[var(--color-primary)] rounded flex items-center gap-2"><ArrowUp size={16}/> Bring Forward</button>
        <button onClick={() => handleAction(() => dispatch({ type: 'ADJUST_Z_INDEX', payload: { elementId, direction: 'backward' } }))} className="w-full text-left px-3 py-2 hover:bg-[var(--color-primary)] rounded flex items-center gap-2"><ArrowDown size={16}/> Send Backward</button>
        <div className="h-px bg-[var(--color-border)] my-1"></div>
        <button onClick={() => handleAction(() => dispatch({ type: 'COPY_STYLES', payload: { elementId } }))} className="w-full text-left px-3 py-2 hover:bg-[var(--color-primary)] rounded">Copy Styles</button>
        <button onClick={() => handleAction(() => dispatch({ type: 'PASTE_STYLES', payload: { elementId } }))} disabled={!copiedStyles} className="w-full text-left px-3 py-2 hover:bg-[var(--color-primary)] rounded disabled:opacity-50 disabled:cursor-not-allowed">Paste Styles</button>
        <div className="h-px bg-[var(--color-border)] my-1"></div>
        <button onClick={() => handleAction(() => {
            navigator.clipboard.writeText(elementId);
            toast.success('Element ID copied!');
        })} className="w-full text-left px-3 py-2 hover:bg-[var(--color-primary)] rounded">Copy ID</button>
        <button onClick={() => handleAction(() => dispatch({ type: 'DUPLICATE_ELEMENT', payload: { elementId } }))} className="w-full text-left px-3 py-2 hover:bg-[var(--color-primary)] rounded">Duplicate</button>
        <button onClick={() => handleAction(onCreateComponent)} className="w-full text-left px-3 py-2 hover:bg-[var(--color-primary)] rounded">Create Component</button>
        <div className="h-px bg-[var(--color-border)] my-1"></div>
        <button onClick={() => handleAction(() => dispatch({ type: 'DELETE_ELEMENT', payload: { elementId } }))} className="w-full text-left px-3 py-2 hover:bg-[var(--color-danger)] text-[var(--color-danger)] hover:text-white rounded">Delete</button>
      </div>
    </div>
  );
};