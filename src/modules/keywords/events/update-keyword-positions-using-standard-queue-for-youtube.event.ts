import { IdType } from 'modules/common/types/id-type.type';

export class UpdateKeywordPositionsUsingStandardQueueForYoutubeEvent {
  readonly keywordIds: IdType[];
  constructor(data: UpdateKeywordPositionsUsingStandardQueueForYoutubeEvent) {
    Object.assign(this, data);
  }
}
