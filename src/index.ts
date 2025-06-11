// Entry point for @astra-camp/lens package

export * from './core';

// Geometry plugins
// export { cubeMapPano } from './plugins/geometry/cubeMapPano';
// export type { CubeMapPanoProps } from './plugins/geometry/cubeMapPano';
export { equirectangularPano } from './plugins/geometry/equirectangularPano';
export type { EquirectangularPanoProps } from './plugins/geometry/equirectangularPano';

// Interaction plugins
export { clickRay } from './plugins/interaction/clickRay';
export { pointerPan } from './plugins/interaction/pointerPan';
export { orbitControls } from './plugins/interaction/orbitControls';

// Tour plugin
export * from './plugins/tour';
