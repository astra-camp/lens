import { useMemo, useEffect } from 'react';
import REGL, { InitializationOptions, Regl } from 'regl';

export function useREGL(options: InitializationOptions): Regl | null {
  // re-create Regl instance whenever any option field changes
  const regl = useMemo(
    () => (options.canvas ? REGL(options) : null),
    [options.canvas]
  );

  // regl instance → destroy on unmount or when re-created
  useEffect(() => () => regl?.destroy(), [regl]);

  return regl;
}
