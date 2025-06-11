import type { LensContext } from './LensContext';

export type Plugin = (ctx: LensContext) => LensContext;
