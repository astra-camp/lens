import { useContext, useEffect } from 'react';
import { LensContext } from './LensContext';
import type { LensPlugin } from '../../types/PluginAPI';

export function usePlugin(plugin: LensPlugin): void {
  const context = useContext(LensContext)!;
  useEffect(() => {
    plugin.onInit?.(context);
    return () => plugin.onDestroy?.();
  }, []);
}
