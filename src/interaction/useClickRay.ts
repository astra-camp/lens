import { useEffect, RefObject } from 'react';
import { CameraState } from '../types/CameraState';
import { screenToRay } from '../utils/matrix';
import { ViewSpaceCoord } from '../types/Coordinates';

/**
 * React hook for translating click/tap events into a world-space ray direction.
 *
 * Attaches a 'click' listener to the provided elementRef. On each click, it:
 * 1. Converts screen (x,y) to normalized device coords based on element size and camera vFOV.
 * 2. Constructs a view-space ray, rotates by camera pitch and yaw, and normalizes it.
 * 3. Calls onRay with the resulting [x,y,z] direction vector and the MouseEvent.
 *
 * You can use this direction vector for custom hit-testing or UV mapping with any mesh.
 *
 * @param elementRef - RefObject to the HTML element (e.g., canvas) listening for clicks
 * @param cameraRef  - RefObject containing camera state (pitch, yaw, vFOV)
 * @param onRay      - Callback invoked with the normalized direction [x,y,z] and MouseEvent
 */
export function useClickRay<T extends HTMLElement>(
  elementRef: RefObject<T | null>,
  cameraRef: RefObject<CameraState>,
  onRay: (dir: ViewSpaceCoord, e: MouseEvent) => void
) {
  useEffect(() => {
    const el = elementRef.current;
    const cam = cameraRef.current;
    if (!el || !cam) return;

    function onClick(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dir = screenToRay(
        x,
        y,
        rect.width,
        rect.height,
        cam.vFOV,
        cam.yaw,
        cam.pitch
      );
      onRay(dir, e);
    }

    el.addEventListener('click', onClick);
    return () => el.removeEventListener('click', onClick);
  }, [elementRef.current, cameraRef.current, onRay]);
}
