import { IdType } from 'modules/common/types/id-type.type';

export class CreateTriggerInitializationEvent {
  readonly keywordIds: IdType[];
  constructor(data: CreateTriggerInitializationEvent) {
    Object.assign(this, data);
  }
}
