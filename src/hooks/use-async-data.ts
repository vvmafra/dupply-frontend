import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DependencyList,
  type Dispatch,
  type SetStateAction,
} from "react";

export interface UseAsyncDataOptions {
  /** When false the loader is not called and `loading` stays false. Default true. */
  enabled?: boolean;
}

export interface UseAsyncDataResult<T> {
  /** Last resolved value, or null before the first load / after an error. */
  data: T | null;
  /** True while a load is in flight (starts true when enabled). */
  loading: boolean;
  /** Error thrown by the last load, if any. */
  error: unknown;
  /** Run the loader again (keeps the current `data` until it resolves). */
  reload: () => Promise<void>;
  /** Replace `data` locally, e.g. after a mutation that already returned the fresh row. */
  setData: Dispatch<SetStateAction<T | null>>;
}

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: unknown;
}

/**
 * Loads async data on mount and whenever `deps` change.
 *
 * Replaces the `useState(loading) + useEffect + fetch().then(...)` block that
 * every page used to repeat. Out-of-order responses are ignored (only the
 * latest request updates state) and errors are captured instead of leaving
 * the page stuck in "loading".
 */
export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: DependencyList,
  options: UseAsyncDataOptions = {},
): UseAsyncDataResult<T> {
  const enabled = options.enabled ?? true;
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const requestIdRef = useRef(0);
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: enabled,
    error: null,
  });

  const reload = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const data = await loaderRef.current();
      if (requestId === requestIdRef.current) {
        setState({ data, loading: false, error: null });
      }
    } catch (error) {
      if (requestId === requestIdRef.current) {
        setState((prev) => ({ ...prev, loading: false, error }));
      }
    }
  }, []);

  const setData = useCallback<Dispatch<SetStateAction<T | null>>>((next) => {
    setState((prev) => ({
      ...prev,
      data: typeof next === "function" ? (next as (current: T | null) => T | null)(prev.data) : next,
    }));
  }, []);

  useEffect(() => {
    if (!enabled) {
      requestIdRef.current += 1;
      setState((prev) => (prev.loading ? { ...prev, loading: false } : prev));
      return;
    }
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, reload, ...deps]);

  return { data: state.data, loading: state.loading, error: state.error, reload, setData };
}
