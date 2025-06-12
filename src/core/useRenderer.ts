import { useEffect, useRef } from 'react';
import type { DrawCommand, Regl, ClearOptions } from 'regl';
import type { FrameContext } from './types/FrameContext';

// parameters object for useRenderer
export interface UseRendererParams {
  regl: Regl | null;
  drawCommands: DrawCommand[];
  onFrame?: (ctx: FrameContext) => void;
  /** Optional clear parameters (color/depth). */
  clearOptions?: ClearOptions;
}

/**
 * Sets up a Regl render loop inside a React effect.
 *
 * @param params         Configuration options for the renderer.
 */
export function useRenderer({
  regl,
  drawCommands,
  onFrame = () => {},
  clearOptions = { color: [0, 0, 0, 0], depth: 1 },
}: UseRendererParams): void {
  const lastTimeRef = useRef(0);
  const frameCbRef = useRef(onFrame);
  const cmdsRef = useRef<DrawCommand[]>(drawCommands);

  useEffect(() => {
    cmdsRef.current = drawCommands;
  }, [drawCommands]);

  useEffect(() => {
    frameCbRef.current = onFrame;
  }, [onFrame]);

  // frame loop → cancel on unmount or when regl changes
  useEffect(() => {
    if (!regl) return;
    lastTimeRef.current = 0;
    const frame = regl.frame(({ time, tick }) => {
      const dt = lastTimeRef.current > 0 ? time - lastTimeRef.current : 0;
      lastTimeRef.current = time;
      frameCbRef.current({ dt, elapsed: time, tick });

      regl.clear(clearOptions);
      cmdsRef.current.forEach((cmd) => cmd());
    });
    return () => {
      frame.cancel();
    };
  }, [regl, clearOptions]);
}
