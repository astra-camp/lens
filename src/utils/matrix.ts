import { mat4, vec3, ReadonlyMat4 } from 'gl-matrix';

/**
 * Compute a perspective projection matrix.
 * @param vFOV Vertical field-of-view in radians
 * @param aspect Aspect ratio (width/height)
 * @param near Near clipping plane distance
 * @param far Far clipping plane distance
 * @returns A 4x4 projection matrix
 */
export function getProjectionMatrix(
  vFOV: number,
  aspect: number,
  near: number = 0.1,
  far: number = 100
): ReadonlyMat4 {
  const out = mat4.create();
  mat4.perspective(out, vFOV, aspect, near, far);
  return out;
}

/**
 * Compute a view matrix from yaw and pitch rotations.
 * @param yaw Rotation around the Y-axis in radians
 * @param pitch Rotation around the X-axis in radians
 * @returns A 4x4 view matrix
 */
export function getViewMatrix(yaw: number, pitch: number): ReadonlyMat4 {
  // Compute camera direction by applying yaw then pitch to forward vector
  const rotation = mat4.create();
  mat4.rotateY(rotation, rotation, yaw);
  mat4.rotateX(rotation, rotation, pitch);
  const forward = vec3.fromValues(0, 0, -1);
  const dir = vec3.create();
  vec3.transformMat4(dir, forward, rotation);
  // Build view matrix using lookAt with fixed up vector to prevent roll
  const eye = vec3.fromValues(0, 0, 0);
  const up = vec3.fromValues(0, 1, 0);
  const out = mat4.create();
  mat4.lookAt(out, eye, dir, up);
  return out;
}

/**
 * Convert 2D screen coords and camera parameters into a normalized world-space ray direction.
 * @param x      X coordinate relative to the element (pixels)
 * @param y      Y coordinate relative to the element (pixels)
 * @param width  Element width in pixels
 * @param height Element height in pixels
 * @param vFOV   Camera vertical field-of-view in radians
 * @param yaw    Camera yaw (Y-axis rotation) in radians
 * @param pitch  Camera pitch (X-axis rotation) in radians
 * @returns A normalized direction vector [x, y, z]
 */
export function screenToRay(
  x: number,
  y: number,
  width: number,
  height: number,
  vFOV: number,
  yaw: number,
  pitch: number
): [number, number, number] {
  const ndcX = (x / width) * 2 - 1;
  const ndcY = -((y / height) * 2 - 1);
  const tanFov = Math.tan(vFOV / 2);
  const vx = ndcX * tanFov * (width / height);
  const vy = ndcY * tanFov;
  const vz = -1;
  const dir = vec3.fromValues(vx, vy, vz);
  vec3.rotateX(dir, dir, [0, 0, 0], pitch);
  vec3.rotateY(dir, dir, [0, 0, 0], yaw);
  vec3.normalize(dir, dir);
  return [dir[0], dir[1], dir[2]];
}
