import { DownloadLinksType } from 'modules/additional-services/types/download-links.type';

export interface ResultSetType {
  id: number;
  started_at: Date;
  ended_at: Date;
  searches_completed: number;
  searches_failed: number;
  download_links: DownloadLinksType;
}
