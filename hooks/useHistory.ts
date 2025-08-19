
import { useReducer, useCallback } from 'react';
import { produce, Draft } from 'immer';

interface History<T> {
  past: T[];
  present: T;
  future: T[];
}

type Action<T> = 
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET'; payload: T }
  | { type: 'UPDATE'; payload: (draft: Draft<T>) => void };

const historyReducer = <T>(state: History<T>, action: Action<T>): History<T> => {
  const { past, present, future } = state;

  switch (action.type) {
    case 'UNDO':
      if (past.length === 0) return state;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      };
    case 'REDO':
      if (future.length === 0) return state;
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        past: [...past, present],
        present: next,
        future: newFuture,
      };
    case 'SET':
      if (action.payload === present) return state;
      return {
        past: [...past, present],
        present: action.payload,
        future: [],
      };
    case 'UPDATE':
      const newPresent = produce(present, action.payload);
      if (newPresent === present) return state;
      return {
        past: [...past, present],
        present: newPresent,
        future: [],
      }
  }
};

export const useHistory = <T>(initialPresent: T) => {
  const [state, dispatch] = useReducer(historyReducer, {
    past: [],
    present: initialPresent,
    future: [],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const undo = useCallback(() => {
    if (canUndo) {
      dispatch({ type: 'UNDO' });
    }
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) {
      dispatch({ type: 'REDO' });
    }
  }, [canRedo]);
  
  const setState = useCallback((newState: T) => {
    dispatch({ type: 'SET', payload: newState });
  }, []);
  
  const updateState = useCallback((updater: (draft: Draft<T>) => void) => {
    dispatch({ type: 'UPDATE', payload: updater });
  }, []);

  return {
    state: state.present,
    setState,
    updateState,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};