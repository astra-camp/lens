// CameraState type for camera parameters
export interface CameraState {
  yaw: number;
  pitch: number;
  fov: number;
  velocity?: { yaw: number; pitch: number };
  locked?: boolean;
}
