
import React, { useState, useEffect, useCallback } from 'react';
import { generateHtmlForPage, generateReactNativeFiles, generateFlutterFiles, generateKotlinFiles } from '../lib/generateCode';
import { useAppContext } from '../context/AppContext';

export const CodePreviewPanel: React.FC = () => {
  const { state: { pages, activePageId, projectType, customComponents, theme } } = useAppContext();
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    const activePage = pages.find(p => p.id === activePageId) || pages[0];
    if (!activePage) {
      setGeneratedCode(`// No active page found`);
      return;
    }

    try {
        const files = (() => {
            switch(projectType) {
                case 'web': return { 'index.html': generateHtmlForPage(activePage, pages, customComponents, theme) };
                case 'native': return generateReactNativeFiles(pages, customComponents, theme);
                case 'flutter': return generateFlutterFiles(pages, customComponents, theme);
                case 'kotlin': return generateKotlinFiles(pages, customComponents, theme);
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
  
  return (
    <div className="bg-[var(--color-surface)] h-full flex flex-col">
      <div className="p-2 h-full">
        <pre className="bg-[var(--color-background)] text-sm rounded-md p-4 h-full overflow-auto text-cyan-300 whitespace-pre-wrap">
          <code>{generatedCode}</code>
        </pre>
      </div>
    </div>
  );
};