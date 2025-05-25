import { useEffect, RefObject } from 'react';
import type { CameraState } from '../types/CameraState';

export interface UV {
  u: number;
  v: number;
}

/**
 * Hook to perform hit-testing on click/tap events against an equirectangular panorama.
 * Converts screen coordinates to UV coords on the panorama.
 * @param elementRef Ref to the HTML element (e.g. canvas) listening for clicks
 * @param camera Current camera state (yaw, pitch, fov)
 * @param onClick Callback invoked with UV coords and the native MouseEvent
 */
export function useClickHitTest<T extends HTMLElement>(
  elementRef: RefObject<T | null>,
  cameraRef: RefObject<CameraState>,
  onClick: (uv: UV, e: MouseEvent) => void
): void {
  useEffect(() => {
    const el = elementRef.current;
    const camera = cameraRef.current;
    if (!el || !camera) return;

    function rotateX(
      v: [number, number, number],
      angle: number
    ): [number, number, number] {
      const [x, y, z] = v;
      const cos = Math.cos(angle),
        sin = Math.sin(angle);
      return [x, y * cos - z * sin, y * sin + z * cos];
    }
    function rotateY(
      v: [number, number, number],
      angle: number
    ): [number, number, number] {
      const [x, y, z] = v;
      const cos = Math.cos(angle),
        sin = Math.sin(angle);
      return [x * cos + z * sin, y, -x * sin + z * cos];
    }

    function screenXYtoUV(x: number, y: number): UV {
      const rect = (el as HTMLElement).getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      // Convert to NDC
      const ndcX = (x / w) * 2 - 1;
      const ndcY = -((y / h) * 2 - 1);
      const fov = camera.fov;
      const yaw = camera.yaw;
      const pitch = camera.pitch;
      const tanFov = Math.tan(fov / 2);
      // Ray in view space
      let vx = ndcX * tanFov * (w / h);
      let vy = ndcY * tanFov;
      let vz = -1;
      // Rotate by pitch then yaw to get world direction
      let dir: [number, number, number] = [vx, vy, vz];
      dir = rotateX(dir, pitch);
      dir = rotateY(dir, yaw);
      // Normalize
      const len = Math.hypot(dir[0], dir[1], dir[2]);
      const [ix, iy, iz] = [dir[0] / len, dir[1] / len, dir[2] / len];
      // Convert to spherical UV
      const theta = Math.atan2(iz, ix); // -π→π
      const phi = Math.acos(iy); // 0→π
      const u = theta / (2 * Math.PI) + 0.5;
      const v = phi / Math.PI;
      return { u, v };
    }

    function handleClick(e: MouseEvent) {
      const uv = screenXYtoUV(
        e.clientX - el!.getBoundingClientRect().left,
        e.clientY - el!.getBoundingClientRect().top
      );
      onClick(uv, e);
    }

    el.addEventListener('click', handleClick as any);
    return () => {
      el.removeEventListener('click', handleClick as any);
    };
  }, [elementRef.current, cameraRef.current, onClick]);
}
