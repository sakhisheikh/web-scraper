export type CrawlStatus = 'queued' | 'running' | 'done' | 'error';

export interface BrokenLink {
  url: string;
  status: number;
}

export interface UrlAnalysis {
  id: number;
  url: string;
  status: string;
  htmlVersion: string;
  pageTitle: string;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  h4Count: number;
  h5Count: number;
  h6Count: number;
  internalLinkCount: number;
  externalLinkCount: number;
  inaccessibleLinkCount: number;
  brokenLinks: string; // JSON string or array, depending on backend
  hasLoginForm: boolean;
  createdAt?: string;
  updatedAt?: string;
} 