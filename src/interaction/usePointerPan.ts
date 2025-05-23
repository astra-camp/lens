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

    let lastPoint: { x: number; y: number } | null = null;

    function onPointerDown(e: PointerEvent) {
      el!.setPointerCapture(e.pointerId);
      lastPoint = { x: e.clientX, y: e.clientY };
    }

    function onPointerMove(e: PointerEvent) {
      if (!lastPoint) return;
      const dx = e.clientX - lastPoint.x;
      const dy = e.clientY - lastPoint.y;
      lastPoint = { x: e.clientX, y: e.clientY };
      onPan(dx, dy);
    }

    function onPointerUpOrCancel(_: PointerEvent) {
      lastPoint = null;
    }

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUpOrCancel);
    el.addEventListener('pointercancel', onPointerUpOrCancel);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUpOrCancel);
      el.removeEventListener('pointercancel', onPointerUpOrCancel);
    };
  }, [elementRef, onPan]);
}
