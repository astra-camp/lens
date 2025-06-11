import { screenToRay } from '../../core/helpers';
import { ViewSpaceCoord } from '../../core/types/Coordinates';
import { Plugin } from '../../core/types/Plugin';

export function clickRay(
  onRay: (dir: ViewSpaceCoord, e: MouseEvent) => void
): Plugin {
  return (ctx) => {
    function onClick(e: MouseEvent) {
      const rect = ctx!.canvasRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const camera = ctx!.cameraRef.current;
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
    ctx.setupCallbacks.push(() => {
      const el = ctx.canvasRef.current;
      if (!el) return;
      el.addEventListener('click', onClick);
    });
    ctx.cleanupCallbacks.push(() => {
      const el = ctx.canvasRef.current;
      if (!el) return;
      el.removeEventListener('click', onClick);
    });

    return ctx;
  };
}
