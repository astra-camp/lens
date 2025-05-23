import { useState, useEffect, useRef, useCallback } from 'react';

export interface LoaderOptions<T> {
  /** Initial value before loading resolves */
  initialData?: T;
}

export interface LoaderState<T> {
  /** The loaded data, or the initialData before it arrives */
  data: T | undefined;
  /** True while the loader promise is pending */
  loading: boolean;
  /** Any error thrown by the loader */
  error: Error | null;
  /** Manually re-trigger the loader */
  reload: () => void;
}

export function useLoader<T>(
  loaderFn: () => Promise<T>,
  deps: any[] = [],
  options: LoaderOptions<T> = {}
): LoaderState<T> {
  const { initialData } = options;
  const hasLoaded = useRef(false);

  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(initialData === undefined);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    loaderFn()
      .then((result) => {
        setData(result);
        setLoading(false);
        hasLoaded.current = true;
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, deps);

  useEffect(() => {
    if (!hasLoaded.current) {
      reload();
    }
  }, [reload]);

  return { data, loading, error, reload };
}
