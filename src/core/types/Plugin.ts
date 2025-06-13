import type { LensState } from './LensState';
import type { FrameContext } from './FrameContext';

export interface CallbackRegistry {
  onSetup: (callback: () => void) => void;
  onCleanup: (callback: () => void) => void;
  onFrame: (callback: (frameCtx: FrameContext) => void) => void;
}

export type Plugin = (
  getState: () => Readonly<LensState>,
  setState: (update: (state: LensState) => Partial<LensState>) => void,
  registerCallbacks: CallbackRegistry
) => Partial<LensState>;
