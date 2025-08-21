import React from 'react';
import { UploadCloud } from 'lucide-react';

export const ImportModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const renderOption = (title: string, description: string, icon: React.ReactNode) => (
        <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] cursor-pointer border border-transparent hover:border-[var(--color-primary)]">
            <div className="text-[var(--color-primary)] mt-1">{icon}</div>
            <div>
                <h4 className="font-semibold">{title}</h4>
                <p className="text-xs text-[var(--color-text-secondary)]">{description}</p>
            </div>
        </div>
    );
    
    return (
        <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-[var(--color-surface)] rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <UploadCloud size={20} className="text-[var(--color-primary)]" />
                        Import Design
                    </h2>
                    <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-white">&times;</button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Import your existing designs and let our AI convert them into a live layout.
                    </p>
                    {renderOption(
                        'Import from Figma',
                        'Paste a link to your Figma file to import your design.',
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" fill="#F24E1E"></path><path d="M12 9a3 3 0 0 0-3 3h6a3 3 0 0 0-3-3Z" fill="#FF7262"></path><path d="M9 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" fill="#A259FF"></path><path d="M9 15a3 3 0 0 0 3-3H6a3 3 0 0 0 3 3Z" fill="#1ABCFE"></path><path d="M12 15a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" fill="#0ACF83"></path></svg>
                    )}
                     {renderOption(
                        'Import from Sketch',
                        'Upload your .sketch file to begin the conversion process.',
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m22.28 7.37-9.62-6.2a1 1 0 0 0-1.32 0L1.72 7.37a1 1 0 0 0-.54 1.15l2.29 8.13a1 1 0 0 0 .95.75h15.16a1 1 0 0 0 .95-.75l2.29-8.13a1 1 0 0 0-.54-1.15Z" fill="#FDB44D"></path><path d="m12 1.02 10.82 7-2.6 9.2H3.78L1.18 8.02 12 1.02Z" fill="#F6AD37"></path><path d="m12 1.02-4.11 15.22h8.22L12 1.02Z" fill="#FDB44D"></path><path d="M3.78 17.22h16.44L12 22.98 3.78 17.22Z" fill="#EA6C00"></path><path d="m1.18 8.02 10.82 9.2-8.22-9.2Z" fill="#F6AD37"></path><path d="m22.82 8.02-10.82 9.2 8.22-9.2Z" fill="#FDAD3A"></path></svg>
                    )}
                </div>
                 <div className="p-4 bg-[var(--color-background)] rounded-b-lg flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] rounded-md text-sm">Close</button>
                </div>
            </div>
        </div>
    );
};