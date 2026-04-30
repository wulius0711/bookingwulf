import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Traps keyboard focus inside `ref` while `enabled`.
 * Focuses the first focusable child on mount; restores the previously
 * focused element on unmount. Calls `onClose` when Escape is pressed.
 */
export function useFocusTrap(enabled: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; });

  useEffect(() => {
    if (!enabled) return;

    prevFocusRef.current = document.activeElement as HTMLElement;
    const dialog = ref.current;
    if (!dialog) return;

    const first = dialog.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const els = Array.from(dialog!.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!els.length) return;
      if (e.shiftKey) {
        if (document.activeElement === els[0]) {
          e.preventDefault();
          els[els.length - 1].focus();
        }
      } else {
        if (document.activeElement === els[els.length - 1]) {
          e.preventDefault();
          els[0].focus();
        }
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      prevFocusRef.current?.focus();
    };
  }, [enabled]);

  return ref;
}
