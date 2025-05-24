import { useEffect, useMemo, useRef } from 'react';
import type { DrawCommand, Regl } from 'regl';
import type { FrameContext } from '../types/FrameContext';

// define clear options for regl.clear
export type ClearOptions = {
  color: [number, number, number, number];
  depth?: number;
};

// parameters object for useRenderer
export interface UseRendererParams {
  regl: Regl | null;
  /** already-built draw commands */
  commands: DrawCommand[];
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
  commands,
  onFrame = () => {},
  clearOptions = { color: [0, 0, 0, 0], depth: 1 },
}: UseRendererParams): void {
  // optionally disable loop if no regl
  const cmds = useMemo<DrawCommand[]>(() => {
    return regl ? commands : [];
  }, [regl, commands]);

  const lastTimeRef = useRef(0);
  const cmdsRef = useRef<DrawCommand[]>(cmds);
  const frameCbRef = useRef(onFrame);

  useEffect(() => {
    cmdsRef.current = cmds;
  }, [/* was drawCommands */ cmds]);
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
