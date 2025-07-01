import { IdType } from 'modules/common/types/id-type.type';

export class AdditionOfKeywordsEvent {
  readonly accountId: IdType;
  readonly numberOfKeywordsToBeAdded: number;
  constructor(data: AdditionOfKeywordsEvent) {
    Object.assign(this, data);
  }
}
