import React, { useState, useEffect, useCallback } from 'react';
import { generateHtmlForPage, generateReactNativeFiles, generateFlutterFiles, generateKotlinFiles } from '../lib/generateCode';
import { useAppContext } from '../context/AppContext';

interface CodePreviewPanelProps {
  height: number;
  onResize: (height: number) => void;
}

export const CodePreviewPanel: React.FC<CodePreviewPanelProps> = ({ height, onResize }) => {
  const { state: { pages, activePageId, projectType, customComponents, theme } } = useAppContext();
  const [generatedCode, setGeneratedCode] = useState('');
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const activePage = pages.find(p => p.id === activePageId) || pages[0];
    if (!activePage) {
      setGeneratedCode(`// No active page found`);
      return;
    }

    try {
        const files = (() => {
            switch(projectType) {
                case 'web': return { 'index.html': generateHtmlForPage(activePage, pages, customComponents) };
                case 'native': return generateReactNativeFiles([activePage], customComponents, theme);
                case 'flutter': return generateFlutterFiles([activePage], customComponents, theme);
                case 'kotlin': return generateKotlinFiles([activePage], customComponents, theme);
                default: return { 'error.txt': 'Unknown project type' };
            }
        })();
        const fileName = Object.keys(files)[0];
        setGeneratedCode(files[fileName] || `// No code generated for ${projectType}`);

    } catch(error) {
        console.error("Code generation for preview failed:", error);
        setGeneratedCode(`// Error generating code preview.\n// ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

  }, [pages, activePageId, projectType, customComponents, theme]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing) {
        const newHeight = window.innerHeight - e.clientY;
        if (newHeight >= 100 && newHeight <= window.innerHeight * 0.8) {
            onResize(newHeight);
        }
    }
  }, [isResizing, onResize]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);
  
  return (
    <div 
        className="bg-gray-800 border-t-2 border-gray-700 relative" 
        style={{ height: `${height}px` }}
    >
      <div 
        className="code-panel-resize-handle"
        onMouseDown={handleMouseDown}
      />
      <div className="p-2 h-full">
        <pre className="bg-gray-900 text-sm rounded-md p-4 h-full overflow-auto text-cyan-300 whitespace-pre-wrap">
          <code>{generatedCode}</code>
        </pre>
      </div>
    </div>
  );
};