import { IdType } from 'modules/common/types/id-type.type';

export class UpdateKeywordPositionsUsingStandardQueueForBingCommand {
  constructor(public readonly keywordIds: IdType[]) {}
}
