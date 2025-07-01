import { IdType } from 'modules/common/types/id-type.type';

export class StartOfKeywordUpdateEvent {
  readonly keywordIds: IdType[];
  constructor(data: StartOfKeywordUpdateEvent) {
    Object.assign(this, data);
  }
}
