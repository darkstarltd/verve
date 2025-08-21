import React, { useState, useEffect } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { useAppContext } from '../context/AppContext';
import { FileNode } from '../types';
import { FilePlus, FolderPlus, RefreshCw } from 'lucide-react';
import { TerminalPanel } from './TerminalPanel';
import { generateProjectFiles } from '../lib/generateCode';
import { toast } from 'react-hot-toast';
import { FileTreeView } from './FileTreeView';

export const IDEView: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { projectName, pages, customComponents, theme, globalStateDefinition, mockApiEndpoints, workspace } = state;

    const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
    const [activeCode, setActiveCode] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const generateAndSetFiles = async () => {
        setIsLoading(true);
        try {
            const generated = await generateProjectFiles(projectName, pages, customComponents, theme, globalStateDefinition, mockApiEndpoints);
            
            // A simple utility to create a nested structure
            const buildTree = (files: { [key: string]: string }): FileNode[] => {
                const root: { [key: string]: any } = {};
                Object.keys(files).forEach(path => {
                    path.split('/').reduce((acc, name, i, arr) => {
                        if (!acc[name]) {
                            acc[name] = {
                                name,
                                type: i === arr.length - 1 && path.includes('.') ? 'file' : 'folder',
                                children: i === arr.length - 1 ? undefined : [],
                                content: i === arr.length - 1 ? files[path] : undefined
                            };
                            if (acc.children) acc.children.push(acc[name]);
                            else if(Array.isArray(acc)) acc.push(acc[name]);
                        }
                        return acc[name];
                    }, root);
                });
                 return Object.values(root);
            };

            const fileTree = buildTree(generated);

            dispatch({ type: 'SET_WORKSPACE', payload: fileTree });

            if (fileTree.length > 0) {
                const firstFile = fileTree.find(f => f.name.endsWith('.html')) || fileTree[0];
                if(firstFile.type === 'file') {
                    setSelectedFile(firstFile);
                    setActiveCode(firstFile.content || '');
                }
            }
        } catch (e) {
            toast.error("Failed to generate project files for IDE.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (workspace.length === 0) {
            generateAndSetFiles();
        } else {
            setIsLoading(false);
            if (!selectedFile && workspace.length > 0) {
                const findFirstFile = (nodes: readonly FileNode[]): FileNode | null => {
                    for(const node of nodes) {
                        if(node.type === 'file') return node;
                        if(node.children) {
                            const found = findFirstFile(node.children);
                            if(found) return found;
                        }
                    }
                    return null;
                }
                const firstFile = findFirstFile(workspace);
                if(firstFile) {
                    setSelectedFile(firstFile);
                    setActiveCode(firstFile.content || '');
                }
            }
        }
    }, []);

    const handleSelectFile = (file: FileNode | null) => {
        if (file && file.type === 'file') {
            setSelectedFile(file);
            setActiveCode(file.content || '');
        }
    };

    const getLanguage = (fileName: string) => {
        const ext = fileName.split('.').pop();
        switch(ext) {
            case 'js': return 'javascript';
            case 'css': return 'css';
            case 'html': return 'html';
            case 'json': return 'json';
            case 'md': return 'markdown';
            default: return 'plaintext';
        }
    }

    return (
        <div className="flex h-full">
            {/* Sidebar */}
            <aside className="w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] p-2 flex flex-col">
                <div className="flex-shrink-0 flex justify-between items-center p-2">
                    <h2 className="font-bold text-lg">Workspace</h2>
                    <div className="flex gap-1">
                         <button onClick={generateAndSetFiles} className="p-1 hover:bg-[var(--color-surface-light)] rounded-md" title="Regenerate Files"><RefreshCw size={16}/></button>
                        <button className="p-1 hover:bg-[var(--color-surface-light)] rounded-md" title="New File"><FilePlus size={16}/></button>
                        <button className="p-1 hover:bg-[var(--color-surface-light)] rounded-md" title="New Folder"><FolderPlus size={16}/></button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <p className="text-sm text-center text-[var(--color-text-tertiary)]">Generating files...</p>
                    ) : (
                        <FileTreeView nodes={workspace} onSelect={handleSelectFile} selectedFile={selectedFile} />
                    )}
                </div>
            </aside>
            
            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <div className="flex-1 bg-gray-800 relative">
                     {selectedFile ? (
                        <MonacoEditor
                            height="100%"
                            language={getLanguage(selectedFile.name)}
                            theme="vs-dark"
                            value={activeCode}
                            onChange={setActiveCode}
                            options={{ minimap: { enabled: false }, automaticLayout: true, scrollBeyondLastLine: false }}
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-center text-[var(--color-text-tertiary)]">
                            <p>Select a file to begin editing.</p>
                        </div>
                    )}
                </div>
                <div className="h-64 flex-shrink-0">
                    <TerminalPanel />
                </div>
            </main>
        </div>
    );
};