import React, { useState } from 'react';

export const CreateComponentModal: React.FC<{
  onClose: () => void;
  onCreate: (name: string) => void;
}> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[var(--color-surface)] rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b border-[var(--color-border)]">
            <h2 className="text-lg font-bold">Create New Component</h2>
          </div>
          <div className="p-6">
            <label htmlFor="component-name" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Component Name</label>
            <input
              id="component-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-md p-2 text-white"
              autoFocus
            />
          </div>
          <div className="p-4 bg-[var(--color-background)] rounded-b-lg flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-sm">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-md text-sm font-bold">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};
