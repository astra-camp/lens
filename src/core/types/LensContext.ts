import { RefObject } from 'react';
import type { DrawCommand, Regl } from 'regl';
import type { CameraState } from './CameraState';
import type { FrameContext } from './FrameContext';

export interface LensContext {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  cameraRef: RefObject<CameraState>;
  regl: Regl | null;

  drawCommands: DrawCommand[];
  frameCallbacks: Array<(frame: FrameContext) => void>;
  setupCallbacks: Array<() => void>;
  cleanupCallbacks: Array<() => void>;
}
