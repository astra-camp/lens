import { useEffect, useRef, useLayoutEffect } from 'react';
import { Lens, LensOptions } from '../core/lens';

export type UseLensOptions = Omit<LensOptions, 'canvas'>;

export function useLens(opts: UseLensOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lensRef = useRef<Lens | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Function to update canvas size and notify lens
  const updateCanvasSize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = opts.reglOptions?.pixelRatio ?? window.devicePixelRatio;
    const rect = canvas.getBoundingClientRect();
    const width = Math.floor(rect.width * dpr);
    const height = Math.floor(rect.height * dpr);

    // Only update if size actually changed
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;

      // Update lens camera aspect ratio
      if (lensRef.current) {
        lensRef.current.setState((state) => ({
          camera: {
            ...state.camera,
            aspect: rect.width / rect.height
          }
        }));
      }
    }
  };

  // Set up resize observer to handle canvas size changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initial size setup
    updateCanvasSize();

    // Set up resize observer
    resizeObserverRef.current = new ResizeObserver(() => {
      updateCanvasSize();
    });

    resizeObserverRef.current.observe(canvas);

    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, [opts.reglOptions?.pixelRatio]);

  // Create/destroy lens instance
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Ensure canvas is properly sized before creating lens
    updateCanvasSize();

    const lens = new Lens({ canvas, ...opts });
    lensRef.current = lens;

    return () => {
      lens.destroy();
      lensRef.current = null;
    };
  }, [opts.plugins, opts.reglOptions]);

  return { canvasRef, setState: lensRef.current?.setState };
}
