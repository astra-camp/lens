import { useRef } from 'react';
import { CameraState } from '../../types/CameraState';

export function useCameraState(initial?: Partial<CameraState>) {
  return useRef<CameraState>({
    yaw: 0,
    pitch: 0,
    fov: 75,
    ...initial,
  });
}

export function initCamera(): CameraState {
  return {
    yaw: 0,
    pitch: 0,
    fov: 75,
  };
}
