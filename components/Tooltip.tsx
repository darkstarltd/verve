
import React from 'react';
import { useTippy } from '../hooks/useTippy';
import { Props } from 'tippy.js';

interface TooltipProps extends Partial<Pick<Props, 'placement' | 'content'>> {
  children: React.ReactElement;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, placement = 'top' }) => {
  const tippyRef = useTippy({ content, placement });

  // This ensures that children is a single, valid React element.
  const child = React.Children.only(children);

  // We need to pass the ref to the child.
  // This assumes the child is a DOM element or a class component,
  // or a functional component wrapped with forwardRef.
  if (React.isValidElement(child)) {
    return React.cloneElement(child as React.ReactElement<any>, { ref: tippyRef });
  }

  return child;
};
