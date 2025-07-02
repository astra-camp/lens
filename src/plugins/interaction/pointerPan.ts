import type { Plugin } from '../../core/types/Plugin';

interface PointerInfo {
  id: number;
  x: number;
  y: number;
}

export interface PointerPanOptions {
  pointerCount: number;
  exactCount?: boolean; // If true, requires exactly pointerCount. If false, requires >= pointerCount
}

export function pointerPan<T extends HTMLElement>(
  onPan: (dx: number, dy: number) => void,
  options: PointerPanOptions = { pointerCount: 1, exactCount: true }
): Plugin {
  return (getState, _, { onSetup, onCleanup }) => {
    const activePointers = new Map<number, PointerInfo>();
    let lastCenter: { x: number; y: number } | null = null;
    let isDragging = false;

    function hasRequiredPointers(): boolean {
      return options.exactCount 
        ? activePointers.size === options.pointerCount
        : activePointers.size >= options.pointerCount;
    }

    function getCenterPoint(): { x: number; y: number } | null {
      if (activePointers.size === 0) return null;
      
      const { sumX, sumY } = Array.from(activePointers.values()).reduce(
        (acc, pointer) => ({
          sumX: acc.sumX + pointer.x,
          sumY: acc.sumY + pointer.y
        }),
        { sumX: 0, sumY: 0 }
      );
      
      return {
        x: sumX / activePointers.size,
        y: sumY / activePointers.size
      };
    }

    function onPointerDown(e: PointerEvent) {
      const { canvas } = getState();
      
      // Add the new pointer to our tracking
      activePointers.set(e.pointerId, {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY
      });
      
      // Only start dragging if we have the required number of pointers
      if (hasRequiredPointers()) {
        canvas.setPointerCapture(e.pointerId);
        lastCenter = getCenterPoint();
        isDragging = true;
      }
    }

    function onPointerMove(e: PointerEvent) {
      // Update the pointer position
      if (activePointers.has(e.pointerId)) {
        activePointers.set(e.pointerId, {
          id: e.pointerId,
          x: e.clientX,
          y: e.clientY
        });
      }
      
      // Only pan if we have the required number of pointers and are dragging
      if (!lastCenter || !isDragging || !hasRequiredPointers()) return;
      
      const currentCenter = getCenterPoint();
      if (!currentCenter) return;
      
      const dx = currentCenter.x - lastCenter.x;
      const dy = currentCenter.y - lastCenter.y;
      lastCenter = currentCenter;
      
      onPan(dx, dy);
    }

    function onPointerUpOrCancel(e: PointerEvent) {
      const { canvas } = getState();
      
      // Remove the pointer from tracking
      activePointers.delete(e.pointerId);
      
      // If we were dragging and now have fewer pointers, stop dragging
      if (isDragging && !hasRequiredPointers()) {
        canvas.releasePointerCapture(e.pointerId);
        lastCenter = null;
        isDragging = false;
      }
    }

    function onLostPointerCapture() {
      // Handle when pointer capture is lost (e.g., pointer released outside canvas)
      // Clear all pointers and reset state
      activePointers.clear();
      lastCenter = null;
      isDragging = false;
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
      canvas.addEventListener('lostpointercapture', onLostPointerCapture);
    });

    onCleanup(() => {
      const { canvas } = getState();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUpOrCancel);
      canvas.removeEventListener('pointercancel', onPointerUpOrCancel);
      canvas.removeEventListener('lostpointercapture', onLostPointerCapture);
    });

    return {};
  };
}
