import {useCallback, useEffect, useState} from "react";

export function useAsyncValue<T>(call: () => Promise<T>, deps?: any): [T, {loading: boolean}] {
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState<T|undefined>(undefined);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const result = await call();
      setValue(result);
    } finally {
      setLoading(false)
    }
  }, deps ?? []);

  useEffect(() => {
    reload();
  }, [reload]);

  return [value, {loading}];
}