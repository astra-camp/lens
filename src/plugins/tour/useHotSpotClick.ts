import { RefObject } from 'react';
import { clickRay } from '../interaction/clickRay';
import type { CameraState } from '../../core/types/CameraState';
import type { ViewSpaceCoord } from '../../core/types/Coordinates';
import type { HotSpot } from './types';

/**
 * Hook to detect clicks on hotspots in a spherical panorama.
 *
 * @param elementRef - Ref to the HTML element (e.g., canvas) to listen for clicks
 * @param cameraRef  - Ref to camera state containing yaw, pitch, vFOV, and aspect
 * @param hotspots   - Array of HotSpot objects with id and coord on unit sphere
 * @param onHotSpotClick - Callback invoked when a hotspot is clicked, with hotspot id, click direction, and MouseEvent
 * @param angleThreshold - Maximum angle in radians between click ray and hotspot direction to consider a hit (default ~5°)
 */
export function useHotSpotClick<T extends HTMLElement>(
  elementRef: RefObject<T | null>,
  cameraRef: RefObject<CameraState>,
  hotspots: HotSpot[],
  onHotSpotClick: (
    hotspot: HotSpot,
    dir: ViewSpaceCoord,
    e: MouseEvent
  ) => void,
  angleThreshold = Math.PI / 36
) {
  // Precompute dot product threshold
  const dotThreshold = Math.cos(angleThreshold);

  // useClickRay(elementRef, cameraRef, (dir, e) => {
  //   for (const hs of hotspots) {
  //     // Dot product between click direction and hotspot coordinate
  //     const dot =
  //       dir[0] * hs.coord[0] + dir[1] * hs.coord[1] + dir[2] * hs.coord[2];
  //     if (dot >= dotThreshold) {
  //       onHotSpotClick(hs, dir, e);
  //       break;
  //     }
  //   }
  // });
}
