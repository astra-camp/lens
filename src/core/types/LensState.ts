import type { DrawCommand, Regl, ClearOptions } from 'regl';
import type { CameraState } from './CameraState';

export interface LensState {
  regl: Regl;
  canvas: HTMLCanvasElement;
  camera: CameraState;
  drawCommands: DrawCommand[];
  clearOptions: ClearOptions;
} 