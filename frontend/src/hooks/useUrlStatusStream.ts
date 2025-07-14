import { useEffect } from 'react';
import type { UrlAnalysis } from '../types/url';

export function useUrlStatusStream(onUpdate: (url: UrlAnalysis) => void) {
  useEffect(() => {
    const eventSource = new EventSource('/api/urls/stream');
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onUpdate(data);
      } catch {}
    };
    return () => eventSource.close();
  }, [onUpdate]);
} 