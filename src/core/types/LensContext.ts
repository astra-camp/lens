import type { DrawCommand, Regl, ClearOptions } from 'regl';

import type { CameraState } from './CameraState';
import type { FrameContext } from './FrameContext';

export interface LensContext {
  regl: Regl;
  canvas: HTMLCanvasElement;
  camera: CameraState;
  drawCommands: DrawCommand[];
  frameCallbacks: Array<(frame: FrameContext) => void>;
  setupCallbacks: Array<() => void>;
  cleanupCallbacks: Array<() => void>;
  clearOptions: ClearOptions;
}
