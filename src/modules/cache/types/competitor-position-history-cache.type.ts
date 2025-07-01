import { IdType } from 'modules/common/types/id-type.type';

export interface CompetitorPositionHistoryCacheType {
  competitorId: IdType;
  keywordId: IdType;
  fromDate: string;
  toDate: string;
}
