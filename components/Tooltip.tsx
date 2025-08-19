
import React from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, placement = 'top' }) => {
  // By wrapping the children in a span, we provide a concrete DOM element
  // for Tippy.js to attach to. This avoids issues with cloning props onto
  // custom components that don't forward them, fixing both the TypeScript
  // error and the runtime behavior.
  return (
    <span
      data-tippy-content={content}
      data-tippy-placement={placement}
      // Added display: 'inline-flex' to ensure the wrapper behaves like its content
      // and doesn't disrupt layout, especially in flex containers.
      style={{ display: 'inline-flex', alignItems: 'center' }}
    >
      {children}
    </span>
  );
};
