import { IdType } from 'modules/common/types/id-type.type';

export class CreateTriggerWithKeywordsCommand {
  constructor(
    public readonly keywordIds: IdType[],
    public readonly triggerId: IdType,
  ) {}
}
