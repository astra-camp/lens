import React, { useRef, useContext, useEffect } from 'react';
import { createScene } from '../scene/useScene';
import { initCamera } from '../camera/useCameraState';

export interface LensContextValue {
  scene: any; // SceneRef
  cameraRef: React.MutableRefObject<any>; // CameraState
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  useFrame: (callback: (frame: any) => void) => void;
}

export const LensContext = React.createContext<LensContextValue | undefined>(
  undefined
);

export function LensContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const scene = createScene();
  const cameraRef = useRef(initCamera());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const useFrame = () => {};
  return (
    <LensContext.Provider value={{ scene, cameraRef, canvasRef, useFrame }}>
      {children}
    </LensContext.Provider>
  );
}
