import React, { Suspense, ComponentType } from 'react';
import { IconContext } from 'react-icons';

// A cache for our icon components. The value can be a promise or a component.
const iconCache = new Map<string, Promise<any> | ComponentType<any>>();

function loadIcon(iconSet: 'md' | 'fa', iconName: string): ComponentType<any> {
    const cacheKey = `${iconSet}/${iconName}`;
    
    // If the component is not in the cache, start loading it.
    if (!iconCache.has(cacheKey)) {
        const promise = (iconSet === 'md' ? import('react-icons/md') : import('react-icons/fa'))
            .then(library => {
                const IconComponent = (library as any)[iconName];
                if (IconComponent) {
                    iconCache.set(cacheKey, IconComponent);
                    return IconComponent;
                } else {
                    const Fallback = () => <span title={`Icon not found: ${iconSet}/${iconName}`}>?</span>;
                    iconCache.set(cacheKey, Fallback);
                    return Fallback;
                }
            })
            .catch(e => {
                console.error("Failed to load icon library", e);
                const Fallback = () => <span title="Icon library failed to load">!</span>;
                iconCache.set(cacheKey, Fallback);
                return Fallback;
            });
        
        iconCache.set(cacheKey, promise);
    }

    const entry = iconCache.get(cacheKey);

    // If the entry is a promise, it means we are still loading.
    // Throwing the promise is the mechanism to signal Suspense to wait.
    if (entry instanceof Promise) {
        throw entry;
    }
    
    // If we are here, the entry is the resolved component.
    return entry as ComponentType<any>;
}

const IconRenderer: React.FC<{ iconSet: 'md' | 'fa', iconName: string }> = ({ iconSet, iconName }) => {
    const IconComponent = loadIcon(iconSet, iconName);
    return <IconComponent />;
};


interface IconProps {
    set: 'md' | 'fa';
    name: string;
    size?: number;
    color?: string;
    className?: string;
}

export const Icon: React.FC<IconProps> = ({ set, name, size, color, className }) => {
    const fallbackStyle = {
        width: size ? `${size}px` : '1em',
        height: size ? `${size}px` : '1em',
        display: 'inline-block'
    };

    if (!set || !name) {
        return <span style={fallbackStyle} className="bg-[var(--color-surface-light)] rounded animate-pulse"></span>;
    }

    return (
        <Suspense fallback={<span style={fallbackStyle} className="bg-[var(--color-surface-light)] rounded animate-pulse"></span>}>
            <IconContext.Provider value={{ color, size: size ? `${size}px` : undefined, className }}>
                <IconRenderer iconSet={set} iconName={name} />
            </IconContext.Provider>
        </Suspense>
    );
};
