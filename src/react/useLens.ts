import { useEffect, useRef, useCallback } from 'react';
import { Lens, LensOptions } from '../core/lens';

export type UseLensOptions = Omit<LensOptions, 'canvas'>;

export function useLens(opts: UseLensOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lensRef = useRef<Lens | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Function to update canvas size and notify lens
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = opts.reglOptions?.pixelRatio ?? window?.devicePixelRatio;
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
  }, [opts.reglOptions?.pixelRatio]);

  // Callback ref that gets called when canvas is set
  const setCanvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    // Clean up old lens if canvas is being removed
    if (!canvas && lensRef.current) {
      lensRef.current.destroy();
      lensRef.current = null;
    }

    canvasRef.current = canvas;
    
    // Create new lens if canvas is available and lens doesn't exist
    if (canvas && !lensRef.current) {
      // Create lens with empty plugins initially, then update them
      const lens = new Lens({ canvas, ...opts });
      lensRef.current = lens;
    }
  }, []);

  // Set up resize observer to handle canvas size changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set up resize observer
    resizeObserverRef.current = new ResizeObserver(() => {
      updateCanvasSize();
    });

    resizeObserverRef.current.observe(canvas);

    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, [updateCanvasSize]);

  // Update plugins when they change (without recreating lens)
  useEffect(() => {
    if (!lensRef.current) return;
    lensRef.current.updatePlugins(opts.plugins);
  }, [opts.plugins]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (lensRef.current) {
        lensRef.current.destroy();
        lensRef.current = null;
      }
    };
  }, []);

  return { canvasRef: setCanvasRef, setState: lensRef.current?.setState };
}
