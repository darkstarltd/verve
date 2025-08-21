import React from 'react';
import { 
    Sparkles, 
    Upload, 
    Image, 
    Plus, 
    Search, 
    Trash2, 
    ChevronDown, 
    SlidersHorizontal, 
    LucideProps,
    Database,
    FileJson,
    Folder,
    FolderTree,
    Network
} from 'lucide-react';

export const MagicIcon: React.FC<LucideProps> = (props) => <Sparkles {...props} />;
export const UploadIcon: React.FC<LucideProps> = (props) => <Upload {...props} />;
export const ImageIcon: React.FC<LucideProps> = (props) => <Image {...props} />;
export const PlusIcon: React.FC<LucideProps> = (props) => <Plus {...props} />;
export const SearchIcon: React.FC<LucideProps> = (props) => <Search {...props} />;
export const TrashIcon: React.FC<LucideProps> = (props) => <Trash2 {...props} />;
export const ChevronDownIcon: React.FC<LucideProps> = (props) => <ChevronDown {...props} />;
export const SlidersIcon: React.FC<LucideProps> = (props) => <SlidersHorizontal {...props} />;
export const DatabaseIcon: React.FC<LucideProps> = (props) => <Database {...props} />;
export const FileJsonIcon: React.FC<LucideProps> = (props) => <FileJson {...props} />;
export const FolderIcon: React.FC<LucideProps> = (props) => <Folder {...props} />;
export const FolderTreeIcon: React.FC<LucideProps> = (props) => <FolderTree {...props} />;
export const NetworkIcon: React.FC<LucideProps> = (props) => <Network {...props} />;