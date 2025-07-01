import { screenToRay } from '../../utils/matrix';
import { ViewSpaceCoord } from '../../core/types/Coordinates';
import { Plugin } from '../../core/types/Plugin';

export function clickRay(
  onRay: (dir: ViewSpaceCoord, e: MouseEvent) => void,
  moveThreshold = 5 // pixels
): Plugin {
  return (getState, _, { onSetup, onCleanup }) => {
    let isPointerDown = false;
    let startPoint: { x: number; y: number } | null = null;

    function onPointerDown(e: PointerEvent) {
      isPointerDown = true;
      startPoint = { x: e.clientX, y: e.clientY };
    }

    function onPointerMove(e: PointerEvent) {
      if (!isPointerDown || !startPoint) return;
      
      const dx = e.clientX - startPoint.x;
      const dy = e.clientY - startPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // If moved beyond threshold, cancel the click
      if (distance > moveThreshold) {
        isPointerDown = false;
        startPoint = null;
      }
    }

    function onPointerUp(e: PointerEvent) {
      if (!isPointerDown || !startPoint) return;
      
      // Check if we moved beyond threshold
      const dx = e.clientX - startPoint.x;
      const dy = e.clientY - startPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= moveThreshold) {
        // This was a true click, not a drag
        const { canvas, camera } = getState();
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const dir = screenToRay(
          x,
          y,
          rect.width,
          rect.height,
          camera.vFOV,
          camera.yaw,
          camera.pitch
        );
        onRay(dir, e as MouseEvent);
      }
      
      isPointerDown = false;
      startPoint = null;
    }

    function onPointerCancel() {
      isPointerDown = false;
      startPoint = null;
    }

    // register side-effects in LensContext lifecycle
    onSetup(() => {
      const { canvas } = getState();
      if (!canvas) return;
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerCancel);
    });
    onCleanup(() => {
      const { canvas } = getState();
      if (!canvas) return;
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerCancel);
    });

    return {};
  };
}
