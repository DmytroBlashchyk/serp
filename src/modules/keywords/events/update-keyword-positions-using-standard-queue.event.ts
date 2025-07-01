import { IdType } from 'modules/common/types/id-type.type';

export class UpdateKeywordPositionsUsingStandardQueueEvent {
  readonly keywordIds: IdType[];
  constructor(data: UpdateKeywordPositionsUsingStandardQueueEvent) {
    Object.assign(this, data);
  }
}
