
import { useRef, useEffect } from 'react';

/**
 * Custom hook that tracks whether a component is mounted.
 * @returns A ref object with a `current` property that is `true` if the component is mounted, and `false` otherwise.
 */
export const useIsMounted = () => {
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true; // Set to true on mount
    return () => {
      isMountedRef.current = false; // Set to false on unmount
    };
  }, []);
  return isMountedRef;
};
