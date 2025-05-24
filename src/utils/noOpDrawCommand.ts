import { DrawCommand } from 'regl';

export const noOpDrawCommand: DrawCommand = Object.assign(() => 0, {
  stats: {} as any,
  context: {} as any,
  regl: {} as any,
});
