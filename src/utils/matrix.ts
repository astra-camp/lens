import { mat4, vec3, ReadonlyMat4 } from 'gl-matrix';

/**
 * Compute a perspective projection matrix.
 * @param fov Vertical field-of-view in radians
 * @param aspect Aspect ratio (width/height)
 * @param near Near clipping plane distance
 * @param far Far clipping plane distance
 * @returns A 4x4 projection matrix
 */
export function getProjectionMatrix(
  fov: number,
  aspect: number,
  near: number = 0.1,
  far: number = 100
): ReadonlyMat4 {
  const out = mat4.create();
  mat4.perspective(out, fov, aspect, near, far);
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
