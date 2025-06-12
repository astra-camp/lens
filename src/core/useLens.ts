import { useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import type { InitializationOptions, ClearOptions } from 'regl';
import { useREGL } from './useREGL';
import { useRenderer } from './useRenderer';
import type { CameraState } from './types/CameraState';
import type { FrameContext } from './types/FrameContext';
import type { LensContext } from './types/LensContext';
import type { Plugin } from './types/Plugin';

export interface LensOptions {
  plugins: Plugin[];
  initialCameraState?: CameraState;
  reglOptions?: InitializationOptions;
  clearOptions?: ClearOptions;
}

export function useLens({
  plugins,
  initialCameraState = { yaw: 0, pitch: 0, vFOV: Math.PI / 3, aspect: 1 },
  reglOptions,
  clearOptions,
}: LensOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const regl = useREGL({
    canvas: canvasRef.current ?? undefined,
    ...reglOptions,
  });
  const cameraRef = useRef<CameraState>(initialCameraState);

  // keep the canvas size & camera aspect in sync before paint
  useLayoutEffect(() => {
    if (canvasRef.current) {
      const dpr = reglOptions?.pixelRatio ?? window.devicePixelRatio;
      const width = Math.floor(canvasRef.current.clientWidth * dpr);
      const height = Math.floor(canvasRef.current.clientHeight * dpr);
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      // update camera aspect ratio to match canvas dimensions
      cameraRef.current.aspect =
        canvasRef.current.clientWidth / canvasRef.current.clientHeight;
    }
  }, [
    reglOptions?.pixelRatio,
    canvasRef.current?.clientWidth,
    canvasRef.current?.clientHeight,
  ]);

  // 1) build a “base” context exactly once per regl instance
  const baseCtx = useMemo<LensContext>(
    () => ({
      canvasRef,
      cameraRef,
      regl,
      drawCommands: [],
      frameCallbacks: [],
      setupCallbacks: [],
      cleanupCallbacks: [],
    }),
    [regl]
  );

  // 2) run your plugins as decorators, each one mutating/returning ctx
  const ctx = useMemo<LensContext>(
    () => plugins.reduce((c, plugin) => plugin(c), baseCtx),
    [plugins, baseCtx]
  );

  // 3) invoke all setupCallbacks once, and schedule cleanupCallbacks on unmount
  useEffect(() => {
    ctx.setupCallbacks.forEach((fn) => fn());
    return () => {
      ctx.cleanupCallbacks.forEach((fn) => fn());
    };
  }, [ctx]);

  // 4) drive regl draw/onFrame from the accumulated callbacks
  useRenderer({
    regl,
    drawCommands: ctx.drawCommands,
    onFrame: (frame: FrameContext) =>
      ctx.frameCallbacks.forEach((fn) => fn({ ...ctx, ...frame })),
    clearOptions,
  });

  return { canvasRef, regl, cameraRef };
}
