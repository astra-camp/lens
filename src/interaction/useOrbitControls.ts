import { usePointerPan } from './usePointerPan';
import { CameraState } from '../types/CameraState';

export function useOrbitControls(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  cameraRef: React.RefObject<CameraState>
): void {
  // pointer pan to update yaw/pitch
  usePointerPan(canvasRef, (dx, dy) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // figure out how many device-pixels per CSS-pixel
    const rect = canvas.getBoundingClientRect();
    const pixelRatio = canvas.width / rect.width;

    // scale the CSS-pixel deltas into backing-store pixels
    const dxDev = dx * pixelRatio;
    const dyDev = dy * pixelRatio;

    // now use dxDev/dyDev against canvas.width/height
    const vFOV = cameraRef.current.vFOV;
    const aspect = canvas.width / canvas.height;
    const hFOV = 2 * Math.atan(Math.tan(vFOV / 2) * aspect);
    const yawDelta = (dxDev / canvas.width) * hFOV;
    const pitchDelta = (dyDev / canvas.height) * vFOV;

    cameraRef.current.yaw += yawDelta;
    cameraRef.current.pitch = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, cameraRef.current.pitch + pitchDelta)
    );
  });
}
