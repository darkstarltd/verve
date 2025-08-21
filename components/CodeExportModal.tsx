
import React, { useState, useEffect } from 'react';
import { generateProjectFiles, generateReactNativeFiles, generateFlutterFiles, generateKotlinFiles } from '../lib/generateCode';
import { useAppContext } from '../context/AppContext';

interface CodeExportModalProps {
  onClose: () => void;
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({ onClose }) => {
  const { state: { projectName, pages, projectType, customComponents, theme, globalStateDefinition, mockApiEndpoints } } = useAppContext();
  const [generatedFiles, setGeneratedFiles] = useState<{ [fileName: string]: string }>({});
  const [selectedFile, setSelectedFile] = useState<string>('');
  
  useEffect(() => {
    const generateFiles = async () => {
      let files: { [fileName: string]: string };
      switch (projectType) {
        case 'web':
          files = await generateProjectFiles(projectName, pages, customComponents, theme, globalStateDefinition, mockApiEndpoints);
          break;
        case 'native':
          files = generateReactNativeFiles(pages, customComponents, theme);
          break;
        case 'flutter':
          files = generateFlutterFiles(pages, customComponents, theme);
          break;
        case 'kotlin':
          files = generateKotlinFiles(pages, customComponents, theme);
          break;
        default:
          files = {};
      }
      setGeneratedFiles(files);
      setSelectedFile(Object.keys(files).find(name => name.endsWith('.html') || name.endsWith('.js') || name.endsWith('.css')) || Object.keys(files)[0] || '');
    };

    generateFiles();
  }, [projectName, pages, projectType, customComponents, theme, globalStateDefinition, mockApiEndpoints]);

  const handleDownload = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const fileNames = Object.keys(generatedFiles);
  const platformName = projectType === 'native' ? 'React Native' : projectType.charAt(0).toUpperCase() + projectType.slice(1);

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[85%] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold">Export Project ({platformName})</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        
        {fileNames.length > 0 ? (
          <div className="flex-1 flex overflow-hidden">
            <div className="w-1/4 bg-[var(--color-surface)] p-4 overflow-y-auto">
                <h3 className="font-bold mb-2">Project Files</h3>
                {fileNames.map(name => (
                    <div key={name} onClick={() => setSelectedFile(name)} className={`p-2 rounded-md cursor-pointer text-sm ${selectedFile === name ? 'bg-[var(--color-primary)]' : 'hover:bg-[var(--color-surface-light)]'}`}>
                        {name}
                    </div>
                ))}
            </div>
            <div className="w-3/4 flex flex-col p-4 overflow-hidden">
              <pre className="bg-gray-900 text-sm rounded-md p-4 flex-1 overflow-auto text-cyan-300 whitespace-pre-wrap">
                <code>{generatedFiles[selectedFile] || 'No file selected.'}</code>
              </pre>
            </div>
          </div>
        ) : (
            <div className="flex-1 flex items-center justify-center">
                <p>Generating files...</p>
            </div>
        )}
        <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
            {fileNames.map(fileName => (
              <button 
                key={fileName}
                onClick={() => handleDownload(fileName, generatedFiles[fileName])}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-sm"
              >
                Download {fileName}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};