import { IdType } from 'modules/common/types/id-type.type';

export class UpdateKeywordPositionsUsingStandardQueueForGoogleMapsCommand {
  constructor(public readonly keywordIds: IdType[]) {}
}
