import Regl, { InitializationOptions, ClearOptions } from 'regl';
import type { Plugin } from './types/Plugin';
import type { CameraState } from './types/CameraState';
import type { LensState } from './types/LensState';
import type { FrameContext } from './types/FrameContext';

export interface LensOptions {
  canvas: HTMLCanvasElement;
  plugins: Plugin[];
  initialCameraState?: CameraState;
  reglOptions?: InitializationOptions;
  clearOptions?: ClearOptions;
}

export class Lens {
  private regl: Regl.Regl;
  private state: LensState;
  private frameHandle: Regl.Cancellable | null = null;
  private setupCallbacks: Array<() => void> = [];
  private cleanupCallbacks: Array<() => void> = [];
  private frameCallbacks: Array<(frame: FrameContext) => void> = [];

  constructor({
    canvas,
    plugins,
    initialCameraState = { yaw: 0, pitch: 0, vFOV: Math.PI / 3, aspect: 1 },
    reglOptions,
    clearOptions = { color: [0, 0, 0, 0], depth: 1 },
  }: LensOptions) {
    this.regl = Regl({ canvas: canvas, ...reglOptions });

    const baseState: LensState = {
      canvas,
      camera: initialCameraState,
      regl: this.regl,
      drawCommands: [],
      clearOptions: clearOptions,
    };

    this.state = baseState;

    const registerCallbacks = {
      onSetup: (callback: () => void) => this.setupCallbacks.push(callback),
      onCleanup: (callback: () => void) => this.cleanupCallbacks.push(callback),
      onFrame: (callback: (frame: FrameContext) => void) => this.frameCallbacks.push(callback),
    };

    let getState = this.getState.bind(this);
    let setState = this.setState.bind(this);

    // Process plugins sequentially
    for (const plugin of plugins) {
      const update = plugin(getState, setState, registerCallbacks);
      this.state = { ...this.state, ...update };
    }

    this.start();
  }

  private start() {
    this.setupCallbacks.forEach(fn => fn());
    let last = 0;
    this.frameHandle = this.regl.frame(({ time, tick }) => {
      const dt = last ? time - last : 0;
      last = time;
      this.frameCallbacks.forEach(fn => fn({ dt, elapsed: time, tick }));
      this.regl.clear(this.state.clearOptions);
      this.state.drawCommands.forEach((d) => d());
    });
  }

  private stop() {
    this.frameHandle?.cancel();
    this.cleanupCallbacks.forEach(fn => fn());
  }

  getState() {
    return this.state;
  }

  setState(update: (state: LensState) => Partial<LensState>) {
    this.state = { ...this.state, ...update(this.state) };
  }

  destroy() {
    this.stop();
    this.regl.destroy();
  }
}
