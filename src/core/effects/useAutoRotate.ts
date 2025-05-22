// useAutoRotate hook scaffold
import { useContext } from 'react';
import { LensContext } from '../context/LensContext';

export function useAutoRotate(options?: any): void {
  const { cameraRef, useFrame } = useContext(LensContext)!;
  useFrame((dt: number) => {
    // ...auto-rotate cameraRef.current
  });
}
