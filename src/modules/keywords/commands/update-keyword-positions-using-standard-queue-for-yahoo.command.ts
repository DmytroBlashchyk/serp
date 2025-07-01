import { IdType } from 'modules/common/types/id-type.type';

export class UpdateKeywordPositionsUsingStandardQueueForYahooCommand {
  constructor(public readonly keywordIds: IdType[]) {}
}
