import { IdType } from 'modules/common/types/id-type.type';

export interface ProcessSearchResultType {
  position: number;
  url: string;
  dataCompetitors: {
    position: number;
    id: IdType;
    businessName?: string;
    url?: string;
  }[];
  searchResult: any;
}
