import { useEffect, RefObject } from 'react';

/**
 * Hook to enable drag‐to‐pan gestures on a canvas or other element.
 * Attaches pointerdown/move/up listeners and calls onPan(dx, dy).
 * @param elementRef Ref to HTML element (e.g. canvas) to attach listeners to
 * @param onPan Callback invoked with delta x and delta y
 */
export function usePointerPan<T extends HTMLElement>(
  elementRef: RefObject<T | null>,
  onPan: (dx: number, dy: number) => void
): void {
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    const element = el;

    // disable native touch gestures and text selection
    element.style.touchAction = 'none';
    element.style.userSelect = 'none';

    let lastPoint: { x: number; y: number } | null = null;

    function onPointerDown(e: PointerEvent) {
      e.preventDefault();
      element.setPointerCapture(e.pointerId);
      lastPoint = { x: e.clientX, y: e.clientY };
    }

    function onPointerMove(e: PointerEvent) {
      e.preventDefault();
      if (!lastPoint) return;
      const dx = e.clientX - lastPoint.x;
      const dy = e.clientY - lastPoint.y;
      lastPoint = { x: e.clientX, y: e.clientY };
      onPan(dx, dy);
    }

    function onPointerUpOrCancel(e: PointerEvent) {
      // release the pointer capture on up/cancel
      element.releasePointerCapture(e.pointerId);
      lastPoint = null;
    }

    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointermove', onPointerMove, { passive: false });
    element.addEventListener('pointerup', onPointerUpOrCancel);
    element.addEventListener('pointercancel', onPointerUpOrCancel);

    return () => {
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerup', onPointerUpOrCancel);
      element.removeEventListener('pointercancel', onPointerUpOrCancel);
    };
  }, [elementRef, onPan]);
}
