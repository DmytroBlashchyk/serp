import { IdType } from 'modules/common/types/id-type.type';

export class UpdateKeywordPositionsUsingStandardQueueCommand {
  constructor(public readonly keywordIds: IdType[]) {}
}
