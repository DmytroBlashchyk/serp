import { IdType } from 'modules/common/types/id-type.type';

export class UpdateDataForKeywordRankingsEvent {
  readonly keywordIds: IdType[];
  constructor(data: UpdateDataForKeywordRankingsEvent) {
    Object.assign(this, data);
  }
}
