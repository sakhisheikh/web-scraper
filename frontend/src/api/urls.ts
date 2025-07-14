import type { UrlAnalysis } from '../types/url';
import type { UrlDetail } from '../types/urlDetail';

const API_BASE = '/api';

export async function getUrls(): Promise<{ urls: UrlAnalysis[] }> {
  const res = await fetch(`${API_BASE}/urls`);
  if (!res.ok) throw new Error('Failed to fetch URLs');
  return res.json();
}

export async function addUrl(url: string): Promise<UrlAnalysis> {
  const res = await fetch(`${API_BASE}/urls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error('Failed to add URL');
  return res.json();
}

export async function startUrls(ids: (string|number)[]): Promise<void> {
  await fetch(`${API_BASE}/urls/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
}

export async function stopUrls(ids: (string|number)[]): Promise<void> {
  await fetch(`${API_BASE}/urls/stop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
}

export async function deleteUrls(ids: (string|number)[]): Promise<void> {
  await fetch(`${API_BASE}/urls/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
}

export async function getUrlDetail(id: string | number): Promise<UrlDetail> {
  const res = await fetch(`${API_BASE}/urls/${id}`);
  if (!res.ok) throw new Error('Failed to fetch URL detail');
  return res.json();
} 