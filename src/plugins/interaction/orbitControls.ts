import { pointerPan } from './pointerPan';
import { Plugin } from '../../core/types/Plugin';

export function orbitControls(): Plugin {
  return (getState, setState, registerCallbacks) => {
    return pointerPan((dx, dy) => {
      const { canvas, camera } = getState();
      // figure out how many device-pixels per CSS-pixel
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = canvas.width / rect.width;

      // scale the CSS-pixel deltas into backing-store pixels
      const dxDev = dx * pixelRatio;
      const dyDev = dy * pixelRatio;

      // now use dxDev/dyDev against canvas.width/height
      const { vFOV, aspect } = camera;
      const hFOV = 2 * Math.atan(Math.tan(vFOV / 2) * aspect);
      const yawDelta = (dxDev / canvas.width) * hFOV;
      const pitchDelta = (dyDev / canvas.height) * vFOV;

      setState((state) => ({
        camera: {
          ...state.camera,
          yaw: state.camera.yaw + yawDelta,
          pitch: Math.max(
            -Math.PI / 2,
            Math.min(Math.PI / 2, state.camera.pitch + pitchDelta)
          )
        }
      }));
    })(getState, setState, registerCallbacks);
  };
}
