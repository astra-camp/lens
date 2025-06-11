import type { Plugin } from '../../core/types/Plugin';

export function pointerPan<T extends HTMLElement>(
  onPan: (dx: number, dy: number) => void
): Plugin {
  return (ctx) => {
    const el = ctx.canvasRef.current;
    if (!el) return ctx;

    // disable native touch gestures and text selection
    el.style.touchAction = 'none';
    el.style.userSelect = 'none';

    let lastPoint: { x: number; y: number } | null = null;

    function onPointerDown(e: PointerEvent) {
      e.preventDefault();
      el!.setPointerCapture(e.pointerId);
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
      el!.releasePointerCapture(e.pointerId);
      lastPoint = null;
    }

    // register side-effects in LensContext lifecycle
    ctx.setupCallbacks.push(() => {
      el.addEventListener('pointerdown', onPointerDown);
      el.addEventListener('pointermove', onPointerMove, { passive: false });
      el.addEventListener('pointerup', onPointerUpOrCancel);
      el.addEventListener('pointercancel', onPointerUpOrCancel);
    });
    ctx.cleanupCallbacks.push(() => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUpOrCancel);
      el.removeEventListener('pointercancel', onPointerUpOrCancel);
    });
    return ctx;
  };
}
