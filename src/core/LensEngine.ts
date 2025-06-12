import Regl, { InitializationOptions, ClearOptions } from 'regl';
import type { Plugin } from './types/Plugin';
import type { CameraState } from './types/CameraState';
import type { LensContext } from './types/LensContext';

export interface LensEngineOptions {
  canvas: HTMLCanvasElement;
  plugins: Plugin[];
  initialCameraState?: CameraState;
  reglOptions?: InitializationOptions;
  clearOptions?: ClearOptions;
}

export class LensEngine {
  private regl: Regl.Regl;
  private ctx: LensContext;
  private frameHandle: Regl.Cancellable | null = null;

  constructor({
    canvas,
    plugins,
    initialCameraState = { yaw: 0, pitch: 0, vFOV: Math.PI / 3, aspect: 1 },
    reglOptions,
    clearOptions = { color: [0, 0, 0, 0], depth: 1 },
  }: LensEngineOptions) {
    this.regl = Regl({ canvas: canvas, ...reglOptions });

    const baseCtx: LensContext = {
      canvas,
      camera: initialCameraState,
      regl: this.regl,
      drawCommands: [],
      frameCallbacks: [],
      setupCallbacks: [],
      cleanupCallbacks: [],
      clearOptions: clearOptions,
    };

    this.ctx = plugins.reduce((c, p) => p(c), baseCtx);

    this.start();
  }

  private start() {
    this.ctx.setupCallbacks.forEach((fn) => fn());
    let last = 0;
    this.frameHandle = this.regl.frame(({ time, tick }) => {
      const dt = last ? time - last : 0;
      last = time;
      this.ctx.frameCallbacks.forEach((fn) =>
        fn({ ...this.ctx, dt, elapsed: time, tick })
      );
      this.regl.clear(this.ctx.clearOptions);
      this.ctx.drawCommands.forEach((d) => d());
    });
  }

  private stop() {
    this.frameHandle?.cancel();
    this.ctx.cleanupCallbacks.forEach((fn) => fn());
  }

  destroy() {
    this.stop();
    this.regl.destroy();
  }
}
