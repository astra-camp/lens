// CameraState type for camera parameters
export interface CameraState {
  yaw: number;
  pitch: number;
  vFOV: number;
  aspect: number;
  velocity?: { yaw: number; pitch: number };
  locked?: boolean;
}
