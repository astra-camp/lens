import { useLensScaffold, LensScaffoldOptions } from './useLensScaffold';
import { useEquirectangularDrawCommand } from '../drawCommands/useEquirectangularDrawCommand';
import { useImageLoader } from '../utils/useLoader';
import { useRenderer } from '../rendering/useRenderer';
import { useSphereMesh } from '../meshes/useSphereMesh';

export interface UseEquirectangularPanoProps extends LensScaffoldOptions {
  imageUrl: string;
  latBands?: number;
  longBands?: number;
}

export function useEquirectangularPano({
  imageUrl,
  latBands,
  longBands,
  ...lensOptions
}: UseEquirectangularPanoProps) {
  // scaffold lens with regl, camera, canvas
  const { regl, cameraRef, canvasRef } = useLensScaffold(lensOptions);

  const { data, loading, error } = useImageLoader([imageUrl]);

  const { mesh, mapDirToUV } = useSphereMesh(latBands, longBands);

  // draw config with custom subdivisions
  const draw = useEquirectangularDrawCommand({
    regl,
    canvasRef,
    cameraRef,
    mesh,
    image: data && data[0],
  });

  // render loop
  useRenderer({
    regl,
    commands: [draw],
  });

  return {
    mapDirToUV,
    canvasRef,
    cameraRef,
    loading,
    error,
  };
}
