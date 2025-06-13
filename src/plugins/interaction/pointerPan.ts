import type { Plugin } from '../../core/types/Plugin';

export function pointerPan<T extends HTMLElement>(
  onPan: (dx: number, dy: number) => void
): Plugin {
  return (getState, _, { onSetup, onCleanup }) => {
    let lastPoint: { x: number; y: number } | null = null;

    function onPointerDown(e: PointerEvent) {
      e.preventDefault();
      const { canvas } = getState();
      canvas.setPointerCapture(e.pointerId);
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
      const { canvas } = getState();
      canvas.releasePointerCapture(e.pointerId);
      lastPoint = null;
    }

    onSetup(() => {
      const { canvas } = getState();
      // disable native touch gestures and text selection
      canvas.style.touchAction = 'none';
      canvas.style.userSelect = 'none';
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove, { passive: false });
      canvas.addEventListener('pointerup', onPointerUpOrCancel);
      canvas.addEventListener('pointercancel', onPointerUpOrCancel);
    });

    onCleanup(() => {
      const { canvas } = getState();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUpOrCancel);
      canvas.removeEventListener('pointercancel', onPointerUpOrCancel);
    });

    return {};
  };
}
