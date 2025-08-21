
import { useRef, useEffect } from 'react';
import tippy, { Props } from 'tippy.js';

/**
 * A React hook to manage a Tippy.js instance on a DOM element.
 * @param options - Tippy.js props to configure the tooltip.
 * @returns A ref object to be attached to the target DOM element.
 */
export const useTippy = (options: Partial<Props>) => {
  const ref = useRef<Element>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Default options for a consistent look and feel across the app.
    const instance = tippy(ref.current, {
        theme: 'proverve',
        animation: 'shift-away-subtle',
        ...options,
    });

    // Destroy the Tippy instance on component unmount to prevent memory leaks.
    return () => {
      instance.destroy();
    };
  }, [options]);

  return ref;
};
