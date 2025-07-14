import type { UrlAnalysis } from '../types/url';
import type { UrlItem } from '../components/RunningUrlsTable';

export function mapStatus(status: string): UrlItem['status'] {
  switch (status) {
    case 'queued':
    case 'running':
    case 'done':
    case 'error':
    case 'stopped':
      return status;
    default:
      return 'queued';
  }
}

export function mapUrlAnalysisToUrlItem(u: UrlAnalysis): UrlItem {
  let brokenLinks: any[] = [];
  if (Array.isArray(u.brokenLinks)) {
    brokenLinks = u.brokenLinks;
  } else if (typeof u.brokenLinks === 'string' && u.brokenLinks.trim()) {
    try {
      brokenLinks = JSON.parse(u.brokenLinks);
      if (!Array.isArray(brokenLinks)) brokenLinks = [];
    } catch {
      brokenLinks = [];
    }
  }
  return {
    id: String(u.id),
    url: u.url,
    status: mapStatus(u.status),
    title: u.pageTitle || '',
    htmlVersion: u.htmlVersion || '',
    headings: {
      h1: u.h1Count ?? 0,
      h2: u.h2Count ?? 0,
      h3: u.h3Count ?? 0,
      h4: u.h4Count ?? 0,
      h5: u.h5Count ?? 0,
      h6: u.h6Count ?? 0,
    },
    internalLinks: u.internalLinkCount ?? 0,
    externalLinks: u.externalLinkCount ?? 0,
    brokenLinks,
    hasLoginForm: !!u.hasLoginForm,
  };
} 