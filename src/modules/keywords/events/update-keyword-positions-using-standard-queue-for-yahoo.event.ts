import { IdType } from 'modules/common/types/id-type.type';

export class UpdateKeywordPositionsUsingStandardQueueForYahooEvent {
  readonly keywordIds: IdType[];
  constructor(data: UpdateKeywordPositionsUsingStandardQueueForYahooEvent) {
    Object.assign(this, data);
  }
}
