import { useCallback, useReducer } from 'react';

export const useObjectReducer = <T>(initial: T) => {
  type Action =
    | { type: 'set'; key: keyof T; value: T[keyof T] }
    | { type: 'merge'; value: Partial<T> }
    | { type: 'reset' };

  const [state, dispatch] = useReducer((prev: T, action: Action): T => {
    switch (action.type) {
      case 'set':
        return { ...prev, [action.key]: action.value };
      case 'merge':
        return { ...prev, ...action.value };
      case 'reset':
        return initial;
      default:
        return prev;
    }
  }, initial);

  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => dispatch({ type: 'set', key, value }), []);
  const merge = useCallback((value: Partial<T>) => dispatch({ type: 'merge', value }), []);
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);

  return { state, setField, merge, reset };
};
