import { useEffect } from 'react';

export default function useKeyboardShortcut(targetKey, handler) {
  useEffect(() => {
    function onKeyDown(event) {
      const isMatch =
        typeof targetKey === 'function'
          ? targetKey(event)
          : event.key === targetKey;

      if (isMatch) {
        handler(event);
      }
    }

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [handler, targetKey]);
}
