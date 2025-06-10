/**
 * A 3D coordinate in camera (view) space, represented as [x, y, z].
 * x: horizontal position relative to camera center (positive to the right).
 * y: vertical position relative to camera center (positive up).
 * z: depth along the camera's forward axis (negative values are in front of the camera, positive behind).
 */
export type ViewSpaceCoord = [number, number, number];
