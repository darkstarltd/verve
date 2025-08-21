import React from 'react';
import { FileText, FileJson, FileCode, Braces, Image, FileArchive, Settings } from 'lucide-react';

const ICONS: Record<string, React.ReactNode> = {
    html: React.createElement(FileCode, { size: 16, className: "text-orange-500" }),
    css: React.createElement(Braces, { size: 16, className: "text-blue-500" }),
    js: React.createElement(FileCode, { size: 16, className: "text-yellow-500" }),
    jsx: React.createElement(FileCode, { size: 16, className: "text-cyan-400" }),
    ts: React.createElement(FileCode, { size: 16, className: "text-blue-400" }),
    tsx: React.createElement(FileCode, { size: 16, className: "text-blue-300" }),
    json: React.createElement(FileJson, { size: 16, className: "text-yellow-600" }),
    md: React.createElement(FileText, { size: 16, className: "text-gray-400" }),
    png: React.createElement(Image, { size: 16, className: "text-green-400" }),
    jpg: React.createElement(Image, { size: 16, className: "text-green-400" }),
    jpeg: React.createElement(Image, { size: 16, className: "text-green-400" }),
    gif: React.createElement(Image, { size: 16, className: "text-green-400" }),
    svg: React.createElement(Image, { size: 16, className: "text-purple-400" }),
    zip: React.createElement(FileArchive, { size: 16, className: "text-gray-500" }),
    jsonc: React.createElement(FileJson, { size: 16, className: "text-yellow-600" }),
    default: React.createElement(FileText, { size: 16, className: "text-gray-400" }),
};

export const getIconForFile = (filename: string): React.ReactNode => {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension && ICONS[extension] ? ICONS[extension] : ICONS.default;
};