import { useMemo } from 'react';
import { CameraState } from '../types/CameraState';
import { vec3 } from 'gl-matrix';

export interface VisibleTile {
  faceIndex: number;
  tileX: number;
  tileY: number;
}

/**
 * Hook to compute which cube-map tiles are inside the camera frustum.
 * @param camera - CameraState with aspect ratio added.
 * @param tilesPerFace - number of subdivisions per cube face.
 * @returns array of visible tiles (faceIndex, tileX, tileY).
 */
export function useVisibleTiles(
  camera: CameraState,
  tilesPerFace: number = 1
): VisibleTile[] {
  return useMemo(() => {
    const visible: VisibleTile[] = [];
    const halfV = camera.vFOV * 0.5;
    const halfH = Math.atan(camera.aspect * Math.tan(halfV));
    const normalizeAngle = (a: number): number => {
      let d = ((a + Math.PI) % (2 * Math.PI)) - Math.PI;
      return d;
    };

    function faceUVToDir(
      fi: number,
      u: number,
      v: number
    ): [number, number, number] {
      const uu = u * 2 - 1;
      const vv = v * 2 - 1;
      let x: number, y: number, z: number;
      switch (fi) {
        case 0:
          x = uu;
          y = vv;
          z = -1;
          break; // front (-Z)
        case 1:
          x = -uu;
          y = vv;
          z = 1;
          break; // back (+Z)
        case 2:
          x = uu;
          y = 1;
          z = -vv;
          break; // top (+Y)
        case 3:
          x = uu;
          y = -1;
          z = vv;
          break; // bottom (-Y)
        case 4:
          x = 1;
          y = vv;
          z = -uu;
          break; // right (+X)
        case 5:
          x = -1;
          y = vv;
          z = uu;
          break; // left (-X)
        default:
          x = uu;
          y = vv;
          z = -1;
      }
      const dir = vec3.fromValues(x, y, z);
      vec3.normalize(dir, dir);
      return [dir[0], dir[1], dir[2]];
    }

    for (let fi = 0; fi < 6; fi++) {
      for (let ty = 0; ty < tilesPerFace; ty++) {
        for (let tx = 0; tx < tilesPerFace; tx++) {
          const tileCorners: [number, number][] = [
            [tx / tilesPerFace, ty / tilesPerFace],
            [(tx + 1) / tilesPerFace, ty / tilesPerFace],
            [(tx + 1) / tilesPerFace, (ty + 1) / tilesPerFace],
            [tx / tilesPerFace, (ty + 1) / tilesPerFace],
          ];
          const isVisible = tileCorners.some(([u, v]) => {
            const [dx, dy, dz] = faceUVToDir(fi, u, v);
            const tileYaw = Math.atan2(dx, -dz);
            const tilePitch = Math.asin(dy);
            const dYaw = normalizeAngle(tileYaw - camera.yaw);
            const dPitch = tilePitch - camera.pitch;
            return Math.abs(dYaw) <= halfH && Math.abs(dPitch) <= halfV;
          });
          if (isVisible) {
            visible.push({ faceIndex: fi, tileX: tx, tileY: ty });
          }
        }
      }
    }
    return visible;
  }, [camera.yaw, camera.pitch, camera.vFOV, camera.aspect, tilesPerFace]);
}
