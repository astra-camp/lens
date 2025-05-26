import { useRef, useEffect } from 'react';
import { InitializationOptions } from 'regl';
import { useREGL } from '../rendering/useREGL';
import { CameraState } from '../types/CameraState';

export interface LensScaffoldOptions {
  initialCameraState?: CameraState;
  reglOptions?: InitializationOptions;
}

export function useLensScaffold({
  initialCameraState = { yaw: 0, pitch: 0, vFOV: Math.PI / 3 },
  reglOptions,
}: LensScaffoldOptions = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const regl = useREGL({
    canvas: canvasRef.current ?? undefined,
    ...reglOptions,
  });

  const cameraRef = useRef<CameraState>(initialCameraState);

  // resize canvas backing buffer to match CSS size × devicePixelRatio
  useEffect(() => {
    if (canvasRef.current) {
      const dpr = reglOptions?.pixelRatio ?? window.devicePixelRatio;
      const width = Math.floor(canvasRef.current.clientWidth * dpr);
      const height = Math.floor(canvasRef.current.clientHeight * dpr);
      canvasRef.current.width = width;
      canvasRef.current.height = height;
    }
  }, [
    reglOptions?.pixelRatio,
    canvasRef.current?.clientWidth,
    canvasRef.current?.clientHeight,
  ]);

  return {
    canvasRef,
    regl,
    cameraRef,
  };
}
