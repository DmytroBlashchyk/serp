import { IdType } from 'modules/common/types/id-type.type';

export class CreateTriggerWithKeywordsEvent {
  readonly keywordIds: IdType[];
  readonly triggerId: IdType;
  constructor(data: CreateTriggerWithKeywordsEvent) {
    Object.assign(this, data);
  }
}
