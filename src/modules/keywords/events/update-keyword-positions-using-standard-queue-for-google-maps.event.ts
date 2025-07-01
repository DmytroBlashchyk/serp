import { IdType } from 'modules/common/types/id-type.type';

export class UpdateKeywordPositionsUsingStandardQueueForGoogleMapsEvent {
  readonly keywordIds: IdType[];
  constructor(
    data: UpdateKeywordPositionsUsingStandardQueueForGoogleMapsEvent,
  ) {
    Object.assign(this, data);
  }
}
