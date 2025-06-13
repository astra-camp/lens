// Entry point for @astra-camp/lens package

// Core exports
export { Lens } from './core/lens';
export type { LensOptions } from './core/lens';
export type { Plugin } from './core/types/Plugin';
export type { LensState } from './core/types/LensState';
export type { CameraState } from './core/types/CameraState';
export type { Shader } from './core/types/Shader';
export type { ViewSpaceCoord } from './core/types/Coordinates';

// Geometry plugins
// export { cubeMapPano } from './plugins/geometry/cubeMapPano';
// export type { CubeMapPanoProps } from './plugins/geometry/cubeMapPano';
export { equirectangularPano } from './plugins/geometry/equirectangularPano';
export type { EquirectangularPanoProps } from './plugins/geometry/equirectangularPano';

// Interaction plugins
export { clickRay } from './plugins/interaction/clickRay';
export { pointerPan } from './plugins/interaction/pointerPan';
export { orbitControls } from './plugins/interaction/orbitControls';

// Tour plugins
export { drawHotSpots } from './plugins/tour/drawHotSpots';
export type { HotSpotDrawOptions } from './plugins/tour/drawHotSpots';
export { hotSpotClick } from './plugins/tour/hotSpotClick';
export type { HotSpot } from './plugins/tour/types';
export * from './plugins/tour/types';

// React hooks
export { useLens } from './react/useLens';
export type { UseLensOptions } from './react/useLens';

// Utils
export { useImageLoader } from './utils/useImageLoader';
export { useLoader } from './utils/useLoader';
export * from './utils/matrix';

