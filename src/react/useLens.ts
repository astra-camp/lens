import { useEffect, useRef, useLayoutEffect } from 'react';
import { Lens, LensOptions } from '../core/lens';

export type UseLensOptions = Omit<LensOptions, 'canvas'>;

export function useLens(opts: UseLensOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lensRef = useRef<Lens | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const lens = new Lens({ canvas, ...opts });
    lensRef.current = lens;

    return () => {
      lens.destroy();
      lensRef.current = null;
    };
  }, [opts.plugins, opts.reglOptions, canvasRef.current]);

  // keep the canvas size & camera aspect in sync before paint
  useLayoutEffect(() => {
    if (canvasRef.current) {
      const dpr = opts.reglOptions?.pixelRatio ?? window.devicePixelRatio;
      const width = Math.floor(canvasRef.current.clientWidth * dpr);
      const height = Math.floor(canvasRef.current.clientHeight * dpr);
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      // update camera aspect ratio to match canvas dimensions
      lensRef.current?.setState((state) => ({
        camera: {
          ...state.camera,
          aspect: canvasRef.current!.clientWidth / canvasRef.current!.clientHeight
        }
      }));
    }
  }, [
    opts.reglOptions?.pixelRatio,
    canvasRef.current?.clientWidth,
    canvasRef.current?.clientHeight,
  ]);

  return { canvasRef, setState: lensRef.current?.setState };
}
