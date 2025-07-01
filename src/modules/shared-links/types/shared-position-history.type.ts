import { IdType } from 'modules/common/types/id-type.type';
import { TemporalFiltersEnum } from 'modules/projects/enums/temporal-filters.enum';

export interface SharedPositionHistoryType {
  link: string;
  keywordId: IdType;
  period: TemporalFiltersEnum;
  competitorIds?: IdType[];
}
