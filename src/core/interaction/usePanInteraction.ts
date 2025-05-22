// usePanInteraction hook scaffold
import { useContext } from 'react';
import { LensContext } from '../context/LensContext';

export function usePanInteraction(options?: any): void {
  const { canvasRef, cameraRef } = useContext(LensContext)!;
  // ...attach pointer listeners, ignore when locked, and update cameraRef.current
}
