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
    // convert pixels to radians: full width = 2π, full height = π
    const yawDelta = (dx / canvas.width) * Math.PI * 2;
    const pitchDelta = (dy / canvas.height) * Math.PI;
    cameraRef.current.yaw += yawDelta;
    // clamp pitch between -90° and +90°
    cameraRef.current.pitch = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, cameraRef.current.pitch + pitchDelta)
    );
  });
}
