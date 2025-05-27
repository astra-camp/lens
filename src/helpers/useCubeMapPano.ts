import { useMemo } from 'react';
import { useLensScaffold, LensScaffoldOptions } from './useLensScaffold';
import { useCubeMapDrawCommand } from '../drawCommands/useCubeMapDrawCommand';
import { useImageLoader } from '../utils/useLoader';
import { useRenderer } from '../rendering/useRenderer';
import { useCubeMesh } from '../meshes/useCubeMesh';

export interface UseCubeMapPanoProps extends LensScaffoldOptions {
  /** Nested array of face tile URLs [face][row][col] for 6 faces */
  faceUrls: string[][][];
}

export function useCubeMapPano({
  faceUrls,
  ...lensOptions
}: UseCubeMapPanoProps) {
  // scaffold lens with regl, camera, canvas
  const { regl, cameraRef, canvasRef } = useLensScaffold(lensOptions);

  // load all face tile images, flattening the nested URLs
  const flatUrls = useMemo(() => faceUrls.flat(2), [faceUrls]);
  const { data, loading, error } = useImageLoader(flatUrls);

  // infer tilesPerFace from nested faceUrls and validate square grid
  const rows = faceUrls[0]?.length ?? 0;
  const cols = faceUrls[0]?.[0]?.length ?? 0;
  if (rows !== cols) {
    throw new Error(
      'faceUrls must be a square grid: rows and columns must match'
    );
  }
  const tilesPerFace = rows;
  // build cube mesh and UV mapper with inferred subdivisions
  const { mesh, mapDirToUV } = useCubeMesh(tilesPerFace);

  // assemble nested faceTiles from the flat-loaded bitmaps
  const faceTiles = useMemo(() => {
    if (!data) return [];
    let idx = 0;
    return faceUrls.map((rowsArr) =>
      rowsArr.map((colsArr) => colsArr.map(() => data[idx++]))
    );
  }, [data, faceUrls]);

  // create draw command for cubemap
  const draw = useCubeMapDrawCommand({
    regl,
    canvasRef,
    cameraRef,
    mesh,
    faceTiles,
  });

  // render loop
  useRenderer({ regl, commands: [draw] });

  return { mapDirToUV, canvasRef, cameraRef, loading, error };
}
