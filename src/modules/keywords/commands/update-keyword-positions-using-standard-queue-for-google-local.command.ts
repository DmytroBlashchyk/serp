import { IdType } from 'modules/common/types/id-type.type';

export class UpdateKeywordPositionsUsingStandardQueueForGoogleLocalCommand {
  constructor(public readonly keywordIds: IdType[]) {}
}
