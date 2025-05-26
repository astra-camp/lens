import { useMemo } from 'react';
import { MeshDesc } from '../types/MeshDesc';

/**
 * Hook to generate a UV-mapped unit-sphere mesh.
 * @param latBands Number of latitude segments (vertical)
 * @param longBands Number of longitude segments (horizontal)
 * @returns An object containing `mesh: MeshDesc` and `mapDirToUV(dir) => UV`
 */
export function useSphereMesh(
  latBands: number = 40,
  longBands: number = 60
): {
  mesh: MeshDesc;
  mapDirToUV: (dir: [number, number, number]) => { u: number; v: number };
} {
  // generate sphere mesh
  const mesh = useMemo<MeshDesc>(() => {
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    // Generate vertices
    for (let y = 0; y <= latBands; y++) {
      const v = y / latBands;
      const phi = v * Math.PI;
      for (let x = 0; x <= longBands; x++) {
        const u = x / longBands;
        const theta = u * 2 * Math.PI + Math.PI / 2;
        const sx = Math.sin(phi) * Math.cos(theta);
        const sy = Math.cos(phi);
        const sz = Math.sin(phi) * Math.sin(theta);
        positions.push(sx, sy, sz);
        uvs.push(u, v);
      }
    }

    // Generate indices
    for (let y = 0; y < latBands; y++) {
      for (let x = 0; x < longBands; x++) {
        const i = y * (longBands + 1) + x;
        indices.push(
          i,
          i + 1,
          i + longBands + 1,
          i + 1,
          i + longBands + 2,
          i + longBands + 1
        );
      }
    }

    return {
      positions: new Float32Array(positions),
      uvs: new Float32Array(uvs),
      indices: new Uint16Array(indices),
      primitive: 'triangles',
    };
  }, [latBands, longBands]);

  // map world-space ray direction to equirectangular UV
  const mapDirToUV = ([x, y, z]: [number, number, number]) => {
    const theta = Math.atan2(z, x); // -π to +π
    const phi = Math.acos(y); // 0 to π
    return { u: theta / (2 * Math.PI) + 0.5, v: phi / Math.PI };
  };

  return { mesh, mapDirToUV };
}
