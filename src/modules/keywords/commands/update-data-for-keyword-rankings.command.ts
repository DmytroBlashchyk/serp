import { IdType } from 'modules/common/types/id-type.type';

export class UpdateDataForKeywordRankingsCommand {
  constructor(public readonly keywordIds: IdType[]) {}
}
