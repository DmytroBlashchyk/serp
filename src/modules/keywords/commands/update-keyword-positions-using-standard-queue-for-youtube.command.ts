import { IdType } from 'modules/common/types/id-type.type';

export class UpdateKeywordPositionsUsingStandardQueueForYoutubeCommand {
  constructor(public readonly keywordIds: IdType[]) {}
}
