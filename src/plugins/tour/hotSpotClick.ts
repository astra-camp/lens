import { clickRay } from '../interaction/clickRay';
import type { ViewSpaceCoord } from '../../core/types/Coordinates';
import type { HotSpot } from './types';
import type { Plugin } from '../../core/types/Plugin';

export function hotSpotClick<T extends HTMLElement>(
  hotspots: HotSpot[],
  onHotSpotClick: (
    hotspot: HotSpot,
    dir: ViewSpaceCoord,
    e: MouseEvent
  ) => void,
  angleThreshold = Math.PI / 36
): Plugin {
  // Precompute dot product threshold
  const dotThreshold = Math.cos(angleThreshold);

  return (getState, setState, registerCallbacks) =>
    clickRay((dir, e) => {
      for (const hs of hotspots) {
        // Dot product between click direction and hotspot coordinate
        const dot =
          dir[0] * hs.coord[0] + dir[1] * hs.coord[1] + dir[2] * hs.coord[2];
        if (dot >= dotThreshold) {
          onHotSpotClick(hs, dir, e);
          break;
        }
      }
    })(getState, setState, registerCallbacks);
}
