import { IdType } from 'modules/common/types/id-type.type';

export class UpdateKeywordPositionsUsingStandardQueueForBaiduEvent {
  readonly keywordIds: IdType[];
  constructor(data: UpdateKeywordPositionsUsingStandardQueueForBaiduEvent) {
    Object.assign(this, data);
  }
}
