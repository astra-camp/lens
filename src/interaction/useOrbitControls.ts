import { usePointerPan } from './usePointerPan';
import { CameraState } from '../types/CameraState';

export function useOrbitControls(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  cameraRef: React.RefObject<CameraState>
): void {
  // pointer pan to update yaw/pitch
  usePointerPan(canvasRef, (dx, dy) => {
    const c = canvasRef.current;
    cameraRef.current.yaw += dx * 0.005;
    cameraRef.current.pitch = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, cameraRef.current.pitch + dy * 0.005)
    );
  });
}
