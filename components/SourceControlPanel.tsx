import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { GitCommit } from 'lucide-react';
import { Commit } from '../types';

export const SourceControlPanel: React.FC = () => {
    const { state: { unsavedChanges, commits }, dispatch } = useAppContext();
    const [commitMessage, setCommitMessage] = useState('');

    const handleCommit = () => {
        if (commitMessage.trim() && unsavedChanges > 0) {
            dispatch({ type: 'COMMIT_CHANGES', payload: commitMessage.trim() });
            setCommitMessage('');
        }
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <div className="flex-shrink-0">
                <h3 className="font-semibold mb-2">Changes ({unsavedChanges})</h3>
                <textarea
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Commit message..."
                    rows={3}
                    className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm border border-[var(--color-border)] focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                />
                <button
                    onClick={handleCommit}
                    disabled={unsavedChanges === 0 || !commitMessage.trim()}
                    className="w-full mt-2 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Commit {unsavedChanges} Changes
                </button>
            </div>
            <div className="flex-1 mt-4 pt-4 border-t border-[var(--color-border)] overflow-y-auto">
                <h3 className="font-semibold mb-2">History</h3>
                <div className="space-y-3">
                    {commits.length === 0 ? (
                        <p className="text-xs text-[var(--color-text-tertiary)] text-center py-4">No commits yet.</p>
                    ) : (
                        commits.map(commit => (
                            <div key={commit.id} className="flex items-start gap-3">
                                <GitCommit size={16} className="mt-1 text-[var(--color-text-tertiary)]" />
                                <div>
                                    <p className="text-sm font-medium">{commit.message}</p>
                                    <p className="text-xs text-[var(--color-text-tertiary)]">
                                        {new Date(commit.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};