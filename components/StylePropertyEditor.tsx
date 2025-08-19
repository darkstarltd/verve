

import React, { useState, ReactNode, useEffect } from 'react';
import { Style, Element, Viewport } from '../types';
import { useAppContext } from '../context/AppContext';
import { ChevronDownIcon, CloseIcon } from './icons';

interface StylePropertyEditorProps {
    element: Element;
    onStyleChange: (style: string, value: any) => void;
}

const getResponsiveValue = (styles: Element['styles'], viewport: Viewport, key: keyof Style) => {
    const currentViewportStyles = styles[viewport] as React.CSSProperties | undefined;
    if (currentViewportStyles && currentViewportStyles[key as keyof React.CSSProperties] !== undefined) {
        return { value: currentViewportStyles[key as keyof React.CSSProperties], isOverridden: true, source: viewport };
    }
    if (viewport === 'mobile' && styles.tablet?.[key as keyof React.CSSProperties] !== undefined) {
         return { value: styles.tablet?.[key as keyof React.CSSProperties], isOverridden: false, source: 'tablet' };
    }
    return { value: styles.desktop[key as keyof React.CSSProperties] || '', isOverridden: false, source: 'desktop' };
};

const getNativeValue = (styles: Element['styles'], key: keyof Style) => {
    return { value: (styles.desktop as any)[key] || '', isOverridden: true }; // No overrides in native for now
};

const getFlutterValue = (styles: Element['styles'], key: string) => {
    return { value: (styles.desktop as any)[key] ?? '', isOverridden: true };
};

const getKotlinValue = (styles: Element['styles'], key: string) => {
    return { value: (styles.desktop as any)[key] ?? '', isOverridden: true };
};

const StyleInput: React.FC<{label: string, type: string, value: any, onChange: (value: any) => void, isOverridden: boolean, onReset?: () => void }> = ({ label, type, value, onChange, isOverridden, onReset }) => {
    const { state: { theme } } = useAppContext();
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const handleBlur = () => {
        if (inputValue !== value) {
            onChange(inputValue);
        }
    };
    
    const isColor = type === 'color';

    return (
        <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                {isOverridden && <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" title="This style is overridden on the current viewport."/>}
                <span className={isOverridden ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}>{label}</span>
            </label>
            <div className="flex items-center">
                {isColor && <input type="color" value={inputValue.startsWith('var') ? theme.variables[inputValue.replace('var(', '').replace(')', '')] : inputValue || '#000000'} onChange={(e) => { setInputValue(e.target.value); onChange(e.target.value); }} className="w-8 h-8 p-0 border-none rounded cursor-pointer bg-transparent" style={{backgroundColor: inputValue as string}} />}
                <input
                    type={isColor ? 'text' : type}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={handleBlur}
                    className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm text-white border border-[var(--color-border)] focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] ml-2"
                />
                {isOverridden && onReset && (
                    <button onClick={onReset} title="Reset style" className="ml-2 text-[var(--color-text-tertiary)] hover:text-white"><CloseIcon/></button>
                )}
            </div>
            {isColor && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(theme.variables).map(([name, color]) => (
                        <button key={name} title={name} onClick={() => { setInputValue(`var(${name})`); onChange(`var(${name})`); }} className="w-6 h-6 rounded-full border-2 border-[var(--color-border)]" style={{ backgroundColor: color }} />
                    ))}
                </div>
            )}
        </div>
    );
};

const StyleSelect: React.FC<{label: string, value: any, onChange: (value: any) => void, options: {value:string, label:string}[], isOverridden: boolean, onReset?: () => void }> = ({ label, value, onChange, options, isOverridden, onReset }) => (
    <div>
        <label className="block text-sm font-medium mb-1 flex items-center gap-2">
            {isOverridden && <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" title="This style is overridden on the current viewport."/>}
            <span className={isOverridden ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}>{label}</span>
        </label>
        <div className="flex items-center">
            <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-[var(--color-surface-light)] rounded-md p-2 text-sm text-white border border-[var(--color-border)] focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]">
                {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            {isOverridden && onReset && (
                <button onClick={onReset} title="Reset style" className="ml-2 text-[var(--color-text-tertiary)] hover:text-white"><CloseIcon/></button>
            )}
        </div>
    </div>
);

export const CollapsibleSection: React.FC<{ title: string, children: ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-t border-[var(--color-border)] pt-4">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left font-semibold text-md text-[var(--color-text-primary)] mb-2">
                <span>{title}</span>
                <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}><ChevronDownIcon /></span>
            </button>
            {isOpen && <div className="space-y-3">{children}</div>}
        </div>
    )
}

const WebStyleEditor: React.FC<StylePropertyEditorProps> = ({ element, onStyleChange }) => {
    const { styles, type } = element;
    const { state: { viewport } } = useAppContext();

    const textStyles = [{ key: 'color', type: 'color' }, { key: 'fontSize', type: 'text' }, { key: 'fontWeight', type: 'text' }, { key: 'textAlign', type: 'text' }];
    const layoutStyles = [{ key: 'padding', type: 'text' }, { key: 'margin', type: 'text' }];
    const appearanceStyles = [{ key: 'backgroundColor', type: 'color' }, { key: 'borderRadius', type: 'text' }, { key: 'border', type: 'text' }, { key: 'boxShadow', type: 'text' }];
    const flexStyles = [
        { key: 'flexDirection', type: 'select', options: [{value:'row', label:'Row'}, {value:'column', label:'Column'}] },
        { key: 'justifyContent', type: 'select', options: [{value:'flex-start', label:'Start'}, {value:'center', label:'Center'}, {value:'flex-end', label:'End'}, {value:'space-between', label:'Space Between'}] },
        { key: 'alignItems', type: 'select', options: [{value:'flex-start', label:'Start'}, {value:'center', label:'Center'}, {value:'flex-end', label:'End'}, {value:'stretch', label:'Stretch'}] },
        { key: 'gap', type: 'text' }
    ];

    const renderStyleControl = (styleDef: any) => {
        const { value, isOverridden } = getResponsiveValue(styles, viewport, styleDef.key as keyof Style);
        const label = styleDef.key.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase());
        
        const handleReset = () => {
            // Setting to undefined removes the override for that viewport
            onStyleChange(styleDef.key, undefined);
        };

        if (styleDef.type === 'select') {
            return <StyleSelect key={styleDef.key} label={label} value={value} onChange={(val) => onStyleChange(styleDef.key, val)} options={styleDef.options} isOverridden={isOverridden} onReset={handleReset} />;
        }
        return <StyleInput key={styleDef.key} label={label} type={styleDef.type} value={value} onChange={(val) => onStyleChange(styleDef.key, val)} isOverridden={isOverridden} onReset={handleReset} />;
    }

    return (
        <div>
            <CollapsibleSection title="Typography" defaultOpen>{textStyles.map(renderStyleControl)}</CollapsibleSection>
            <CollapsibleSection title="Layout">{layoutStyles.map(renderStyleControl)}</CollapsibleSection>
            <CollapsibleSection title="Appearance">{appearanceStyles.map(renderStyleControl)}</CollapsibleSection>
            {type === 'flex' && <CollapsibleSection title="Flexbox Layout">{flexStyles.map(renderStyleControl)}</CollapsibleSection>}
        </div>
    );
};

const NativeStyleEditor: React.FC<StylePropertyEditorProps> = ({ element, onStyleChange }) => {
    const { styles } = element;

    const typographyStyles = [{ key: 'color', type: 'color' }, { key: 'fontSize', type: 'number' }, { key: 'fontWeight', type: 'select', options: [{value:'normal', label:'Normal'}, {value:'bold', label:'Bold'}, {value:'500', label:'500'}] }];
    const layoutStyles = [{ key: 'padding', type: 'number' }, { key: 'margin', type: 'number' }, { key: 'width', type: 'text' }, { key: 'height', type: 'number' }];
    const appearanceStyles = [{ key: 'backgroundColor', type: 'color' }, { key: 'borderRadius', type: 'number' }, { key: 'borderWidth', type: 'number' }, { key: 'borderColor', type: 'color' }];
    const flexStyles = [
        { key: 'flexDirection', type: 'select', options: [{value:'row', label:'Row'}, {value:'column', label:'Column'}] },
        { key: 'justifyContent', type: 'select', options: [{value:'flex-start', label:'Start'}, {value:'center', label:'Center'}, {value:'flex-end', label:'End'}, {value:'space-between', label:'Space Between'}] },
        { key: 'alignItems', type: 'select', options: [{value:'flex-start', label:'Start'}, {value:'center', label:'Center'}, {value:'flex-end', label:'End'}, {value:'stretch', label:'Stretch'}] },
        { key: 'gap', type: 'number' }
    ];

     const renderStyleControl = (styleDef: any) => {
        const { value, isOverridden } = getNativeValue(styles, styleDef.key as keyof Style);
        const label = styleDef.key.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase());
        if (styleDef.type === 'select') {
            return <StyleSelect key={styleDef.key} label={label} value={value} onChange={(val) => onStyleChange(styleDef.key, val)} options={styleDef.options} isOverridden={isOverridden} />;
        }
        return <StyleInput key={styleDef.key} label={label} type={styleDef.type} value={value} onChange={(val) => onStyleChange(styleDef.key, val)} isOverridden={isOverridden} />;
    }

    return (
      <div>
        <CollapsibleSection title="Typography" defaultOpen>{typographyStyles.map(renderStyleControl)}</CollapsibleSection>
        <CollapsibleSection title="Layout">{layoutStyles.map(renderStyleControl)}</CollapsibleSection>
        <CollapsibleSection title="Appearance">{appearanceStyles.map(renderStyleControl)}</CollapsibleSection>
        <CollapsibleSection title="Flexbox Layout">{flexStyles.map(renderStyleControl)}</CollapsibleSection>
      </div>
    )
};

const FlutterStyleEditor: React.FC<StylePropertyEditorProps> = ({ element, onStyleChange }) => {
    const { styles } = element;
    
    const handlePaddingChange = (side: string, value: string) => {
        const currentPadding = (styles.desktop.padding || {}) as { [key:string]: any };
        onStyleChange('padding', {...currentPadding, [side]: Number(value) || 0 });
    };

    const textStyles = [{ key: 'color', type: 'color' }, { key: 'fontSize', type: 'number' }, { key: 'fontWeight', type: 'text' }];
    const containerStyles = [{ key: 'color', type: 'color', label: 'Background Color' }, { key: 'borderRadius', type: 'number' }];
    const layoutStyles = [{ key: 'width', type: 'number' }, { key: 'height', type: 'number' }];
    const flexStyles = [{ key: 'mainAxisAlignment', type: 'select', options: [{value:'start', label:'Start'}, {value:'center', label:'Center'}, {value:'end', label:'End'}, {value:'spaceBetween', label:'Space Between'}] }];

    const renderStyleControl = (styleDef: any) => {
        const { value, isOverridden } = getFlutterValue(styles, styleDef.key);
        const label = styleDef.label || styleDef.key.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase());
        if (styleDef.type === 'select') {
            return <StyleSelect key={styleDef.key} label={label} value={value} onChange={(val) => onStyleChange(styleDef.key, val)} options={styleDef.options} isOverridden={isOverridden} />;
        }
        return <StyleInput key={styleDef.key} label={label} type={styleDef.type} value={value} onChange={(val) => onStyleChange(styleDef.key, val)} isOverridden={isOverridden} />;
    };

    const padding = (styles.desktop.padding || {}) as any;

    return (
      <div>
        {['Container', 'Column', 'Row'].includes(element.type) && (
            <CollapsibleSection title="Padding (EdgeInsets)" defaultOpen>
                <div className="grid grid-cols-2 gap-2">
                    <StyleInput label="Top" type="number" value={padding.top || padding.vertical || padding.all || ''} onChange={val => handlePaddingChange('top', val)} isOverridden={!!padding.top}/>
                    <StyleInput label="Bottom" type="number" value={padding.bottom || padding.vertical || padding.all || ''} onChange={val => handlePaddingChange('bottom', val)} isOverridden={!!padding.bottom}/>
                    <StyleInput label="Left" type="number" value={padding.left || padding.horizontal || padding.all || ''} onChange={val => handlePaddingChange('left', val)} isOverridden={!!padding.left}/>
                    <StyleInput label="Right" type="number" value={padding.right || padding.horizontal || padding.all || ''} onChange={val => handlePaddingChange('right', val)} isOverridden={!!padding.right}/>
                </div>
            </CollapsibleSection>
        )}
        {element.type === 'Text' && <CollapsibleSection title="Typography">{textStyles.map(renderStyleControl)}</CollapsibleSection>}
        {element.type === 'Container' && <CollapsibleSection title="Box Decoration">{containerStyles.map(renderStyleControl)}</CollapsibleSection>}
        {['Column', 'Row'].includes(element.type) && <CollapsibleSection title="Flex Properties">{flexStyles.map(renderStyleControl)}</CollapsibleSection>}
        <CollapsibleSection title="Sizing">{layoutStyles.map(renderStyleControl)}</CollapsibleSection>
      </div>
    );
};

const KotlinStyleEditor: React.FC<StylePropertyEditorProps> = ({ element, onStyleChange }) => {
    const { styles } = element;

    const typographyStyles = [{ key: 'color', type: 'color' }, { key: 'fontSize', type: 'number' }];
    const layoutStyles = [{ key: 'padding', type: 'number' }, { key: 'width', type: 'number' }, { key: 'height', type: 'number' }];
    const appearanceStyles = [{ key: 'backgroundColor', type: 'color' }];
    const columnStyles = [
        { key: 'verticalArrangement', type: 'select', options: [{value:'Top', label:'Top'}, {value:'Center', label:'Center'}, {value:'Bottom', label:'Bottom'}] },
        { key: 'horizontalAlignment', type: 'select', options: [{value:'Start', label:'Start'}, {value:'CenterHorizontally', label:'Center'}, {value:'End', label:'End'}] },
    ];
    const rowStyles = [
        { key: 'horizontalArrangement', type: 'select', options: [{value:'Start', label:'Start'}, {value:'Center', label:'Center'}, {value:'End', label:'End'}] },
    ];

    const renderStyleControl = (styleDef: any) => {
        const { value, isOverridden } = getKotlinValue(styles, styleDef.key);
        const label = styleDef.key.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase());
        if (styleDef.type === 'select') {
            return <StyleSelect key={styleDef.key} label={label} value={value} onChange={(val) => onStyleChange(styleDef.key, val)} options={styleDef.options} isOverridden={isOverridden} />;
        }
        return <StyleInput key={styleDef.key} label={label} type={styleDef.type} value={value} onChange={(val) => onStyleChange(styleDef.key, val)} isOverridden={isOverridden} />;
    }

    return (
      <div>
        {element.type === 'Text' && <CollapsibleSection title="Typography" defaultOpen>{typographyStyles.map(renderStyleControl)}</CollapsibleSection>}
        <CollapsibleSection title="Layout & Sizing">{layoutStyles.map(renderStyleControl)}</CollapsibleSection>
        <CollapsibleSection title="Appearance">{appearanceStyles.map(renderStyleControl)}</CollapsibleSection>
        {element.type === 'Column' && <CollapsibleSection title="Arrangement">{columnStyles.map(renderStyleControl)}</CollapsibleSection>}
        {element.type === 'Row' && <CollapsibleSection title="Arrangement">{rowStyles.map(renderStyleControl)}</CollapsibleSection>}
      </div>
    );
};

export const StylePropertyEditor: React.FC<StylePropertyEditorProps> = (props) => {
    const { state: { projectType, viewport } } = useAppContext();

    const renderEditor = () => {
        switch(projectType) {
            case 'web': return <WebStyleEditor {...props} />;
            case 'native': return <NativeStyleEditor {...props} />;
            case 'flutter': return <FlutterStyleEditor {...props} />;
            case 'kotlin': return <KotlinStyleEditor {...props} />;
            default: return null;
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-md text-[var(--color-text-primary)]">Styling</h4>
                <span className="text-xs bg-[var(--color-surface-light)] px-2 py-1 rounded-full capitalize">
                    {projectType === 'web' ? viewport : projectType}
                </span>
            </div>
            {renderEditor()}
        </div>
    );
};