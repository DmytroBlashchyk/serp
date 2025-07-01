import { IdType } from 'modules/common/types/id-type.type';

export class StartOfKeywordUpdateCommand {
  constructor(public readonly keywordIds: IdType[]) {}
}
