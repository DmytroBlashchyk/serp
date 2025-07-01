import { IdType } from 'modules/common/types/id-type.type';

export class UpdateKeywordPositionsUsingStandardQueueForBaiduCommand {
  constructor(public readonly keywordIds: IdType[]) {}
}
