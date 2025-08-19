
import React, { useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { UploadIcon, TrashIcon } from './icons';
import { toast } from 'react-hot-toast';

export const AssetPanel: React.FC = () => {
    const { state: { assets }, dispatch } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast.error('File size cannot exceed 2MB.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                const newAsset = {
                    id: uuidv4(),
                    name: file.name,
                    url: event.target?.result as string,
                };
                dispatch({ type: 'ADD_ASSET', payload: newAsset });
                toast.success('Asset uploaded!');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this asset?')) {
            dispatch({ type: 'DELETE_ASSET', payload: id });
        }
    };

    return (
        <div className="p-4">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/gif, image/svg+xml"
                className="hidden"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full mb-4 px-4 py-2 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] text-sm font-medium rounded-md flex items-center justify-center gap-2"
            >
                <UploadIcon /> Upload Asset
            </button>
            <div className="space-y-2">
                {assets.length === 0 ? (
                    <p className="text-center text-xs text-[var(--color-text-tertiary)] py-4">No assets uploaded.</p>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {assets.map(asset => (
                            <div key={asset.id} className="group relative aspect-square bg-[var(--color-surface-light)] rounded-md overflow-hidden">
                                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1">
                                    <p className="text-xs text-white truncate">{asset.name}</p>
                                    <button
                                        onClick={(e) => handleDelete(e, asset.id)}
                                        className="self-end p-1 bg-red-600/80 hover:bg-red-500 rounded-full"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
