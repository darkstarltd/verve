import React from 'react';
import { Element, ElementAnimation, AnimationKeyframe, AnimationTriggerType } from '../types';
import { CollapsibleSection } from './StylePropertyEditor';
import { useAppContext } from '../context/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2 } from 'lucide-react';

interface AnimationPropertyEditorProps {
    element: Element;
}

const KeyframeEditor: React.FC<{
    elementId: string;
    animation: ElementAnimation;
    keyframe: AnimationKeyframe;
}> = ({ elementId, animation, keyframe }) => {
    const { dispatch } = useAppContext();

    const handleUpdate = (updates: Partial<AnimationKeyframe>) => {
        dispatch({ type: 'UPDATE_ANIMATION_KEYFRAME', payload: {
            elementId,
            animationId: animation.id,
            keyframeId: keyframe.id,
            updates
        }});
    };

    const handlePropChange = (prop: string, value: string) => {
        handleUpdate({ properties: { ...keyframe.properties, [prop]: value }});
    };
    
    return (
        <div className="bg-[var(--color-background)] p-3 rounded-lg space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
                <input type="text" value={keyframe.properties?.transform || ''} onChange={e => handlePropChange('transform', e.target.value)} placeholder="transform" className="bg-[var(--color-surface)] p-1 rounded font-mono"/>
                <input type="text" value={keyframe.properties?.opacity || ''} onChange={e => handlePropChange('opacity', e.target.value)} placeholder="opacity" className="bg-[var(--color-surface)] p-1 rounded font-mono"/>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
                <input type="number" value={keyframe.duration} onChange={e => handleUpdate({ duration: parseInt(e.target.value, 10) })} placeholder="Duration (ms)" className="bg-[var(--color-surface)] p-1 rounded"/>
                <input type="number" value={keyframe.delay} onChange={e => handleUpdate({ delay: parseInt(e.target.value, 10) })} placeholder="Delay (ms)" className="bg-[var(--color-surface)] p-1 rounded"/>
                <select value={keyframe.easing} onChange={e => handleUpdate({ easing: e.target.value })} className="bg-[var(--color-surface)] p-1 rounded">
                    <option>ease-in-out</option>
                    <option>linear</option>
                    <option>ease-in</option>
                    <option>ease-out</option>
                </select>
            </div>
        </div>
    );
};

const AnimationTimeline: React.FC<{
    elementId: string;
    animation: ElementAnimation;
}> = ({ elementId, animation }) => {
    const { dispatch } = useAppContext();

    const handleAddKeyframe = () => {
        const newKeyframe: AnimationKeyframe = {
            id: uuidv4(),
            properties: { opacity: 1, transform: 'translateY(0px)'},
            duration: 500,
            delay: 0,
            easing: 'ease-in-out',
        };
        dispatch({ type: 'ADD_ANIMATION_KEYFRAME', payload: { elementId, animationId: animation.id, keyframe: newKeyframe } });
    };

    const handleDeleteKeyframe = (keyframeId: string) => {
        dispatch({ type: 'DELETE_ANIMATION_KEYFRAME', payload: { elementId, animationId: animation.id, keyframeId } });
    };
    
    const handleDeleteAnimation = () => {
        dispatch({ type: 'DELETE_ANIMATION', payload: { elementId, animationId: animation.id }});
    }

    return (
        <CollapsibleSection title={animation.name} defaultOpen>
            <div className="space-y-2">
                <div className="flex justify-end">
                    <button onClick={handleDeleteAnimation} className="text-xs text-[var(--color-danger)] hover:underline">Remove Trigger</button>
                </div>
                {animation.keyframes.map((kf, index) => (
                    <div key={kf.id} className="flex items-start gap-2">
                        <div className="flex-1">
                             <KeyframeEditor elementId={elementId} animation={animation} keyframe={kf} />
                        </div>
                        <button onClick={() => handleDeleteKeyframe(kf.id)} className="mt-3 p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                ))}
                <button onClick={handleAddKeyframe} className="w-full text-xs text-center p-1 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] rounded-md flex items-center justify-center gap-1">
                    <Plus /> Add Keyframe
                </button>
            </div>
        </CollapsibleSection>
    );
};

export const AnimationPropertyEditor: React.FC<AnimationPropertyEditorProps> = ({ element }) => {
    const { dispatch } = useAppContext();
    const animations = element.animations || [];

    const handleAddAnimation = (trigger: AnimationTriggerType) => {
        const nameMap = {
            onPageLoad: 'On Page Load',
            onClick: 'On Click',
            onHover: 'On Hover',
            onScrollView: 'On Scroll Into View',
        };
        const newAnimation: ElementAnimation = {
            id: uuidv4(),
            trigger: trigger,
            name: nameMap[trigger],
            keyframes: [],
        };
        dispatch({ type: 'ADD_ANIMATION', payload: { elementId: element.id, animation: newAnimation }});
    };
    
    const availableTriggers: AnimationTriggerType[] = ['onPageLoad', 'onClick', 'onHover', 'onScrollView'];
    const usedTriggers = animations.map(a => a.trigger);
    const unusedTriggers = availableTriggers.filter(t => !usedTriggers.includes(t));

    return (
        <div className="space-y-4">
            {animations.map(anim => (
                <AnimationTimeline key={anim.id} elementId={element.id} animation={anim} />
            ))}

            {unusedTriggers.length > 0 && (
                 <div className="pt-4 border-t border-[var(--color-border)]">
                    <h4 className="text-sm font-semibold mb-2">Add New Trigger</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {unusedTriggers.map(trigger => (
                             <button key={trigger} onClick={() => handleAddAnimation(trigger)} className="text-xs text-center p-2 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] rounded-md">
                                {trigger.replace('on', 'On ')}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};