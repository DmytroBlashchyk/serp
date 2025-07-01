import { IdType } from 'modules/common/types/id-type.type';

export class UpdateKeywordPositionsUsingStandardQueueForBingEvent {
  readonly keywordIds: IdType[];
  constructor(data: UpdateKeywordPositionsUsingStandardQueueForBingEvent) {
    Object.assign(this, data);
  }
}
