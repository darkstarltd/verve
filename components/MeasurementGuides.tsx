import React, { useEffect, useState } from 'react';
import { Element } from '../types';

interface MeasurementGuidesProps {
    selectedElement: Element;
    hoveredElement: Element;
}

const getElementRect = (id: string): DOMRect | null => {
    const el = document.querySelector(`[data-element-id="${id}"]`);
    return el ? el.getBoundingClientRect() : null;
};

const GuideLine: React.FC<{ from: [number, number], to: [number, number], label?: string, isVertical?: boolean }> = ({ from, to, label, isVertical = false }) => {
    const style: React.CSSProperties = {
        position: 'fixed',
        backgroundColor: '#F44336',
        zIndex: 10000,
    };

    if (isVertical) {
        style.left = from[0] - 0.5;
        style.top = from[1];
        style.width = 1;
        style.height = to[1] - from[1];
    } else {
        style.left = from[0];
        style.top = from[1] - 0.5;
        style.height = 1;
        style.width = to[0] - from[0];
    }
    
    const labelStyle: React.CSSProperties = {
        position: 'absolute',
        backgroundColor: '#F44336',
        color: 'white',
        fontSize: '10px',
        padding: '1px 3px',
        borderRadius: '3px',
    };

    if (isVertical) {
        labelStyle.left = 5;
        labelStyle.top = '50%';
        labelStyle.transform = 'translateY(-50%)';
    } else {
        labelStyle.top = 5;
        labelStyle.left = '50%';
        labelStyle.transform = 'translateX(-50%)';
    }

    return <div style={style}>{label && <span style={labelStyle}>{label}</span>}</div>;
};

export const MeasurementGuides: React.FC<MeasurementGuidesProps> = ({ selectedElement, hoveredElement }) => {
    const [rects, setRects] = useState<{ s: DOMRect | null, h: DOMRect | null }>({ s: null, h: null });

    useEffect(() => {
        const s = getElementRect(selectedElement.id);
        const h = getElementRect(hoveredElement.id);
        setRects({ s, h });
    }, [selectedElement.id, hoveredElement.id]);

    if (!rects.s || !rects.h) return null;

    const { s, h } = rects;
    const guides = [];

    // Vertical guides
    if (s.bottom < h.top) { // Selected is above hovered
        guides.push(<GuideLine key="v1" from={[s.left + s.width / 2, s.bottom]} to={[h.left + h.width / 2, h.top]} label={`${Math.round(h.top - s.bottom)}px`} isVertical />);
    }
    if (h.bottom < s.top) { // Hovered is above selected
        guides.push(<GuideLine key="v2" from={[h.left + h.width / 2, h.bottom]} to={[s.left + s.width / 2, s.top]} label={`${Math.round(s.top - h.bottom)}px`} isVertical />);
    }

    // Horizontal guides
    if (s.right < h.left) { // Selected is left of hovered
        guides.push(<GuideLine key="h1" from={[s.right, s.top + s.height / 2]} to={[h.left, h.top + h.height / 2]} label={`${Math.round(h.left - s.right)}px`} />);
    }
    if (h.right < s.left) { // Hovered is left of selected
        guides.push(<GuideLine key="h2" from={[h.right, h.top + h.height / 2]} to={[s.left, s.top + s.height / 2]} label={`${Math.round(s.left - h.right)}px`} />);
    }
    
    return <>{guides}</>;
};
