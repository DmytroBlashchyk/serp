import { ItemType } from 'modules/additional-services/types/item.type';

export interface ItemResultType {
  type: string;
  rank_group: number;
  rank_absolute: number;
  position: string;
  xpath: string;
  domain: string;
  title: string;
  url: string;
  cache_url?: string;
  related_search_url?: string;
  breadcrumb: string;
  website_name: string;
  is_image: boolean;
  is_video: boolean;
  is_featured_snippet: boolean;
  is_malicious: boolean;
  is_web_story: boolean;
  description: string;
  pre_snippet: any;
  extended_snippet: string;
  images: any;
  amp_version: boolean;
  rating: any;
  price: any;
  highlighted: string[];
  links: any;
  faq: any;
  extended_people_also_search: any;
  about_this_result: any;
  related_result: any;
  timestamp: any;
  rectangle: any;
  items: ItemType[];
}
