import { useMemo } from 'react';
import { MeshDesc } from '../types/MeshDesc';

/**
 * Hook to generate a unit-cube mesh for cubemaps or skyboxes.
 * @returns An object containing `mesh: MeshDesc`
 */
export function useCubeMesh(tilesPerFace: number = 1): {
  mesh: MeshDesc;
  mapDirToUV: (dir: [number, number, number]) => {
    faceIndex: number;
    u: number;
    v: number;
  };
} {
  const mesh = useMemo<MeshDesc>(() => {
    // Generate cube mesh with UV tiling per face
    const positions: number[] = [];
    const uvsData: number[] = [];
    const indicesData: number[] = [];
    const tiles = tilesPerFace;
    const faces = [
      [
        [-1, -1, -1],
        [1, -1, -1],
        [1, 1, -1],
        [-1, 1, -1],
      ], // front
      [
        [1, -1, 1],
        [-1, -1, 1],
        [-1, 1, 1],
        [1, 1, 1],
      ], // back
      [
        [-1, 1, -1],
        [1, 1, -1],
        [1, 1, 1],
        [-1, 1, 1],
      ], // top
      [
        [-1, -1, 1],
        [1, -1, 1],
        [1, -1, -1],
        [-1, -1, -1],
      ], // bottom
      [
        [1, -1, -1],
        [1, -1, 1],
        [1, 1, 1],
        [1, 1, -1],
      ], // right
      [
        [-1, -1, 1],
        [-1, -1, -1],
        [-1, 1, -1],
        [-1, 1, 1],
      ], // left
    ];
    const uvPattern: [number, number][] = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ];
    const indexPattern = [0, 1, 2, 0, 2, 3];
    faces.forEach((face, faceIndex) => {
      const offset = faceIndex * 4;
      face.forEach(([x, y, z]) => positions.push(x, y, z));
      uvPattern.forEach(([u0, v0]) => uvsData.push(u0 * tiles, v0 * tiles));
      indexPattern.forEach((i) => indicesData.push(offset + i));
    });

    return {
      positions: new Float32Array(positions),
      uvs: new Float32Array(uvsData),
      indices: new Uint16Array(indicesData),
      primitive: 'triangles',
    };
  }, [tilesPerFace]);

  // map world-space direction to cubemap face UV
  const mapDirToUV = ([x, y, z]: [number, number, number]) => {
    const absX = Math.abs(x),
      absY = Math.abs(y),
      absZ = Math.abs(z);
    let faceIndex: number, u: number, v: number;
    if (absZ >= absX && absZ >= absY) {
      if (z < 0) {
        faceIndex = 0; // front (-Z)
        u = (x / absZ + 1) * 0.5;
        v = (y / absZ + 1) * 0.5;
      } else {
        faceIndex = 1; // back (+Z)
        u = (-x / absZ + 1) * 0.5;
        v = (y / absZ + 1) * 0.5;
      }
    } else if (absY >= absX && absY >= absZ) {
      if (y > 0) {
        faceIndex = 2; // top (+Y)
        u = (x / absY + 1) * 0.5;
        v = (-z / absY + 1) * 0.5;
      } else {
        faceIndex = 3; // bottom (-Y)
        u = (x / absY + 1) * 0.5;
        v = (z / absY + 1) * 0.5;
      }
    } else {
      if (x > 0) {
        faceIndex = 4; // right (+X)
        u = (-z / absX + 1) * 0.5;
        v = (y / absX + 1) * 0.5;
      } else {
        faceIndex = 5; // left (-X)
        u = (z / absX + 1) * 0.5;
        v = (y / absX + 1) * 0.5;
      }
    }
    return { faceIndex, u, v };
  };

  return { mesh, mapDirToUV };
}
