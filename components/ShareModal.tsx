import React from 'react';
import { Link, Mail, MoreHorizontal } from 'lucide-react';

export const ShareModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-[var(--color-surface)] rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center">
                    <h2 className="text-lg font-bold">Share Project</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <Mail size={18} className="text-[var(--color-text-secondary)]"/>
                        <input
                            type="email"
                            placeholder="Invite people by email..."
                            className="flex-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-md p-2 text-white"
                        />
                        <button className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-md text-sm font-semibold">
                            Invite
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-[var(--color-border)]"></div>
                        <span className="text-xs text-[var(--color-text-tertiary)]">OR</span>
                        <div className="flex-1 h-px bg-[var(--color-border)]"></div>
                    </div>
                     <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] text-sm font-medium rounded-md">
                        <Link size={16}/> Copy public link
                    </button>

                    <h3 className="text-md font-semibold pt-4">People with access</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 rounded-md">
                             <div className="flex items-center gap-3">
                                <img src="https://i.pravatar.cc/32?img=1" className="w-8 h-8 rounded-full" alt="User 1"/>
                                <div>
                                    <p className="font-semibold text-sm">You</p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">you@example.com</p>
                                </div>
                             </div>
                             <span className="text-sm text-[var(--color-text-tertiary)]">Owner</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-md hover:bg-[var(--color-surface-light)]">
                             <div className="flex items-center gap-3">
                                <img src="https://i.pravatar.cc/32?img=2" className="w-8 h-8 rounded-full" alt="User 2"/>
                                <div>
                                    <p className="font-semibold text-sm">Jane Doe</p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">jane.doe@example.com</p>
                                </div>
                             </div>
                             <select defaultValue="editor" className="bg-[var(--color-background)] p-1 rounded text-sm border border-[var(--color-border)]">
                                <option value="editor">Editor</option>
                                <option value="viewer">Viewer</option>
                             </select>
                        </div>
                    </div>
                </div>
                 <div className="p-4 bg-[var(--color-background)] rounded-b-lg flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-md text-sm font-bold">Done</button>
                </div>
            </div>
        </div>
    );
};
