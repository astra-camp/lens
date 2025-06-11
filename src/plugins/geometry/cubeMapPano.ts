// import { useMemo, useRef, useCallback } from 'react';
// import { createCubeMesh } from './meshes/cubeMesh';
// import type { Shader } from '../../core/types/Shader';
// import type { TextureCube, TextureCubeFaceIndex } from 'regl';
// import type { Plugin } from '../../core/types/Plugin';
// import { getProjectionMatrix, getViewMatrix } from '../../core/helpers';

// const cubeMapShader: Shader = {
//   vert: `
//     attribute vec3 aPosition;
//     uniform mat4 uProjection, uView;
//     varying vec3 vPosition;
//     void main() {
//       vPosition = aPosition;
//       gl_Position = uProjection * uView * vec4(aPosition, 1.0);
//     }`,
//   frag: `
//     precision mediump float;
//     varying vec3 vPosition;
//     uniform samplerCube uCubemap;
//     void main() {
//       vec3 dir = normalize(vPosition);
//       gl_FragColor = textureCube(uCubemap, dir);
//     }`,
// };

// export interface CubeMapPanoProps {
//   /** Nested array of face image data [face][row][col] for 6 faces */
//   faceTiles: ImageBitmap[][][];
// }

// export function cubeMapPano({ faceTiles }: CubeMapPanoProps): Plugin {
//   // ref to hold the cubemap texture
//   const cubeTexRef = useRef<TextureCube>(null);
//   // ref to remember last uploaded tiles
//   const prevTilesRef = useRef<ImageBitmap[][][] | undefined>(undefined);

//   // infer tilesPerFace from nested faceUrls and validate square grid
//   const rows = faceTiles[0]?.length ?? 0;
//   const cols = faceTiles[0]?.[0]?.length ?? 0;
//   if (rows !== cols) {
//     throw new Error(
//       'faceTiles must be a square grid: rows and columns must match'
//     );
//   }
//   const tilesPerFace = rows;

//   // build cube mesh and UV mapper with inferred subdivisions
//   const mesh = useMemo(() => createCubeMesh(tilesPerFace), [tilesPerFace]);

//   return useCallback(
//     (ctx) => {
//       const { regl, cameraRef, canvasRef } = ctx;
//       if (!regl || !canvasRef.current || faceTiles.length !== 6) {
//         return ctx;
//       }
//       // derive face and tile sizes
//       const tilesPerSide = faceTiles[0].length;
//       const tileW = faceTiles[0][0][0].width;
//       const faceSize = tilesPerSide * tileW;

//       if (!cubeTexRef.current) {
//         cubeTexRef.current = regl.cube({
//           width: faceSize,
//           height: faceSize,
//           faces: faceTiles.map((r) => r[0][0]) as any, // use first tile of each face to get format
//           mag: 'linear',
//           min: 'linear',
//         });
//       } else if (cubeTexRef.current.width !== faceSize) {
//         cubeTexRef.current.resize(faceSize);
//       }

//       faceTiles.forEach((rows, faceIdx) => {
//         rows.forEach((cols, rowIdx) => {
//           cols.forEach((tile, colIdx) => {
//             // only upload if this tile changed
//             if (
//               !prevTilesRef.current ||
//               prevTilesRef.current[faceIdx]?.[rowIdx]?.[colIdx] !== tile
//             ) {
//               cubeTexRef.current!.subimage(
//                 faceIdx as TextureCubeFaceIndex,
//                 tile as any,
//                 colIdx * tileW,
//                 rowIdx * tileW
//               );
//             }
//           });
//         });
//       });
//       // remember current tiles for next diff
//       prevTilesRef.current = faceTiles;

//       // return draw command binding the cubemap
//       const command = regl({
//         vert: cubeMapShader.vert,
//         frag: cubeMapShader.frag,
//         attributes: { aPosition: mesh.positions },
//         elements: mesh.indices,
//         uniforms: {
//           uCubemap: () => cubeTexRef.current,
//           uProjection: () =>
//             getProjectionMatrix(
//               cameraRef.current.vFOV,
//               cameraRef.current.aspect
//             ),
//           uView: () =>
//             getViewMatrix(cameraRef.current.yaw, cameraRef.current.pitch),
//         },
//         depth: { enable: false },
//         cull: { enable: true, face: 'front' },
//       });
//       return {
//         ...ctx,
//         drawCommands: [...ctx.drawCommands, command],
//       };
//     },
//     [faceTiles, mesh, cubeTexRef, prevTilesRef]
//   );
// }
