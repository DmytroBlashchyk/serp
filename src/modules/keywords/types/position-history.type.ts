import { IdType } from 'modules/common/types/id-type.type';
import { TemporalFiltersEnum } from 'modules/projects/enums/temporal-filters.enum';
import { UserPayload } from 'modules/common/types/user-payload.type';

export interface PositionHistoryType {
  keywordId: IdType;
  accountId: IdType;
  userId?: IdType;
  period: TemporalFiltersEnum;
  competitorIds?: IdType[];
}
