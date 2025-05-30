import { useMemo, useRef, useEffect } from 'react';
import type {
  Regl,
  DrawCommand,
  TextureCube,
  TextureCubeFaceIndex,
} from 'regl';

import { MeshDesc } from '../types/MeshDesc';
import { getProjectionMatrix, getViewMatrix } from '../utils/matrix';
import type { CameraState } from '../types/CameraState';
import { noOpDrawCommand } from '../utils/noOpDrawCommand';

/**
 * Hook options for creating a cubemap draw command.
 */
export interface CubeMapDrawConfigOptions {
  /** Regl instance used to create draw commands */
  regl: Regl | null;
  /** Ref to the canvas element where Regl renders */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** Ref to the current camera state (yaw, pitch, vFOV) */
  cameraRef: React.RefObject<CameraState>;
  mesh: MeshDesc;
  /** Array of 6 faces, each a 2D matrix of ImageBitmap tiles */
  faceTiles: ImageBitmap[][][];
}

const cubeMapShader = {
  vert: `
    attribute vec3 aPosition;
    uniform mat4 uProjection, uView;
    varying vec3 vPosition;
    void main() {
      vPosition = aPosition;
      gl_Position = uProjection * uView * vec4(aPosition, 1.0);
    }`,
  frag: `
    precision mediump float;
    varying vec3 vPosition;
    uniform samplerCube uCubemap;
    void main() {
      vec3 dir = normalize(vPosition);
      gl_FragColor = textureCube(uCubemap, dir);
    }`,
};

/**
 * Hook that creates a Regl DrawCommand for rendering a cubemap skybox.
 */
export function useCubeMapDrawCommand({
  regl,
  canvasRef,
  cameraRef,
  faceTiles,
  mesh,
}: CubeMapDrawConfigOptions): DrawCommand {
  // ref to hold the cubemap texture
  const cubeTexRef = useRef<TextureCube>(null);
  // ref to remember last uploaded tiles
  const prevTilesRef = useRef<ImageBitmap[][][] | undefined>(undefined);
  // create draw command once
  return useMemo<DrawCommand>(() => {
    if (!regl || !canvasRef.current || faceTiles.length !== 6) {
      return noOpDrawCommand;
    }
    // derive face and tile sizes
    const tilesPerSide = faceTiles[0].length;
    const tileW = faceTiles[0][0][0].width;
    const faceSize = tilesPerSide * tileW;

    if (!cubeTexRef.current) {
      cubeTexRef.current = regl.cube({
        width: faceSize,
        height: faceSize,
        faces: faceTiles.map((r) => r[0][0]) as any, // use first tile of each face to get format
        mag: 'linear',
        min: 'linear',
      });
    } else if (cubeTexRef.current.width !== faceSize) {
      cubeTexRef.current.resize(faceSize);
    }

    faceTiles.forEach((rows, faceIdx) => {
      rows.forEach((cols, rowIdx) => {
        cols.forEach((tile, colIdx) => {
          // only upload if this tile changed
          if (
            !prevTilesRef.current ||
            prevTilesRef.current[faceIdx]?.[rowIdx]?.[colIdx] !== tile
          ) {
            cubeTexRef.current!.subimage(
              faceIdx as TextureCubeFaceIndex,
              tile as any,
              colIdx * tileW,
              rowIdx * tileW
            );
          }
        });
      });
    });
    // remember current tiles for next diff
    prevTilesRef.current = faceTiles;

    // return draw command binding the cubemap
    return regl({
      vert: cubeMapShader.vert,
      frag: cubeMapShader.frag,
      attributes: { aPosition: mesh.positions },
      elements: mesh.indices,
      uniforms: {
        uCubemap: () => cubeTexRef.current,
        uProjection: () =>
          getProjectionMatrix(cameraRef.current.vFOV, cameraRef.current.aspect),
        uView: () =>
          getViewMatrix(cameraRef.current.yaw, cameraRef.current.pitch),
      },
      depth: { enable: false },
      cull: { enable: true, face: 'front' },
    });
  }, [regl, canvasRef.current, mesh, cameraRef.current, faceTiles]);
}
