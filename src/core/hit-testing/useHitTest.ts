// useHitTest hook scaffold
import { useContext } from 'react';
import { LensContext } from '../context/LensContext';

export function useHitTest(callback: (hitInfo: any) => void): void {
  const { canvasRef, scene } = useContext(LensContext)!;
  // ...raycast and call callback
}
