import { useLensScaffold, LensScaffoldOptions } from './useLensScaffold';
import { useEquirectangularDrawCommand } from '../drawCommands/useEquirectangularDrawCommand';
import { useImageLoader } from '../utils/useLoader';
import { useRenderer } from '../rendering/useRenderer';

export interface UseEquirectangularPanoProps extends LensScaffoldOptions {
  imageUrl: string;
}

export function useEquirectangularPano({
  imageUrl,
  ...lensOptions
}: UseEquirectangularPanoProps) {
  // scaffold lens with regl, camera, canvas
  const { regl, cameraRef, canvasRef } = useLensScaffold(lensOptions);

  const { data, loading, error } = useImageLoader(imageUrl);

  // draw config with custom subdivisions
  const draw = useEquirectangularDrawCommand({
    regl,
    canvasRef,
    cameraRef,
    image: data,
  });

  // render loop
  useRenderer({
    regl,
    commands: [draw],
  });

  return {
    canvasRef,
    cameraRef,
    loading,
    error,
  };
}
