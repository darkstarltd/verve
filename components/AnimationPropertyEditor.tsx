
import React from 'react';
import { Element, AnimationProperties } from '../types';
import { ANIMATION_OPTIONS } from '../lib/animations';
import { CollapsibleSection } from './StylePropertyEditor';

interface AnimationPropertyEditorProps {
    element: Element;
    onAnimationChange: (updates: Partial<AnimationProperties>) => void;
}

export const AnimationPropertyEditor: React.FC<AnimationPropertyEditorProps> = ({ element, onAnimationChange }) => {
    const animation = element.animation || { type: 'none', duration: '1s', delay: '0s' };

    const handleChange = (prop: keyof AnimationProperties, value: string) => {
        onAnimationChange({ [prop]: value });
    };

    return (
        <CollapsibleSection title="Animation (On Load)">
            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--color-text-secondary)]">Animation Type</label>
                    <select
                        value={animation.type || 'none'}
                        onChange={(e) => handleChange('type', e.target.value)}
                        className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm text-white border border-[var(--color-border)] focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                    >
                        {ANIMATION_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
                {animation.type && animation.type !== 'none' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-[var(--color-text-secondary)]">Duration</label>
                            <input
                                type="text"
                                value={animation.duration || '1s'}
                                onChange={(e) => handleChange('duration', e.target.value)}
                                placeholder="e.g., 1s"
                                className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm text-white border border-[var(--color-border)] focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-[var(--color-text-secondary)]">Delay</label>
                            <input
                                type="text"
                                value={animation.delay || '0s'}
                                onChange={(e) => handleChange('delay', e.target.value)}
                                placeholder="e.g., 0.5s"
                                className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm text-white border border-[var(--color-border)] focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                            />
                        </div>
                    </>
                )}
            </div>
        </CollapsibleSection>
    );
};