import { IdType } from 'modules/common/types/id-type.type';

export class AdditionOfKeywordsCommand {
  constructor(
    public readonly accountId: IdType,
    public readonly numberOfKeywordsToBeAdded: number,
  ) {}
}
