/**
 * Timing data passed to the per-frame callback.
 *
 * @property dt      Delta time in seconds since the last frame.
 * @property elapsed Total elapsed time in seconds since the renderer started.
 * @property tick    Integer frame count since the renderer started.
 */
export interface FrameContext {
  dt: number;
  elapsed: number;
  tick: number;
}
