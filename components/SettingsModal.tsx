import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export const SettingsModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const { state, dispatch } = useAppContext();
  const [projectName, setProjectName] = useState(state.projectName);

  const handleSave = () => {
    if (projectName.trim()) {
      dispatch({ type: 'UPDATE_PROJECT_NAME', payload: projectName.trim() });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[var(--color-surface)] rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-bold">Project Settings</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="project-name" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Project Name</label>
            <input
              id="project-name"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-md p-2 text-white"
              autoFocus
            />
          </div>
          {/* Future settings can be added here */}
        </div>
        <div className="p-4 bg-[var(--color-background)] rounded-b-lg flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-sm">Cancel</button>
          <button type="button" onClick={handleSave} className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-md text-sm font-bold">Save Changes</button>
        </div>
      </div>
    </div>
  );
};
