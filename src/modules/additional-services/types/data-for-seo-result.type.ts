import { MonthlySearchType } from 'modules/additional-services/types/monthly-search.type';

export interface DataForSeoResultType {
  keyword: string;
  spell: any;
  location_code: number;
  language_code: any;
  search_partners: boolean;
  competition: string;
  competition_index: number;
  search_volume: number;
  low_top_of_page_bid: any;
  high_top_of_page_bid: any;
  cpc: any;
  monthly_searches: MonthlySearchType[];
}
