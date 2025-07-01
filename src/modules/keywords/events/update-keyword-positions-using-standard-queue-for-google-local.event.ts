import { IdType } from 'modules/common/types/id-type.type';

export class UpdateKeywordPositionsUsingStandardQueueForGoogleLocalEvent {
  readonly keywordIds: IdType[];
  constructor(
    data: UpdateKeywordPositionsUsingStandardQueueForGoogleLocalEvent,
  ) {
    Object.assign(this, data);
  }
}
