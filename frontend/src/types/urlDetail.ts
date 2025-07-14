import type { UrlAnalysis } from './url';

export interface BrokenLinkDetail {
  url: string;
  statusCode: number;
}

export interface UrlDetail extends UrlAnalysis {
  brokenLinks: BrokenLinkDetail[];
} 