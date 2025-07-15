import type { UrlAnalysis } from '../types/url';
import type { UrlDetail } from '../types/urlDetail';

const API_BASE = '/api';

function handleNetworkError(err: any) {
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    throw new Error('Network error: Backend is unreachable. Please check your connection or try again later.');
  }
  throw err;
}

export async function getUrls(): Promise<{ urls: UrlAnalysis[] }> {
  try {
    const res = await fetch(`${API_BASE}/urls`);
    if (!res.ok) throw new Error('Failed to fetch URLs');
    return res.json();
  } catch (err) {
    handleNetworkError(err);
    throw err; // for type safety
  }
}

export async function addUrl(url: string): Promise<UrlAnalysis> {
  try {
    const res = await fetch(`${API_BASE}/urls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) throw new Error('Failed to add URL');
    return res.json();
  } catch (err) {
    handleNetworkError(err);
    throw err;
  }
}

export async function startUrls(ids: (string|number)[]): Promise<void> {
  try {
    await fetch(`${API_BASE}/urls/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
  } catch (err) {
    handleNetworkError(err);
    throw err;
  }
}

export async function stopUrls(ids: (string|number)[]): Promise<void> {
  try {
    await fetch(`${API_BASE}/urls/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
  } catch (err) {
    handleNetworkError(err);
    throw err;
  }
}

export async function deleteUrls(ids: (string|number)[]): Promise<void> {
  try {
    await fetch(`${API_BASE}/urls/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
  } catch (err) {
    handleNetworkError(err);
    throw err;
  }
}

export async function getUrlDetail(id: string | number): Promise<UrlDetail> {
  try {
    const res = await fetch(`${API_BASE}/urls/${id}`);
    if (!res.ok) throw new Error('Failed to fetch URL detail');
    return res.json();
  } catch (err) {
    handleNetworkError(err);
    throw err;
  }
} 