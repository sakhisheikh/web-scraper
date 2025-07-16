import type { UrlAnalysis } from '../types/url';
import type { UrlDetail } from '../types/urlDetail';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function handleNetworkError(err: any) {
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    throw new Error('Network error: Backend is unreachable. Please check your connection or try again later.');
  }
  throw err;
}

export async function getUrls(token?: string): Promise<{ urls: UrlAnalysis[] }> {
  try {
    const res = await fetch(`${API_BASE}/urls`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) throw new Error('Failed to fetch URLs');
    return res.json();
  } catch (err) {
    handleNetworkError(err);
    throw err; // for type safety
  }
}

export async function addUrl(url: string, token?: string): Promise<UrlAnalysis> {
  try {
    const res = await fetch(`${API_BASE}/urls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) throw new Error('Failed to add URL');
    return res.json();
  } catch (err) {
    handleNetworkError(err);
    throw err;
  }
}

export async function startUrls(ids: (string|number)[], token?: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/urls/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ids }),
    });
  } catch (err) {
    handleNetworkError(err);
    throw err;
  }
}

export async function stopUrls(ids: (string|number)[], token?: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/urls/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ids }),
    });
  } catch (err) {
    handleNetworkError(err);
    throw err;
  }
}

export async function deleteUrls(ids: (string|number)[], token?: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/urls/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ids }),
    });
  } catch (err) {
    handleNetworkError(err);
    throw err;
  }
}

export async function getUrlDetail(id: string | number, token?: string): Promise<UrlDetail> {
  try {
    const res = await fetch(`${API_BASE}/urls/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) throw new Error('Failed to fetch URL detail');
    return res.json();
  } catch (err) {
    handleNetworkError(err);
    throw err;
  }
} 