import { screenToRay } from '../../utils/matrix';
import { ViewSpaceCoord } from '../../core/types/Coordinates';
import { Plugin } from '../../core/types/Plugin';

export function clickRay(
  onRay: (dir: ViewSpaceCoord, e: MouseEvent) => void
): Plugin {
  return (getState, _, { onSetup, onCleanup }) => {
    function onClick(e: MouseEvent) {
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
      onRay(dir, e);
    }

    // register side-effects in LensContext lifecycle
    onSetup(() => {
      const { canvas } = getState();
      if (!canvas) return;
      canvas.addEventListener('click', onClick);
    });
    onCleanup(() => {
      const { canvas } = getState();
      if (!canvas) return;
      canvas.removeEventListener('click', onClick);
    });

    return {};
  };
}
