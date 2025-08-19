import React, { useState } from 'react';
import { ProjectType } from '../types';

export const NewProjectModal: React.FC<{
  onProjectCreate: (settings: { name: string, type: ProjectType }) => void;
}> = ({ onProjectCreate }) => {
  const [name, setName] = useState('My Awesome Project');
  const [type, setType] = useState<ProjectType>('web');

  const handleSubmit = () => {
    if (name.trim()) {
      onProjectCreate({ name: name.trim(), type });
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="bg-[var(--color-surface)] rounded-lg shadow-xl w-full max-w-md p-8 m-4">
        <h1 className="text-3xl font-bold text-white mb-2">Create New Project</h1>
        <p className="text-[var(--color-text-secondary)] mb-6">Let's start building something amazing.</p>
        <div className="space-y-4">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Project Name" className="w-full bg-[var(--color-background)] p-3 rounded border border-[var(--color-border)]" />
            <select value={type} onChange={e => setType(e.target.value as ProjectType)} className="w-full bg-[var(--color-background)] p-3 rounded border border-[var(--color-border)]">
                <option value="web">Web</option>
                <option value="native">React Native</option>
                <option value="flutter">Flutter</option>
                <option value="kotlin">Kotlin Multiplatform</option>
            </select>
            <button onClick={handleSubmit} className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-3 px-4 rounded-md">
              Create Project
            </button>
        </div>
      </div>
    </div>
  );
};
