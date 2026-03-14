import { useEffect, useState } from 'react';
import { getList, type ListItem } from '../api/portalApi';

export function usePortalList(endpoint: string) {
  const [data, setData] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const items = await getList(endpoint);
        if (active) setData(items);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [endpoint]);

  return { data, loading, error };
}
