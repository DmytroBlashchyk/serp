import { AboutSearchAndThisResultType } from 'modules/additional-services/types/about-search-and-this-result.type';

export interface OrganicResultType {
  position: number;
  title: string;
  link: string;
  domain: string;
  displayed_link: string;
  snippet: string;
  prerender: boolean;
  cached_page_link: string;
  about_this_result: AboutSearchAndThisResultType;
  date: Date;
  date_utc: Date;
  block_position: number;
}
