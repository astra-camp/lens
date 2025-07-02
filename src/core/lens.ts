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
  private isDirty: boolean = true; // Track if state has changed and needs rendering

  constructor({
    canvas,
    plugins,
    initialCameraState = { yaw: 0, pitch: 0, vFOV: Math.PI / 2, aspect: 1 },
    reglOptions,
    clearOptions = { color: [0, 0, 0, 0], depth: 1 },
  }: LensOptions) {
    this.regl = Regl({ canvas: canvas, ...reglOptions });

    this.state = {
      canvas,
      camera: initialCameraState,
      regl: this.regl,
      drawCommands: [],
      clearOptions: clearOptions,
    };

    this.applyPlugins(plugins);
    this.startRenderLoop();
  }

  private applyPlugins(plugins: Plugin[]) {
    this.setupCallbacks = [];
    this.cleanupCallbacks = [];
    this.frameCallbacks = [];
    this.state.drawCommands = [];
    this.isDirty = true; // Mark as dirty when plugins change

    const registerCallbacks = {
      onSetup: (callback: () => void) => this.setupCallbacks.push(callback),
      onCleanup: (callback: () => void) => this.cleanupCallbacks.push(callback),
      onFrame: (callback: (frame: FrameContext) => void) => this.frameCallbacks.push(callback),
    };

    const getState = this.getState.bind(this);
    const setState = this.setState.bind(this);

    for (const plugin of plugins) {
      const update = plugin(getState, setState, registerCallbacks);
      this.state = { ...this.state, ...update };
    }
  }

  updatePlugins(plugins: Plugin[]) {
    this.stopRenderLoop();
    this.applyPlugins(plugins);
    this.startRenderLoop();
  }

  private startRenderLoop() {
    this.setupCallbacks.forEach(fn => fn());
    let last = 0;
    
    this.frameHandle = this.regl.frame(({ time, tick }) => {
      const dt = last ? time - last : 0;
      last = time;
      
      // Always run frame callbacks for timing and UI updates
      this.frameCallbacks.forEach(fn => fn({ dt, elapsed: time, tick }));
      
      // Only render if state has changed
      if (this.isDirty) {
        this.regl.clear(this.state.clearOptions);
        this.state.drawCommands.forEach((d) => d());
        this.isDirty = false;
      }
    });
  }

  private stopRenderLoop() {
    if (this.frameHandle) {
      this.frameHandle.cancel();
      this.frameHandle = null;
    }
    this.cleanupCallbacks.forEach(fn => fn());
  }

  getState() {
    return this.state;
  }

  setState(update: (state: LensState) => Partial<LensState>) {
    this.state = { ...this.state, ...update(this.state) };
    this.isDirty = true; // Mark as dirty when state changes
  }

  destroy() {
    this.stopRenderLoop();
    this.regl.destroy();
  }
}
